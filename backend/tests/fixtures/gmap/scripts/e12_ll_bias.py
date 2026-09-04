#!/usr/bin/env python3
# E12 v2: ll 坐标偏置验证 —— 视口块(!1d直径!2dlng!3dlat)注入后裸词结果地理是否随动
# 配方与 stress_test.py 对齐: Firefox UA + gzip + TAIL 含 &tbm=map + SOCS/NID cookie
# 浏览器级 pb: 解码后正则替换视口块(stress BROWSER_PB_TEMPLATE 同法), quote(safe='!') 回注
import json, re, subprocess, sys, time, urllib.parse
sys.path.insert(0, "<REDACTED_PATH>/scripts")
from rpc_v2 import TAIL
from e3_preview_place import mint_nid, SOCS, curl

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0"
KW = "coffee shop"

def curl_gz(url, cookie):
    for attempt in range(3):
        cmd = ["curl", "-s", "-m", "40", "-x", curl.__globals__["PROXY"], "-A", UA,
               "-H", "Accept-Language: en-US,en;q=0.9",
               "-H", "Accept-Encoding: gzip", "--compressed",
               "-w", "\n__META__%{http_code}|%{size_download}"]
        if cookie:
            cmd += ["-b", cookie]
        cmd.append(url)
        r = subprocess.run(cmd, capture_output=True, text=True)
        body, _, meta = r.stdout.rpartition("__META__")
        if body and body.startswith(")]}'") and "\n" in body:
            code = (meta.split("|") + [""])[0]
            return code, body
        time.sleep(2 + attempt * 2)
    return "err", ""

# (直径米, lng, lat)
VIEWPORTS = {
    "baseline_ne": (3826.9, -96.80, 40.50),
    "portland":    (20000.0, -122.676, 45.523),
    "miami":       (20000.0, -80.21, 25.79),
    "whole_earth": (25000000.0, 0.0, 0.0),
}
BBOX = {
    "portland": (45.30, 45.75, -123.00, -122.30),
    "miami":    (25.50, 26.20, -80.60, -80.05),
    "nebraska": (39.90, 41.20, -98.50, -95.30),
    "houston":  (29.40, 30.10, -95.80, -95.00),
}

def classify(lat, lng):
    for city, (la1, la2, lo1, lo2) in BBOX.items():
        if la1 <= lat <= la2 and lo1 <= lng <= lo2:
            return city
    return "other"

def parse_page(body):
    data = json.loads(body[body.index("\n") + 1:])
    items = data[0][1] if isinstance(data, list) and data and isinstance(data[0], list) else None
    out = []
    if not isinstance(items, list):
        return out
    for arr in items[1:]:
        if not isinstance(arr, list) or not (isinstance(arr[14], list) if len(arr) > 14 else False):
            continue
        b = arr[14]
        try:
            lat, lng = b[9][2], b[9][3]
        except (IndexError, TypeError):
            lat = lng = None
        out.append({"title": b[11] if len(b) > 11 else None,
                    "fid": b[10] if len(b) > 10 else None, "lat": lat, "lng": lng})
    return out

def agg(recs):
    cities = {}
    lats, lngs = [], []
    for r in recs:
        if r["lat"] is None:
            continue
        cities[classify(r["lat"], r["lng"])] = cities.get(classify(r["lat"], r["lng"]), 0) + 1
        lats.append(r["lat"]); lngs.append(r["lng"])
    center = (round(sum(lats)/len(lats), 3), round(sum(lngs)/len(lngs), 3)) if lats else None
    return cities, center

