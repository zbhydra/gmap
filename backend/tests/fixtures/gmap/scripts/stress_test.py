#!/usr/bin/env python3
# 压力测试:新架构全链路(常规 pb+NID 批量 / 浏览器 pb 批量 owner / 抽样 L2) → 竞品 36 列 CSV
# 用法: .venv/bin/python stress/stress_test.py --limit 3 --tag mini
#       .venv/bin/python stress/stress_test.py --limit 500 --tag batch500
import argparse, concurrent.futures, csv, json, os, re, subprocess, threading, time, urllib.parse
from pathlib import Path
sys_path = str(Path(__file__).resolve().parent)
import sys
sys.path.insert(0, sys_path)
from rpc_v2 import BASE, TAIL, get, walk_find, KGMID_RE, parse_details
from e3_preview_place import PLACE_PB, SOCS, mint_nid

PROXY = "<REDACTED>"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0"
DEPTH = 10
THREADS = 6
PAGE_DELAY = 0.8
L2_SAMPLE = 3
NID_TTL = 30 * 60

FID_RE = re.compile(r"^0x[0-9a-f]{12,20}:0x[0-9a-f]{12,20}$")

CSV_HEADERS = ["Name", "Fulladdress", "Street", "Municipality", "Categories", "About",
               "Phone", "Phones", "Claimed", "Owner", "Owner Id", "Owner Link",
               "Review Count", "Average Rating", "Review URL", "Cid", "Fid",
               "Latitude", "Longitude", "Featured Image", "Time Zone", "Website",
               "Domain", "Opening Hours", "Google Knowledge URL", "Kgmid",
               "Google Maps URL", "Place Id", "Emails", "Facebook Links",
               "Instagram Links", "Youtube Links", "Tiktok Links", "Linkedin Links",
               "Twitter Links", "Search Keyword"]

class NidPool:
    def __init__(self, size=3):
        self.size = size
        self.slots = [{"v": None, "at": 0.0} for _ in range(size)]
        self.rr = 0
        self.lock = threading.Lock()

    def get(self):
        with self.lock:
            s = self.slots[self.rr % self.size]
            self.rr += 1
            if s["v"] and time.time() - s["at"] < NID_TTL:
                return s["v"]
        nid = mint_nid()
        if nid:
            with self.lock:
                s["v"] = nid
                s["at"] = time.time()
            return nid
        with self.lock:
            return s["v"]

# 浏览器 pb 模板:换词 + 全球视口
_bu = (Path(__file__).resolve().parent.parent / "browser_search_url.txt").read_text().strip()
BROWSER_PB_TEMPLATE = urllib.parse.unquote(re.search(r"[?&]pb=([^&]+)", _bu).group(1))
BROWSER_PB_TEMPLATE = re.sub(r"^!1s[^!]*", "!1s{kw}", BROWSER_PB_TEMPLATE)
BROWSER_PB_TEMPLATE = re.sub(r"!1d[\d.]+!2d-?[\d.]+!3d-?[\d.]+",
                             "!1d25000000!2d0!3d0", BROWSER_PB_TEMPLATE, count=1)

def curl_get(url, cookie, timeout=30):
    cmd = ["curl", "-s", "-m", str(timeout), "-x", PROXY, "-A", UA,
           "-H", "Accept-Language: en-US,en;q=0.9",
           "-H", "Accept-Encoding: gzip", "--compressed",
           "-w", "\n__META__%{http_code}|%{size_download}"]
    if cookie:
        cmd += ["-b", cookie]
    cmd.append(url)
    r = subprocess.run(cmd, capture_output=True, text=True)
    body, _, meta = r.stdout.rpartition("__META__")
    code, size = (meta.split("|") + [""])[:2] if meta else ("", "")
    return code, int(size or 0), body

def rpc_json(body):
    if body and body.startswith(")]}'") and "\n" in body:
        return json.loads(body[body.index("\n") + 1:])
    return None

