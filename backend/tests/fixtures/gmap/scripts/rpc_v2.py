#!/usr/bin/env python3
# rpc_fetch v2 final — Layer1 内部分页+listing 解析(含 kgmid);Layer2 place 详情(app_state)
# 字段位置移植自 gosom gmaps/entry.go
import subprocess, json, re, sys, time, urllib.parse, argparse

PROXY = "<REDACTED>"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0"
BASE = "https://maps.google.com/search?authuser=0&hl=en&pb=!4m12!1m3!1d3826.902183192154!2d-96.80!3d40.50!2m3!1f0!2f0!3f0!3m2!1i600!2i800!4f13.0"
TAIL = "!10b1!12m22!1m3!18b1!30b1!34e1!2m3!5m1!6e2!20e3!4b0!10b1!12b1!13b1!16b1!17m1!3e1!20m3!5e2!6b1!14b1!46m1!1b0!96b1!19m4!2m3!1i360!2i120!4i8&tbm=map"
TIMEOUT, RETRIES, DELAY = 30, 3, 0.8
PID_RE = re.compile(r"ChIJ[a-zA-Z0-9_-]{10,}")
KGMID_RE = re.compile(r"^/g/[a-zA-Z0-9_-]+$")

def http_get(url):
    for attempt in range(RETRIES):
        r = subprocess.run(["curl","-s","-m",str(TIMEOUT),"-x",PROXY,"-A",UA,url],
                           capture_output=True, text=True)
        if r.stdout:
            return r.stdout
        time.sleep(1 + attempt)
    return None

def get(obj, path):
    cur = obj
    for i in path:
        try:
            cur = cur[i]
        except (IndexError, TypeError, KeyError):
            return None
    return cur if cur != "" else None

def walk_find(obj, pred, limit=1):
    out = []
    def _w(o):
        if len(out) >= limit: return
        if isinstance(o, str):
            if pred(o): out.append(o)
        elif isinstance(o, list):
            for x in o: _w(x)
    _w(obj)
    return out

# ---------- Layer 1 ----------
def parse_listing_business(arr):
    b = get(arr, [14])
    if not isinstance(b, list): return None
    addr_parts = get(b, [2]) or []
    fid = get(b, [10])
    kg = walk_find(arr, lambda s: bool(KGMID_RE.match(s)), limit=1)
    return {
        "input_id":     get(b, [0]),
        "title":        get(b, [11]),
        "categories":   [str(x) for x in (get(b, [13]) or [])],
        "website":      get(b, [7, 0]),
        "rating":       get(b, [4, 7]),
        "review_count": get(b, [4, 8]),
        "fulladdress":  ", ".join(str(x) for x in addr_parts) if isinstance(addr_parts, list) else None,
        "latitude":     get(b, [9, 2]),
        "longitude":    get(b, [9, 3]),
        "phone":        get(b, [178, 0, 0]),
        "timezone":     get(b, [30]),
        "fid":          fid,
        "kgmid":        kg[0] if kg else None,
        "place_url":    (f"https://www.google.com/maps/place/data=!4m2!3m1!1s{fid}?hl=en" if fid else None),
    }

def search_pagination(kw, pages):
    enc = urllib.parse.quote_plus(kw)
    places, order, fails = {}, [], 0
    for p in range(1, pages + 1):
        off = 20 * p
        body = http_get(f"{BASE}%217i{off}!8i0{TAIL}&q={enc}")
        if not body or not body.startswith(")]}'"):
            fails += 1
            if fails >= 3: break
            continue
        data = json.loads(body[body.index("\n")+1:])
        items = get(get(data, [0]) or [], [1]) or []
        if len(items) < 2: break
        new = 0
        for arr in items[1:]:
            if not isinstance(arr, list): continue
            rec = parse_listing_business(arr)
            if not rec or not rec.get("fid"): continue
            fid = rec["fid"]
            if fid not in places:
                places[fid] = rec; order.append(fid); new += 1
        if new == 0: break
        time.sleep(DELAY)
    return places, order, fails

