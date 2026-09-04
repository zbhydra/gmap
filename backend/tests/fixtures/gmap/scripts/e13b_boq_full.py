#!/usr/bin/env python3
# E13b: BOQ 翻页到底 + 排序稳定性 + guided 块原始结构
import json, subprocess, sys, time, urllib.parse
sys.path.insert(0, "<REDACTED_PATH>/scripts")
from e3_preview_place import mint_nid, SOCS

PROXY = "<REDACTED>"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
ENTITIES = {
    "den_hit": ("0x876c78c4e818bd7d:0xb0d704b62827c269", 1981),
    "por_miss": ("0x54950bc11c29c079:0xb99d1f303e39195", 350),
}

def curl(url, cookie=None):
    for attempt in range(3):
        cmd = ["curl", "-s", "-m", "60", "--compressed", "-x", PROXY, "-A", UA,
               "-H", "Accept-Language: en-US,en;q=0.9",
               "-w", "\n__META__%{http_code}|%{size_download}"]
        if cookie:
            cmd += ["-b", cookie]
        cmd.append(url)
        r = subprocess.run(cmd, capture_output=True, text=True)
        body, _, meta = r.stdout.rpartition("__META__")
        if body and body.startswith(")]}'"):
            try:
                json.loads(body[body.index("\n") + 1:], strict=False)
                return meta.split("|")[0], body
            except Exception:
                pass
        time.sleep(1.5 + attempt)
    return "err", ""

def build_url(fid, sort_code, token="", pagesize=100):
    inner = [None] * 12
    inner[1] = sort_code
    inner[9] = pagesize
    inner[11] = [fid]
    if token:
        inner.extend([None] * 8)
        inner[19] = token
    payload = [None, [None] * 9 + [inner]]
    return ("https://www.google.com/httpservice/web/PrivateLocalSearchUiDataService/"
            f"GetLocalBoqProxy?msc=gwsrpc&hl=en&reqpld={urllib.parse.quote(json.dumps(payload))}")

def dig(obj, *path):
    cur = obj
    for i in path:
        try:
            cur = cur[i]
        except (IndexError, TypeError, KeyError):
            return None
    return cur if cur != "" else None

def page(fid, token, ck):
    code, body = curl(build_url(fid, 2, token), ck)
    if code == "err":
        return None, None, code
    jd = json.loads(body[body.index("\n") + 1:])
    node = jd[1][10] if isinstance(jd, list) and len(jd) > 1 and isinstance(jd[1], list) and len(jd[1]) > 10 else None
    if not node or not isinstance(node[2], list):
        return None, None, f"no_node:{code}"
    return node[2], (node[6] if len(node) > 6 and isinstance(node[6], str) else ""), code

def drain(tag, fid, expect_rc, ck, max_pages=60):
    ids, token, pages, t0 = [], "", 0, time.time()
    while pages < max_pages:
        reviews, nxt, code = page(fid, token, ck)
        if reviews is None:
            print(f"  [{tag}] p{pages+1}: STOP ({code})", flush=True)
            break
        pages += 1
        ids.extend(dig(r, 5) or f"idx{len(ids)}" for r in reviews if isinstance(r, list))
        if not nxt or nxt == token:
            print(f"  [{tag}] p{pages+1 if reviews is None else pages}: token exhausted", flush=True)
            break
        token = nxt
        if pages % 10 == 0:
            print(f"  [{tag}] p{pages}: {len(ids)} ids", flush=True)
    dt = time.time() - t0
    uniq = len(set(ids))
    print(f"[{tag}] pages={pages} total={len(ids)} unique={uniq} "
          f"expect_rc={expect_rc} secs={dt:.0f} ({dt/max(pages,1):.1f}s/page)", flush=True)
    return {"pages": pages, "total": len(ids), "unique": uniq, "expect_rc": expect_rc, "secs": round(dt)}

def id_sequence(fid, ck):
    ids, token = [], ""
    for _ in range(2):
        reviews, nxt, code = page(fid, token, ck)
        if reviews is None:
            return ids
        ids.extend(dig(r, 5) or "" for r in reviews if isinstance(r, list))
        if not nxt:
            break
        token = nxt
    return ids

def main():
    nid = mint_nid()
    ck = f"SOCS={SOCS}; NID={nid}" if nid else f"SOCS={SOCS}"
    out = {}
    # 1) den_hit 翻到底
    out["den_full"] = drain("den_full", ENTITIES["den_hit"][0], ENTITIES["den_hit"][1], ck)
    # 2) por_miss 翻到底
    out["por_full"] = drain("por_full", ENTITIES["por_miss"][0], ENTITIES["por_miss"][1], ck)
    # 3) 排序稳定性: den 前 2 页两遍 id 序列
    s1 = id_sequence(ENTITIES["den_hit"][0], ck)
    time.sleep(3)
    s2 = id_sequence(ENTITIES["den_hit"][0], ck)
    out["sort_stability"] = {"n1": len(s1), "n2": len(s2), "identical": s1 == s2}
    print(f"[stability] identical={s1 == s2} ({len(s1)} ids)", flush=True)
    json.dump(out, open("<REDACTED_PATH>/data/e13b_boq_full.json", "w"),
              ensure_ascii=False, indent=1)
    print("saved -> e13b_boq_full.json", flush=True)

if __name__ == "__main__":
    main()
