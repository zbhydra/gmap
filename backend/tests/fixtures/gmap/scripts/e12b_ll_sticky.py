#!/usr/bin/env python3
# E12b: ll 受控实验 —— sticky 固定出口,先查出口 IP 地理,再变视口,分辨结果地理跟谁走
# 判定: 结果重心落在出口城市 bbox → 出口决定;落在视口城市 bbox → 视口(ll)有效
import json, subprocess, sys, time, urllib.parse
sys.path.insert(0, "<REDACTED_PATH>/scripts")
from rpc_v2 import TAIL
from e3_preview_place import mint_nid, SOCS

PROXY_HOST = "<REDACTED>"
PROXY_USER = "<REDACTED>"
PROXY_PASS = "<REDACTED>"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0"
KW = "coffee shop"

def proxy_url(session):
    if session:
        return f"socks5h://{PROXY_USER}-sticky-{session}:{PROXY_PASS}@{PROXY_HOST}"
    return f"socks5h://{PROXY_USER}-rotate:{PROXY_PASS}@{PROXY_HOST}"

def curl_raw(url, session, cookie=None, timeout=25):
    cmd = ["curl", "-s", "-m", str(timeout), "-x", proxy_url(session), "-A", UA,
           "-H", "Accept-Language: en-US,en;q=0.9",
           "-H", "Accept-Encoding: gzip", "--compressed",
           "-w", "\n__META__%{http_code}|%{size_download}"]
    if cookie:
        cmd += ["-b", cookie]
    cmd.append(url)
    r = subprocess.run(cmd, capture_output=True, text=True)
    body, _, meta = r.stdout.rpartition("__META__")
    code = (meta.split("|") + [""])[0] if meta else ""
    return code, body

def curl_json_rpc(url, session, cookie):
    for attempt in range(3):
        code, body = curl_raw(url, session, cookie)
        if body and body.startswith(")]}'") and "\n" in body:
            return code, body
        time.sleep(2 + attempt * 2)
    return "err", ""

def exit_geo(session):
    code, body = curl_raw("http://ip-api.com/json/?fields=country,city,lat,lon,query,isp", session)
    try:
        return json.loads(body)
    except Exception:
        return None

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

# (直径米, lng, lat)
VIEWPORTS = {
    "baseline_ne": (3826.9, -96.80, 40.50),
    "portland":    (20000.0, -122.676, 45.523),
    "miami":       (20000.0, -80.21, 25.79),
}

def near(lat, lng, ref_lat, ref_lng, deg=0.75):
    return abs(lat - ref_lat) <= deg and abs(lng - ref_lng) <= deg

def main():
    nid = mint_nid()
    ck = f"SOCS={SOCS}; NID={nid}" if nid else None
    print("NID:", "yes" if nid else "FAILED", flush=True)
    enc = urllib.parse.quote_plus(KW)
    out = {}
    for session in ("e12a", "e12b"):
        geo = exit_geo(session)
        if not geo or "lat" not in geo:
            print(f"[{session}] exit geo FAIL", flush=True)
            continue
        print(f"[{session}] exit: {geo.get('city','?')}, {geo.get('country')} @ "
              f"({geo['lat']},{geo['lon']}) isp={geo.get('isp','?')}", flush=True)
        vp_rows = {}
        for tag, (d, lng, lat) in VIEWPORTS.items():
            vp = f"!4m12!1m3!1d{d}!2d{lng}!3d{lat}!2m3!1f0!2f0!3f0!3m2!1i600!2i800!4f13.0"
            url = (f"https://maps.google.com/search?authuser=0&hl=en"
                   f"&pb={vp}%217i20%218i20{TAIL}&q={enc}")
            code, body = curl_json_rpc(url, session, ck)
            recs = parse_page(body) if code != "err" else []
            lats = [r["lat"] for r in recs if r["lat"] is not None]
            lngs = [r["lng"] for r in recs if r["lng"] is not None]
            center = (round(sum(lats)/len(lats), 3), round(sum(lngs)/len(lngs), 3)) if lats else None
            follows_exit = bool(center and near(center[0], center[1], geo["lat"], geo["lon"], 1.2))
            follows_vp = bool(center and near(center[0], center[1], lat, lng, 1.2))
            print(f"  [{session}/{tag}] n={len(recs)} center={center} "
                  f"follows_exit={follows_exit} follows_viewport={follows_vp}", flush=True)
            print(f"    sample: {[r['title'] for r in recs[:3]]}", flush=True)
            vp_rows[tag] = {"n": len(recs), "center": center,
                            "follows_exit": follows_exit, "follows_viewport": follows_vp,
                            "sample_titles": [r["title"] for r in recs[:3]],
                            "records": recs}
            time.sleep(1.5)
        out[session] = {"exit": geo, "viewports": vp_rows}
    verdict = {"follows_exit_all": all(v["viewports"][t]["follows_exit"]
                                       for v in out.values() for t in v["viewports"]),
               "follows_vp_any": any(v["viewports"][t]["follows_viewport"]
                                     for v in out.values() for t in v["viewports"])}
    print("VERDICT:", json.dumps(verdict), flush=True)
    json.dump({"sessions": out, "verdict": verdict},
              open("<REDACTED_PATH>/data/e12b_ll_sticky.json", "w"),
              ensure_ascii=False, indent=1)
    print("saved -> e12b_ll_sticky.json", flush=True)

if __name__ == "__main__":
    main()
