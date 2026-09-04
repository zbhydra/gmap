#!/usr/bin/env python3
# E12d: 浏览器级 pb 视口注入 —— 验证浏览器 pb 的坐标块同样锚定地理,与常规 pb 结果范围对拍
import json, re, subprocess, sys, time, urllib.parse
sys.path.insert(0, "<REDACTED_PATH>/scripts")
from rpc_v2 import TAIL
from e3_preview_place import mint_nid, SOCS

PROXY = "<REDACTED>"
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

def curl_json(url, cookie):
    for attempt in range(3):
        cmd = ["curl", "-s", "-m", "75", "-x", PROXY, "-A", UA,
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
                jd = json.loads(body[body.index("\n") + 1:], strict=False)
                return (meta.split("|") + [""])[0], jd
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

def parse_blocks(jd):
    blocks = []
    find_blocks(jd, blocks)
    out = {}
    for b in blocks:
        fid = get(b, [10])
        if fid and fid not in out:
            try:
                lat, lng = b[9][2], b[9][3]
            except (IndexError, TypeError):
                lat = lng = None
            out[fid] = {"title": get(b, [11]), "fid": fid, "lat": lat, "lng": lng}
    return out

RAW_BROWSER = open("<REDACTED_PATH>/browser_search_url.txt").read().strip()
BROWSER_PB = urllib.parse.unquote(re.search(r"[?&]pb=([^&]+)", RAW_BROWSER).group(1))
BROWSER_PB = re.sub(r"^!1s[^!]*", "!1s{kw}", BROWSER_PB)
VP_RE = r"!1d[\d.]+!2d-?[\d.]+!3d-?[\d.]+"
assert re.search(VP_RE, BROWSER_PB), "viewport not found"

def agg(recs):
    lats = [r["lat"] for r in recs.values() if r["lat"] is not None]
    lngs = [r["lng"] for r in recs.values() if r["lng"] is not None]
    if not lats:
        return None
    return (round(sum(lats)/len(lats), 3), round(sum(lngs)/len(lngs), 3))

def run_browser(tag, diameter, lat, lng, ck):
    pb = BROWSER_PB.replace("{kw}", urllib.parse.quote_plus(KW))
    pb = re.sub(VP_RE, f"!1d{diameter}!2d{lng}!3d{lat}", pb, count=1)
    url = ("https://www.google.com/search?tbm=map&authuser=0&hl=en&gl=us"
           f"&q={urllib.parse.quote_plus(KW)}&pb={urllib.parse.quote(pb, safe='!')}")
    code, jd = curl_json(url, ck)
    recs = parse_blocks(jd) if jd else {}
    center = agg(recs)
    print(f"[browser/{tag}] http={code} n={len(recs)} center={center}", flush=True)
    print(f"  sample: {[r['title'] for r in list(recs.values())[:3]]}", flush=True)
    return recs

def run_regular(tag, diameter, lat, lng, ck):
    vp = f"!4m12!1m3!1d{diameter}!2d{lng}!3d{lat}!2m3!1f0!2f0!3f0!3m2!1i600!2i800!4f13.0"
    url = (f"https://maps.google.com/search?authuser=0&hl=en"
           f"&pb={vp}%217i20%218i20{TAIL}&q={urllib.parse.quote_plus(KW)}")
    code, jd = curl_json(url, ck)
    items = get(jd, [0, 1]) or []
    recs = {}
    for arr in items[1:]:
        if not isinstance(arr, list) or not (len(arr) > 14 and isinstance(arr[14], list)):
            continue
        b = arr[14]
        fid = get(b, [10])
        if fid and fid not in recs:
            recs[fid] = {"title": get(b, [11]), "fid": fid,
                         "lat": get(b, [9, 2]), "lng": get(b, [9, 3])}
    center = agg(recs)
    print(f"[regular/{tag}] http={code} n={len(recs)} center={center}", flush=True)
    print(f"  sample: {[r['title'] for r in list(recs.values())[:3]]}", flush=True)
    return recs

def main():
    nid = mint_nid()
    ck = f"SOCS={SOCS}; NID={nid}" if nid else None
    print("NID:", "yes" if nid else "FAILED", flush=True)
    out = {}
    for tag, (d, la, lo) in {"portland": (20000.0, -122.676, 45.523),
                             "miami": (20000.0, -80.21, 25.79)}.items():
        reg = run_regular(tag, d, la, lo, ck)
        time.sleep(1.5)
        brs = run_browser(tag, d, la, lo, ck)
        inter = set(reg) & set(brs)
        uni = set(reg) | set(brs)
        j = len(inter) / len(uni) if uni else 0
        print(f"[compare {tag}] regular={len(reg)} browser={len(brs)} common={len(inter)} jaccard={j:.2f}", flush=True)
        out[tag] = {"regular": {k: {kk: vv for kk, vv in v.items()} for k, v in reg.items()},
                    "browser": {k: {kk: vv for kk, vv in v.items()} for k, v in brs.items()},
                    "common": len(inter), "jaccard": round(j, 3)}
        time.sleep(1.5)
    json.dump(out, open("<REDACTED_PATH>/data/e12d_browser_ll.json", "w"),
              ensure_ascii=False, indent=1)
    print("saved -> e12d_browser_ll.json", flush=True)

if __name__ == "__main__":
    main()