def parse_l1_full(arr):
    """常规 pb 的 business 块(arr[14])全字段解析(基础 + 富变体扩展位)"""
    b = get(arr, [14])
    if not isinstance(b, list):
        return None
    kg = walk_find(arr, lambda s: bool(KGMID_RE.match(s)), limit=1)
    muni = [get(b, [183, 1, i]) for i in range(0, 7)]
    return {
        "title":      get(b, [11]),
        "categories": [str(x) for x in (get(b, [13]) or [])],
        "website":    get(b, [7, 0]),
        "phone":      get(b, [178, 0, 0]),
        "rating":     get(b, [4, 7]),
        "review_count": get(b, [4, 8]),
        "review_url": get(b, [4, 3, 0]),
        "fulladdress": ", ".join(str(x) for x in (get(b, [2]) or [])) if isinstance(get(b, [2]), list) else None,
        "latitude":   get(b, [9, 2]),
        "longitude":  get(b, [9, 3]),
        "timezone":   get(b, [30]),
        "fid":        get(b, [10]),
        "kgmid":      kg[0] if kg else None,
        "street":     muni[1] if len(muni) > 1 else None,
        "muni_parts": muni,
        "place_id":   get(b, [78]),
        "hours_raw":  get(b, [203, 0]),
    }

def l1_regular(kw, nid, stats):
    cookie = f"SOCS={SOCS}; NID={nid}" if nid else f"SOCS={SOCS}"
    enc = urllib.parse.quote_plus(kw)
    rows, fails = [], 0
    for p in range(1, DEPTH + 1):
        code, size, body = curl_get(f"{BASE}%217i20%218i{20*(p-1)}{TAIL}&q={enc}", cookie)
        with stats["lock"]:
            stats["bytes"] += size
        data = rpc_json(body)
        if data is None:
            fails += 1
            if fails >= 3:
                break
            continue
        items = get(get(data, [0]) or [], [1]) or []
        if len(items) < 2:
            break
        new = 0
        for arr in items[1:]:
            if isinstance(arr, list):
                rec = parse_l1_full(arr)
                if rec and rec.get("fid"):
                    rows.append(rec)
                    new += 1
        if new == 0:
            break
        time.sleep(PAGE_DELAY)
    return rows, fails

def find_blocks(o, hits, depth=0):
    if depth > 12 or len(hits) > 400:
        return
    if isinstance(o, list):
        if isinstance(get(o, [11]), str) and isinstance(get(o, [10]), str) and FID_RE.match(get(o, [10])):
            hits.append(o)
        for x in o:
            find_blocks(x, hits, depth + 1)

