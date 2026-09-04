#!/usr/bin/env python3
# E12e: ll 决胜变量实验 —— 同 sticky 会话内 portland/miami 视口交替 + 出口复核 + NID 有无对照
# 矛盾: E12c 三出口视口精确生效; E12d 视口失效(疑跟出口)。测: 视口是否稳定可控, 决胜变量是什么
import json, subprocess, sys, time, urllib.parse
sys.path.insert(0, "<REDACTED_PATH>/scripts")
from rpc_v2 import TAIL
from e3_preview_place import mint_nid, SOCS

P_BASE = "user-session-{sess}:<REDACTED>@proxy.example:1080"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0"
KW = "coffee shop"

def proxy_url(sess):
    return "socks5h://" + P_BASE.format(sess=sess)

def curl_raw(url, sess, cookie=None, timeout=75):
    cmd = ["curl", "-s", "-m", str(timeout), "-x", proxy_url(sess), "-A", UA,
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

def curl_json(url, sess, cookie):
    for attempt in range(3):
        code, body = curl_raw(url, sess, cookie)
        if body and body.startswith(")]}'") and "\n" in body:
            try:
                return code, json.loads(body[body.index("\n") + 1:], strict=False)
            except Exception:
                pass
        time.sleep(2 + attempt * 2)
    return "err", None

def exit_geo(sess):
    for _ in range(3):
        code, body = curl_raw("http://ip-api.com/json/?fields=city,regionName,lat,lon,query,isp", sess)
        try:
            d = json.loads(body)
            if "lat" in d:
                return d
        except Exception:
            pass
        time.sleep(1)
    return None

def parse_page(jd):
    items = jd[0][1] if isinstance(jd, list) and jd and isinstance(jd[0], list) else None
    out = []
    if not isinstance(items, list):
        return out
    for arr in items[1:]:
        if not isinstance(arr, list) or not (len(arr) > 14 and isinstance(arr[14], list)):
            continue
        b = arr[14]
        try:
            lat, lng = b[9][2], b[9][3]
        except (IndexError, TypeError):
            lat = lng = None
        out.append({"title": b[11] if len(b) > 11 else None, "lat": lat, "lng": lng})
    return out

def center(recs):
    lats = [r["lat"] for r in recs if r["lat"] is not None]
    lngs = [r["lng"] for r in recs if r["lng"] is not None]
    if not lats:
        return None
    return (round(sum(lats)/len(lats), 3), round(sum(lngs)/len(lngs), 3))

def near(c, ref, deg):
    return bool(c and abs(c[0] - ref[0]) <= deg and abs(c[1] - ref[1]) <= deg)

VP = {"portland": (20000.0, -122.676, 45.523), "miami": (20000.0, -80.21, 25.79)}
VP_C = {k: (v[2], v[1]) for k, v in VP.items()}  # (lat,lng) 便于比较

def search(vp_tag, sess, ck):
    d, lng, lat = VP[vp_tag]
    vpb = f"!4m12!1m3!1d{d}!2d{lng}!3d{lat}!2m3!1f0!2f0!3f0!3m2!1i600!2i800!4f13.0"
    url = (f"https://maps.google.com/search?authuser=0&hl=en"
           f"&pb={vpb}%217i20%218i20{TAIL}&q={urllib.parse.quote_plus(KW)}")
    code, jd = curl_json(url, sess, ck)
    recs = parse_page(jd) if jd else []
    c = center(recs)
    hit = near(c, VP_C[vp_tag], 1.0)
    return {"n": len(recs), "center": c, "hits_viewport": hit,
            "sample": [r["title"] for r in recs[:3]]}

def main():
    nid = mint_nid()
    print("NID minted:", "yes" if nid else "FAILED", flush=True)
    out = {"runs": []}

    # Run1: sticky 会话 A + NID, portland→miami→portland 交替
    for run_tag, sess, ck, seq in (
        ("A_nid", "e12eA", f"SOCS={SOCS}; NID={nid}", ["portland", "miami", "portland", "miami"]),
        ("B_noid", "e12eB", f"SOCS={SOCS}", ["portland", "miami", "portland", "miami"]),
    ):
        geo = exit_geo(sess)
        g = {k: geo.get(k) for k in ("city", "regionName", "lat", "lon", "isp")} if geo else None
        print(f"[{run_tag}] exit: {g}", flush=True)
        for vp_tag in seq:
            r = search(vp_tag, sess, ck)
            print(f"  [{run_tag}/{vp_tag}] n={r['n']} center={r['center']} "
                  f"hits_vp={r['hits_viewport']} {r['sample']}", flush=True)
            out["runs"].append({"run": run_tag, "session": sess, "exit": g, "viewport": vp_tag, **r})
            time.sleep(1.5)

    verdict = {
        "A_hits_all": all(r["hits_viewport"] for r in out["runs"] if r["run"] == "A_nid"),
        "B_hits_all": all(r["hits_viewport"] for r in out["runs"] if r["run"] == "B_noid"),
    }
    out["verdict"] = verdict
    print("VERDICT:", json.dumps(verdict), flush=True)
    json.dump(out, open("<REDACTED_PATH>/data/e12e_ll_decide.json", "w"),
              ensure_ascii=False, indent=1)
    print("saved -> e12e_ll_decide.json", flush=True)

if __name__ == "__main__":
    main()