def run_regular(tag, diameter, lat, lng, ck, pages=2):
    byfid = {}
    for p in range(1, pages + 1):
        off = 20 * p
        vp = f"!4m12!1m3!1d{diameter}!2d{lng}!3d{lat}!2m3!1f0!2f0!3f0!3m2!1i600!2i800!4f13.0"
        url = (f"https://maps.google.com/search?authuser=0&hl=en"
               f"&pb={vp}%217i20%218i{off}{TAIL}&q={urllib.parse.quote_plus(KW)}")
        code, body = curl_gz(url, ck)
        if code == "err":
            print(f"  [{tag}] page{p}: FAIL", flush=True)
            continue
        page = parse_page(body)
        for r in page:
            if r["fid"] and r["fid"] not in byfid:
                byfid[r["fid"]] = r
        print(f"  [{tag}] page{p}: {len(page)} rows, unique={len(byfid)}", flush=True)
        time.sleep(1.2)
    recs = list(byfid.values())
    cities, center = agg(recs)
    print(f"[{tag}] total={len(recs)} cities={cities} center={center}", flush=True)
    print(f"  sample: {[r['title'] for r in recs[:4]]}", flush=True)
    return {"variant": tag, "total": len(recs), "cities": cities, "center": center,
            "sample_titles": [r["title"] for r in recs[:4]], "records": recs}

RAW_BROWSER = open("<REDACTED_PATH>/browser_search_url.txt").read().strip()
BROWSER_PB = urllib.parse.unquote(re.search(r"[?&]pb=([^&]+)", RAW_BROWSER).group(1))
BROWSER_PB = re.sub(r"^!1s[^!]*", "!1s{kw}", BROWSER_PB)
VP_RE = r"!1d[\d.]+!2d-?[\d.]+!3d-?[\d.]+"
assert re.search(VP_RE, BROWSER_PB), "viewport block not found in browser pb"

def run_browser(tag, diameter, lat, lng, ck):
    pb = BROWSER_PB.replace("{kw}", urllib.parse.quote_plus(KW))
    pb = re.sub(VP_RE, f"!1d{diameter}!2d{lng}!3d{lat}", pb, count=1)
    url = ("https://www.google.com/search?tbm=map&authuser=0&hl=en&gl=us"
           f"&q={urllib.parse.quote_plus(KW)}&pb={urllib.parse.quote(pb, safe='!')}")
    code, body = curl_gz(url, ck)
    recs = parse_page(body) if code != "err" else []
    cities, center = agg(recs)
    print(f"[browser_{tag}] http={code} total={len(recs)} cities={cities} center={center}", flush=True)
    print(f"  sample: {[r['title'] for r in recs[:4]]}", flush=True)
    return {"variant": f"browser_{tag}", "total": len(recs), "http": code,
            "cities": cities, "center": center,
            "sample_titles": [r["title"] for r in recs[:4]], "records": recs}

def main():
    nid = mint_nid()
    print("NID:", "yes" if nid else "FAILED", flush=True)
    ck = f"SOCS={SOCS}; NID={nid}" if nid else None
    out = {}
    for tag, (d, la, lo) in VIEWPORTS.items():
        out[tag] = run_regular(tag, d, la, lo, ck)
        time.sleep(1.5)
    for tag in ("portland", "miami"):
        d, la, lo = VIEWPORTS[tag]
        out[f"browser_{tag}"] = run_browser(tag, d, la, lo, ck)
        time.sleep(1.5)
    for city in ("portland", "miami"):
        a, b = out.get(city), out.get(f"browser_{city}")
        if a and b and a["records"] and b["records"]:
            sa = {r["fid"] for r in a["records"] if r["fid"]}
            sb = {r["fid"] for r in b["records"] if r["fid"]}
            inter = sa & sb
            print(f"[overlap {city}] regular={len(sa)} browser={len(sb)} common={len(inter)} "
                  f"jaccard={len(inter)/len(sa|sb):.2f}", flush=True)
            out[f"overlap_{city}"] = {"regular_n": len(sa), "browser_n": len(sb),
                                      "common": len(inter), "common_fids": list(inter)}
    json.dump(out, open("<REDACTED_PATH>/data/e12_ll_bias.json", "w"),
              ensure_ascii=False, indent=1)
    print("saved -> e12_ll_bias.json", flush=True)

if __name__ == "__main__":
    main()