def l1_browser(kw, nid, stats, target=20, regular_fids=None):
    """单次全量:!7i=『返回前 N 条』;按与常规 pb 的 fid 重合度自适应放大重试,跨次累积"""
    cookie = f"SOCS={SOCS}; NID={nid}" if nid else f"SOCS={SOCS}"
    n_val = max(20, ((target + 19) // 20) * 20)
    acc = {}
    for attempt in range(4):
        pb = BROWSER_PB_TEMPLATE.replace("{kw}", urllib.parse.quote_plus(kw))
        pb = pb.replace("!7i20", f"!7i{n_val}", 1)
        url = ("https://www.google.com/search?tbm=map&authuser=0&hl=en&gl=us"
               f"&q={urllib.parse.quote_plus(kw)}&pb={urllib.parse.quote(pb, safe='!')}")
        data = None
        for rt in range(3):
            code, size, body = curl_get(url, cookie, timeout=60)
            with stats["lock"]:
                stats["bytes"] += size
            data = rpc_json(body)
            if data is not None:
                break
            time.sleep(2 + rt * 2)
        with stats["lock"]:
            stats["browser_calls"] += 1
        if data is None:
            with stats["lock"]:
                stats["browser_fail"] += 1
            n_val += 60
            continue
        blocks = []
        find_blocks(data, blocks)
        for b in blocks:
            fid = get(b, [10])
            if fid and fid not in acc:
                acc[fid] = {
                    "fid": fid,
                    "owner_name": get(b, [57, 1]),
                    "owner_id": get(b, [57, 2]),
                    "thumbnail": get(b, [72, 0, 1, 6, 0]),
                    "about_raw": get(b, [100, 1]),
                    "phones_alt": get(b, [178, 0, 1]),
                    "rc_browser": get(b, [4, 8]),
                }
        if regular_fids is not None:
            covered = sum(1 for f in regular_fids if f in acc)
            if covered >= len(regular_fids) * 0.95:
                break
        n_val += 60
        time.sleep(1)
    return list(acc.values())

def l2_detail(fid, nid, stats):
    cookie = f"SOCS={SOCS}; NID={nid}" if nid else f"SOCS={SOCS}"
    pb = PLACE_PB.format(fid=fid)
    url = ("https://www.google.com/maps/preview/place"
           f"?authuser=0&hl=en&gl=us&pb={urllib.parse.quote(pb, safe='!')}")
    code, size, body = curl_get(url, cookie)
    with stats["lock"]:
        stats["bytes"] += size
        stats["l2_calls"] += 1
    data = rpc_json(body)
    if data is None or not isinstance(get(data, [6]), list):
        return None
    d = parse_details(data)
    d["rpr"] = get(get(data, [6]), [175, 3])
    return d

def fmt_about(raw):
    if not isinstance(raw, list):
        return None
    groups = []
    for g in raw:
        if not isinstance(g, list) or len(g) < 3:
            continue
        label = g[1]
        vals = [v[1] for v in (g[2] or []) if isinstance(v, list) and len(v) > 1 and v[1]]
        if label and vals:
            groups.append(f"{label}: [{', '.join(str(x) for x in vals)}]")
    return ", ".join(groups) if groups else None

def fmt_hours(raw):
    if not isinstance(raw, list):
        return None
    days = []
    for d in raw:
        if not isinstance(d, list) or len(d) < 4:
            continue
        name, date = d[0], d[2]
        periods = [str(p[0]) for p in (d[3] or []) if isinstance(p, list) and p]
        ds = f"{date[0]}-{date[1]:02d}-{date[2]:02d}" if isinstance(date, list) and len(date) == 3 else ""
        body = ", ".join(periods) if periods else "Closed"
        days.append(f"{name}({ds}): [{body}]")
    return ", ".join(days) if days else None

def strip_proto(u):
    return re.sub(r"^https?://", "", str(u), flags=re.I) if u else None

def domain_of(u):
    s = strip_proto(u)
    return s.split("/")[0].split("?")[0] if s else None

def build_municipality(parts):
    # parts = [区, 街道, 城市, 邮编, 州, 国, ...] → "City, ST 12345"
    if not isinstance(parts, list):
        return None
    city, zips, state = parts[2] if len(parts) > 2 else None, \
        parts[3] if len(parts) > 3 else None, parts[4] if len(parts) > 4 else None
    if city and state and zips:
        return f"{city}, {state} {zips}"
    tail = [str(x) for x in parts[2:6] if x]
    return ", ".join(tail) if tail else None

def merge_keyword(kw, uniq, br, l2_map):
    bmap = {r["fid"]: r for r in br}
    out = []
    for r in uniq:
        fid = r["fid"]
        b = bmap.get(fid, {})
        fa = re.sub(r", United States$", "", r.get("fulladdress") or "")
        cid = None
        try:
            cid = int(fid.split(":")[1], 16)
        except Exception:
            pass
        owner_id = b.get("owner_id")
        muni = build_municipality(r.get("muni_parts"))
        rec = {
            "Name": r.get("title"),
            "Fulladdress": fa if fa else None,
            "Street": r.get("street"),
            "Municipality": muni,
            "Categories": ", ".join(r["categories"]) if r.get("categories") else None,
            "About": fmt_about(b.get("about_raw")),
            "Phone": r.get("phone"),
            "Phones": ", ".join(str(p[0]) for p in (b.get("phones_alt") or []) if isinstance(p, list) and p),
            "Claimed": ("YES" if owner_id else "NO") if fid in bmap else "",
            "Owner": b.get("owner_name"),
            "Owner Id": owner_id,
            "Owner Link": f"https://www.google.com/maps/contrib/{owner_id}" if owner_id else None,
            "Review Count": r.get("review_count") or b.get("rc_browser"),
            "Average Rating": r.get("rating"),
            "Review URL": r.get("review_url"),
            "Cid": cid,
            "Fid": fid,
            "Latitude": r.get("latitude"),
            "Longitude": r.get("longitude"),
            "Featured Image": b.get("thumbnail"),
            "Time Zone": r.get("timezone"),
            "Website": strip_proto(r.get("website")),
            "Domain": domain_of(r.get("website")),
            "Opening Hours": fmt_hours(r.get("hours_raw")),
            "Google Knowledge URL": f"https://www.google.com/search?kgmid={r['kgmid']}" if r.get("kgmid") else None,
            "Kgmid": r.get("kgmid"),
            "Google Maps URL": f"https://www.google.com/maps?cid={cid}" if cid else None,
            "Place Id": r.get("place_id"),
            "Emails": "",
            "Facebook Links": "", "Instagram Links": "", "Youtube Links": "",
            "Tiktok Links": "", "Linkedin Links": "", "Twitter Links": "",
            "Search Keyword": kw,
        }
        if fa and ", " in fa:
            seg = fa.split(", ")
            rec["Street"] = seg[0]
            rec["Municipality"] = ", ".join(seg[1:]) if len(seg) > 1 else None
        if not rec.get("Street"):
            rec["Street"] = r.get("street")
        if not rec.get("Municipality"):
            rec["Municipality"] = muni
        l2 = l2_map.get(fid)
        if l2:
            rec["_rpr"] = l2.get("rpr")
            for col, key in (("Review Count", "review_count"), ("Average Rating", "rating"),
                             ("Phone", "phone"), ("Place Id", "place_id"),
                             ("Fulladdress", "address")):
                if not rec.get(col) and l2.get(key):
                    rec[col] = l2[key]
        else:
            rec["_rpr"] = None
        out.append(rec)
    return out

def process_keyword(kw, pool, stats, outdir):
    t0 = time.time()
    nid = pool.get()
    l1r, fails = l1_regular(kw, nid, stats)
    seen, uniq = set(), []
    for r in l1r:
        if r["fid"] not in seen:
            seen.add(r["fid"])
            uniq.append(r)
    pages_done = min(10, max(1, (len(uniq) + 19) // 20))
    br = l1_browser(kw, nid, stats, target=len(uniq), regular_fids=seen)
    l2_map = {}
    for r in uniq[:L2_SAMPLE]:
        l2 = l2_detail(r["fid"], nid, stats)
        if l2:
            l2_map[r["fid"]] = l2
        time.sleep(PAGE_DELAY)
    rows = merge_keyword(kw, uniq, br, l2_map)
    safe = re.sub(r"[^A-Za-z0-9]+", "_", kw)[:60]
    with open(f"{outdir}/{safe}.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(CSV_HEADERS)
        for rec in rows:
            w.writerow([rec.get(h) if rec.get(h) is not None else "" for h in CSV_HEADERS])
    json.dump({"kw": kw, "n": len(rows), "records": rows},
              open(f"{outdir}/{safe}.json", "w"), ensure_ascii=False, indent=1)
    return {"kw": kw, "n": len(rows), "secs": round(time.time() - t0, 1),
            "l2": len(l2_map),
            "owner_fill": sum(1 for r in rows if r.get("Owner Id")),
            "claimed_cov": sum(1 for r in rows if r.get("Claimed") in ("YES", "NO")),
            "rc_fill": sum(1 for r in rows if r.get("Review Count")),
            "claimed_yes": sum(1 for r in rows if r.get("Claimed") == "YES"),
            "hours_fill": sum(1 for r in rows if r.get("Opening Hours")),
            "placeid_fill": sum(1 for r in rows if r.get("Place Id")),
            "records": rows}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=500)
    ap.add_argument("--tag", default="batch")
    ap.add_argument("--offset", type=int, default=0)
    a = ap.parse_args()
    outdir = f"<REDACTED_PATH>/stress/{a.tag}"
    os.makedirs(outdir, exist_ok=True)
    kws = [l.strip() for l in open("<REDACTED_PATH>/keywords.txt") if l.strip()]
    kws = kws[a.offset:a.offset + a.limit]
    print(f"keywords={len(kws)} depth={DEPTH} threads={THREADS} out={outdir}", flush=True)
    print("browser_pb_head:", BROWSER_PB_TEMPLATE[:100], flush=True)
    pool = NidPool(3)
    stats = {"lock": threading.Lock(), "bytes": 0, "browser_calls": 0,
             "browser_fail": 0, "l2_calls": 0}
    results = []
    t0 = time.time()

    def work(i_kw):
        i, kw = i_kw
        try:
            rec = process_keyword(kw, pool, stats, outdir)
        except Exception as e:
            import traceback
            print(f"ERR [{kw}]: {traceback.format_exc(-3)}", flush=True)
            rec = {"kw": kw, "error": f"{type(e).__name__}: {e}"}
        with stats["lock"]:
            results.append(rec)
            done = len(results)
            if done % 25 == 0 or done == len(kws):
                el = time.time() - t0
                ok = [r for r in results if "error" not in r]
                if ok:
                    print(f"[{done}/{len(kws)}] {el:.0f}s | 失败词 {done-len(ok)} | "
                          f"均条 {sum(r['n'] for r in ok)/len(ok):.0f} | "
                          f"均rc {sum(r['rc_fill'] for r in ok)/len(ok):.0f} | "
                          f"均owner {sum(r['owner_fill'] for r in ok)/len(ok):.0f} | "
                          f"均claimed_yes {sum(r['claimed_yes'] for r in ok)/len(ok):.0f}", flush=True)
        return rec

    with concurrent.futures.ThreadPoolExecutor(max_workers=THREADS) as ex:
        list(ex.map(work, enumerate(kws)))
    ok = [r for r in results if "error" not in r]
    summary = {
        "tag": a.tag, "limit": a.limit, "depth": DEPTH, "threads": THREADS,
        "wall_min": round((time.time() - t0) / 60, 1),
        "kw_total": len(kws), "kw_failed": len(results) - len(ok),
        "records": sum(r["n"] for r in ok),
        "rc_fill": sum(r["rc_fill"] for r in ok),
        "owner_fill": sum(r["owner_fill"] for r in ok),
        "claimed_yes": sum(r["claimed_yes"] for r in ok),
        "hours_fill": sum(r["hours_fill"] for r in ok),
        "placeid_fill": sum(r["placeid_fill"] for r in ok),
        "l2_calls": sum(r["l2"] for r in ok),
        "bytes_mb": round(stats["bytes"] / 1e6, 1),
        "browser_calls": stats["browser_calls"], "browser_fail": stats["browser_fail"],
        "claimed_cov": sum(r["claimed_cov"] for r in ok),
        "per_keyword": [{k: r[k] for k in ("kw", "n", "secs", "rc_fill", "owner_fill",
                                           "claimed_yes", "claimed_cov", "hours_fill",
                                           "placeid_fill", "l2")
                         if k in r} for r in results],
    }
    json.dump(summary, open(f"{outdir}/summary.json", "w"), ensure_ascii=False, indent=1)
    print("SUMMARY:", json.dumps({k: v for k, v in summary.items() if k != "per_keyword"},
                                 ensure_ascii=False), flush=True)

if __name__ == "__main__":
    main()