# ---------- Layer 2 ----------
def extract_payload_string(html):
    # APP_INITIALIZATION_STATE[3] 的子数组位置 6/5 存在以 )]}' 开头的字符串
    i = html.find("APP_INITIALIZATION_STATE")
    if i < 0: return None
    start = html.find("[", i)
    if start < 0: return None
    depth = 0; in_str = False; esc = False
    giant = None
    for j in range(start, len(html)):
        c = html[j]
        if esc: esc = False; continue
        if c == "\\": esc = True; continue
        if c == '"': in_str = not in_str; continue
        if in_str: continue
        if c == "[": depth += 1
        elif c == "]":
            depth -= 1
            if depth == 0:
                try: giant = json.loads(html[start:j+1])
                except Exception: giant = None
                break
    if not isinstance(giant, list) or len(giant) < 4: return None
    app3 = giant[3]
    if not isinstance(app3, list): return None
    for sub in app3:
        if not isinstance(sub, list): continue
        for idx in (6, 5):
            if len(sub) > idx and isinstance(sub[idx], str) and sub[idx].startswith(")]}'"):
                return sub[idx][sub[idx].index("\n")+1:]
    return None

def parse_details(jd):
    d = get(jd, [6]) or []
    kg = walk_find(d, lambda s: bool(KGMID_RE.match(s)), limit=1)
    rec = {
        "title":        get(d, [11]),
        "website":      get(d, [7, 0]),
        "phone":        get(d, [178, 0, 0]),
        "rating":       get(d, [4, 7]),
        "review_count": get(d, [4, 8]),
        "address":      get(d, [18]),
        "latitude":     get(d, [9, 2]),
        "longitude":    get(d, [9, 3]),
        "timezone":     get(d, [30]),
        "fid":          get(d, [10]),
        "place_id":     get(d, [78]),
        "status":       get(d, [34, 4, 4]) or get(d, [88, 0]),
        "description":  get(d, [32, 1, 1]),
        "price_range":  get(d, [4, 2]),
        "owner_name":   get(d, [57, 1]),
        "owner_id":     get(d, [57, 2]),
        "cid":          get(jd, [25, 3, 0, 13, 0, 0, 1]),
        "kgmid":        kg[0] if kg else None,
        "borough":      get(d, [183, 1, 0]),
        "street":       get(d, [183, 1, 1]),
    }
    if rec["owner_id"]:
        rec["owner_link"] = f"https://www.google.com/maps/contrib/{rec['owner_id']}"
    if rec["cid"]:
        rec["google_maps_url"] = f"https://www.google.com/maps?cid={rec['cid']}"
    if rec["kgmid"]:
        rec["google_knowledge_url"] = f"https://www.google.com/maps?kgmid={rec['kgmid']}"
    return rec

def details_for(fid):
    url = f"https://www.google.com/maps/place/data=!4m2!3m1!1s{fid}?hl=en"
    html = http_get(url)
    if not html: return None
    payload = extract_payload_string(html)
    if not payload: return None
    try:
        return parse_details(json.loads(payload))
    except Exception as e:
        print(f"  details parse error: {e}", file=sys.stderr)
        return None

# ---------- main ----------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("keyword")
    ap.add_argument("--depth", type=int, default=3)
    ap.add_argument("--details", type=int, default=0)
    ap.add_argument("--out", default="/tmp/rpc_v2_out.json")
    a = ap.parse_args()

    t0 = time.time()
    places, order, fails = search_pagination(a.keyword, a.depth)
    print(f"[L1] {len(places)} places, 页失败 {fails}, {time.time()-t0:.0f}s")
    records = [places[f] for f in order]

    if a.details > 0:
        n, ok = 0, 0
        for rec in records:
            if n >= a.details: break
            n += 1
            d = details_for(rec["fid"])
            if d:
                ok += 1
                rec.update({k: v for k, v in d.items() if v not in (None, "")})
                rec["_layer2"] = True
            else:
                rec["_layer2"] = False
            time.sleep(DELAY)
        print(f"[L2] details: {ok}/{n} 成功")

    json.dump(records, open(a.out, "w"), ensure_ascii=False, indent=1)
    fields = ["title","website","phone","rating","review_count","fulladdress","latitude",
              "kgmid","fid","status","owner_name","owner_id","cid","place_id"]
    filled = {k: sum(1 for r in records if r.get(k)) for k in fields}
    print("字段填充:", json.dumps(filled))
    print(f"out -> {a.out} | 总耗时 {time.time()-t0:.0f}s")

if __name__ == "__main__":
    main()
