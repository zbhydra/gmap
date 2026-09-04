#!/usr/bin/env python3
# E3: /maps/preview/place 单店详情 RPC 复现验证（SurfSense 路线）
# 3 实体 × {无 NID / NID}；解析复用 rpc_v2.parse_details（gosom 同构位置）
# 运行: cd <REDACTED_PATH> && .venv/bin/python scripts/e3_preview_place.py
import json, subprocess, sys, time, urllib.parse
sys.path.insert(0, "<REDACTED_PATH>/scripts")
from rpc_v2 import parse_details

PROXY = "<REDACTED>"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
SOCS = "CAISNQgDEitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2VydmVyXzIwMjMwODI5LjA3X3AxGgJlbiADGgYIgOa_pgY"

PLACE_PB = (
    "!1m13!1s{fid}"
    "!3m8!1m3!1d5000!2d0!3d0!3m2!1i1024!2i768!4f13.1"
    "!4m2!3d0!4d0"
    "!12m4!2m3!1i360!2i120!4i8"
    "!13m57!2m2!1i203!2i100!3m2!2i4!5b1"
    "!6m6!1m2!1i86!2i86!1m2!1i408!2i240"
    "!7m33!1m3!1e1!2b0!3e3!1m3!1e2!2b1!3e2!1m3!1e2!2b0!3e3"
    "!1m3!1e8!2b0!3e3!1m3!1e10!2b0!3e3!1m3!1e10!2b1!3e2"
    "!1m3!1e10!2b0!3e4!1m3!1e9!2b1!3e2!2b1!9b0"
    "!15m8!1m7!1m2!1m1!1e2!2m2!1i195!2i195!3i20"
    "!14m3!1s0ahUKEwixxxxxxxxxxxxxxxxxxxxxxxxx!7e81!15i10112"
    "!15m108!1m26!13m9!2b1!3b1!4b1!6i1!8b1!9b1!14b1!20b1!25b1"
    "!18m15!3b1!4b1!5b1!6b1!13b1!14b1!17b1!21b1!22b1!30b1!32b1!33m1!1b1!34b1!36e2"
    "!10m1!8e3!11m1!3e1!17b1!20m2!1e3!1e6!24b1!25b1!26b1!27b1!29b1"
    "!30m1!2b1!36b1!37b1!39m3!2m2!2i1!3i1!43b1!52b1!54m1!1b1!55b1!56m1!1b1"
    "!61m2!1m1!1e1!65m5!3m4!1m3!1m2!1i224!2i298"
    "!72m22!1m8!2b1!5b1!7b1!12m4!1b1!2b1!4m1!1e1!4b1"
    "!8m10!1m6!4m1!1e1!4m1!1e3!4m1!1e4"
    "!3sother_user_google_review_posts__and__hotel_and_vr_partner_review_posts"
    "!6m1!1e1!9b1!89b1!90m2!1m1!1e2!98m3!1b1!2b1!3b1!103b1!113b1"
    "!114m3!1b1!2m1!1b1!117b1!122m1!1b1!126b1!127b1!128m1!1b0"
    "!21m0!22m1!1e81!30m8!3b1!6m2!1b1!2b1!7m2!1e3!2b1!9b1"
    "!34m5!7b1!10b1!14b1!15m1!1b0!37i785"
)

TARGETS = [
    {"tag": "den_hit",  "fid": "0x876c78c4e818bd7d:0xb0d704b62827c269", "expect_rc": 1981},
    {"tag": "den_miss", "fid": "0x876bec271d492c29:0x882f1fed54939b29", "expect_rc": None},
    {"tag": "por_miss", "fid": "0x54950bc11c29c079:0xb99d1f303e39195", "expect_rc": None},
]
KEY_FIELDS = ["title", "review_count", "rating", "owner_name", "owner_id", "cid",
              "place_id", "kgmid", "website", "phone", "status", "price_range",
              "borough", "street"]

def curl(url, cookie=None, save_headers_to=None):
    cmd = ["curl", "-s", "-m", "40", "-x", PROXY, "-A", UA,
           "-H", "Accept-Language: en-US,en;q=0.9",
           "-w", "\n__META__%{http_code}|%{size_download}"]
    if cookie:
        cmd += ["-b", cookie]
    cmd.append(url)
    r = subprocess.run(cmd, capture_output=True, text=True)
    body, _, meta = r.stdout.rpartition("__META__")
    code, size = (meta.split("|") + [""])[:2] if meta else ("", "")
    return code, int(size or 0), body

def mint_nid():
    """GET /maps?hl=en 取 Set-Cookie NID"""
    cmd = ["curl", "-s", "-m", "40", "-x", PROXY, "-A", UA,
           "-H", "Accept-Language: en-US,en;q=0.9", "-D", "-", "-o", "/dev/null",
           "-b", f"SOCS={SOCS}",
           "https://www.google.com/maps?hl=en"]
    r = subprocess.run(cmd, capture_output=True, text=True)
    for line in r.stdout.splitlines():
        if line.lower().startswith("set-cookie:") and "NID=" in line:
            part = line.split(":", 1)[1].strip()
            for c in part.split(";"):
                if c.strip().startswith("NID="):
                    return c.strip().split("=", 1)[1]
    return None

def call_preview(fid, nid):
    pb = PLACE_PB.format(fid=fid)
    url = ("https://www.google.com/maps/preview/place"
           f"?authuser=0&hl=en&gl=us&pb={urllib.parse.quote(pb, safe='!')}")
    cookie = f"SOCS={SOCS}" + (f"; NID={nid}" if nid else "")
    t0 = time.time()
    code, size, body = curl(url, cookie=cookie)
    dt = round(time.time() - t0, 1)
    row = {"http": code, "size": size, "secs": dt,
           "xssi_ok": bool(body) and body.startswith(")]}'")}
    rec = None
    if row["xssi_ok"]:
        try:
            jd = json.loads(body[body.index("\n") + 1:])
            d = jd[6] if isinstance(jd, list) and len(jd) > 6 else None
            row["darray_type"] = type(d).__name__
            if isinstance(d, list):
                rec = parse_details(jd)
                row["fields"] = {k: rec.get(k) for k in KEY_FIELDS}
        except Exception as e:
            row["parse_error"] = f"{type(e).__name__}: {e}"
    return row, body, rec

def main():
    out = []
    t0 = time.time()
    nid = mint_nid()
    print(f"NID minted: {'yes (' + str(len(nid)) + ' chars)' if nid else 'FAILED'}", flush=True)
    for t in TARGETS:
        for label, with_nid in (("no_nid", False), ("nid", True)):
            tag = f"{t['tag']}|{label}"
            row, body, rec = call_preview(t["fid"], nid if with_nid else None)
            row["variant"] = tag
            row["expect_rc"] = t["expect_rc"]
            out.append(row)
            f = row.get("fields") or {}
            print(json.dumps({"variant": tag, "http": row["http"], "size": row["size"],
                              "secs": row["secs"], "xssi_ok": row["xssi_ok"],
                              "rc": f.get("review_count"), "owner": f.get("owner_name"),
                              "title": f.get("title")}, ensure_ascii=False), flush=True)
            # 保存 den_hit|nid 的完整响应原文供字段核验
            if tag == "den_hit|nid" and body:
                open("<REDACTED_PATH>/data/e3_denhit_nid_raw.txt", "w").write(body)
            time.sleep(1.5)
    json.dump(out, open("<REDACTED_PATH>/data/e3_preview_place.json", "w"),
              ensure_ascii=False, indent=1)
    print(f"total {time.time()-t0:.0f}s -> e3_preview_place.json")

if __name__ == "__main__":
    main()
