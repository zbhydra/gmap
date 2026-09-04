#!/usr/bin/env python3
# E12f: 生效态下的两路对拍 —— 先常规 pb canary 确认视口生效, 再浏览器级 pb 同视口, 比_fid 集合
import json, re, subprocess, sys, time, urllib.parse
sys.path.insert(0, "<REDACTED_PATH>/scripts")
from rpc_v2 import TAIL
from e3_preview_place import mint_nid, SOCS

P_BASE = "user-session-{sess}:<REDACTED>@proxy.example:1080"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0"
KW = "coffee shop"
FID_RE = re.compile(r"^0x[0-9a-f]{12,20}:0x[0-9a-f]{12,20}$")

def get(obj, path):
    cur = obj
    for i in path:
        try:
            cur = cur[i]
        except (IndexError, TypeError, KeyError):
            return None
    return cur if cur != "" else None

def curl_json(url, sess, cookie):
    for attempt in range(3):
        cmd = ["curl", "-s", "-m", "75", "-x", "socks5h://" + P_BASE.format(sess=sess), "-A", UA,
               "-H", "Accept-Language: en-US,en;q=0.9",
               "-H", "Accept-Encoding: gzip", "--compressed",
               "-w", "\n__META__%{http_code}|%{size_download}"]
        if cookie:
            cmd += ["-b", cookie]
        cmd.append(url)
        r = subprocess.run(cmd, capture_output=True, text=True)
        body, _, meta = r.stdout.rpartition("__META__")
        if body and body.startswith(")]}'") and "\n" in body:
            try:
                return (meta.split("|") + [""])[0], json.loads(body[body.index("\n") + 1:], strict=False)
            except Exception:
                pass
        time.sleep(2 + attempt * 2)
    return "err", None

def find_blocks(o, hits, depth=0):
    if depth > 12 or len(hits) > 400:
        return
    if isinstance(o, list):
        if isinstance(get(o, [11]), str) and isinstance(get(o, [10]), str) and FID_RE.match(get(o, [10])):
            hits.append(o)
        for x in o:
            find_blocks(x, hits, depth + 1)

def center_of(recs):
    lats = [r["lat"] for r in recs if r["lat"] is not None]
    lngs = [r["lng"] for r in recs if r["lng"] is not None]
    return (round(sum(lats)/len(lats), 3), round(sum(lngs)/len(lngs), 3)) if lats else None

def parse_regular(jd):
    items = jd[0][1] if isinstance(jd, list) and jd and isinstance(jd[0], list) else None
    out = {}
    if not isinstance(items, list):
        return out
    for arr in items[1:]:
        if not isinstance(arr, list) or not (len(arr) > 14 and isinstance(arr[14], list)):
            continue
        b = arr[14]
        fid = get(b, [10])
        if fid and fid not in out:
            out[fid] = {"title": get(b, [11]), "fid": fid, "lat": get(b, [9, 2]), "lng": get(b, [9, 3])}
    return out

def parse_browser(jd):
    blocks = []
    find_blocks(jd, blocks)
    out = {}
    for b in blocks:
        fid = get(b, [10])
        if fid and fid not in out:
            out[fid] = {"title": get(b, [11]), "fid": fid, "lat": get(b, [9, 2]), "lng": get(b, [9, 3])}
    return out

VP_RE = r"!1d[\d.]+!2d-?[\d.]+!3d-?[\d.]+"
RAW_BROWSER = open("<REDACTED_PATH>/browser_search_url.txt").read().strip()
BROWSER_PB = urllib.parse.unquote(re.search(r"[?&]pb=([^&]+)", RAW_BROWSER).group(1))
BROWSER_PB = re.sub(r"^!1s[^!]*", "!1s{kw}", BROWSER_PB)
assert re.search(VP_RE, BROWSER_PB)

def search_regular(sess, ck, d, lng, lat):
    vpb = f"!4m12!1m3!1d{d}!2d{lng}!3d{lat}!2m3!1f0!2f0!3f0!3m2!1i600!2i800!4f13.0"
    url = (f"https://maps.google.com/search?authuser=0&hl=en"
           f"&pb={vpb}%217i20%218i20{TAIL}&q={urllib.parse.quote_plus(KW)}")
    code, jd = curl_json(url, sess, ck)
    return parse_regular(jd) if jd else {}

def search_browser(sess, ck, d, lng, lat):
    pb = BROWSER_PB.replace("{kw}", urllib.parse.quote_plus(KW))
    pb = re.sub(VP_RE, f"!1d{d}!2d{lng}!3d{lat}", pb, count=1)
    url = ("https://www.google.com/search?tbm=map&authuser=0&hl=en&gl=us"
           f"&q={urllib.parse.quote_plus(KW)}&pb={urllib.parse.quote(pb, safe='!')}")
    code, jd = curl_json(url, sess, ck)
    return parse_browser(jd) if jd else {}

def main():
    nid = mint_nid()
    ck = f"SOCS={SOCS}; NID={nid}" if nid else None
    print("NID:", "yes" if nid else "FAILED", flush=True)
    out = {}
    for sess in ("e12fA", "e12fB"):
        for city, (d, lng, lat) in {"portland": (20000.0, -122.676, 45.523),
                                    "miami": (20000.0, -80.21, 25.79)}.items():
            # canary: 常规 pb 确认视口生效
            reg = search_regular(sess, ck, d, lng, lat)
            c1 = center_of(list(reg.values()))
            hit = bool(c1 and abs(c1[0] - lat) <= 1.0 and abs(c1[1] - lng) <= 1.0)
            print(f"[{sess}/{city}] canary regular: n={len(reg)} center={c1} hit={hit}", flush=True)
            if not hit:
                out.setdefault(sess, {})[city] = {"canary_hit": False}
                time.sleep(1.5)
                continue
            brs = search_browser(sess, ck, d, lng, lat)
            c2 = center_of(list(brs.values()))
            inter = set(reg) & set(brs)
            uni = set(reg) | set(brs)
            j = len(inter) / len(uni) if uni else 0
            print(f"[{sess}/{city}] browser: n={len(brs)} center={c2} common={len(inter)} jaccard={j:.2f}", flush=True)
            print(f"  reg sample:  {[r['title'] for r in list(reg.values())[:3]]}", flush=True)
            print(f"  brow sample: {[r['title'] for r in list(brs.values())[:3]]}", flush=True)
            out.setdefault(sess, {})[city] = {
                "canary_hit": True, "regular_n": len(reg), "regular_center": c1,
                "browser_n": len(brs), "browser_center": c2,
                "common_fids": len(inter), "jaccard": round(j, 3),
                "common_titles": [reg[f]["title"] for f in inter][:6]}
            time.sleep(1.5)
    json.dump(out, open("<REDACTED_PATH>/data/e12f_ll_pair.json", "w"),
              ensure_ascii=False, indent=1)
    print("saved -> e12f_ll_pair.json", flush=True)

if __name__ == "__main__":
    main()
