#!/usr/bin/env python3
# E13: GetLocalBoqProxy 评论通道验证 —— cookie 门控 / 四种排序 / 分页 token / 字段结构
# 配方源: SurfSense fetch.py(build_reviews_url/iter_reviews_pages) + parsers.py 评论 48 槽位表
import json, subprocess, sys, time, urllib.parse
sys.path.insert(0, "<REDACTED_PATH>/scripts")
from e3_preview_place import mint_nid, SOCS

PROXY = "<REDACTED>"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

SORTS = {"relevant": 1, "newest": 2, "highest": 3, "lowest": 4}

ENTITIES = {
    "den_hit": "0x876c78c4e818bd7d:0xb0d704b62827c269",   # rc=1981
    "por_miss": "0x54950bc11c29c079:0xb99d1f303e39195",   # rc=350
}

def curl(url, cookie=None):
    for attempt in range(3):
        cmd = ["curl", "-s", "-m", "40", "--compressed", "-x", PROXY, "-A", UA,
               "-H", "Accept-Language: en-US,en;q=0.9",
               "-w", "\n__META__%{http_code}|%{size_download}"]
        if cookie:
            cmd += ["-b", cookie]
        cmd.append(url)
        r = subprocess.run(cmd, capture_output=True, text=True)
        body, _, meta = r.stdout.rpartition("__META__")
        if body and body.startswith(")]}'"):
            return meta.split("|")[0], body
        time.sleep(1 + attempt)
    return "err", ""

def build_url(fid, sort_code, page_token="", pagesize=100, hl="en"):
    inner = [None] * 12
    inner[1] = sort_code
    inner[9] = pagesize
    inner[11] = [fid]
    if page_token:
        inner.extend([None] * 8)
        inner[19] = page_token
    payload = [None, [None] * 9 + [inner]]
    return ("https://www.google.com/httpservice/web/PrivateLocalSearchUiDataService/"
            f"GetLocalBoqProxy?msc=gwsrpc&hl={hl}"
            f"&reqpld={urllib.parse.quote(json.dumps(payload))}")

def ms_to_iso(ms):
    try:
        v = float(ms)
    except (TypeError, ValueError):
        return None
    if not v:
        return None
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(v / 1000))

def dig(obj, *path):
    cur = obj
    for i in path:
        try:
            cur = cur[i]
        except (IndexError, TypeError, KeyError):
            return None
    return cur if cur != "" else None

def parse_review(r):
    if not isinstance(r, list):
        return None
    name = dig(r, 3, 0)
    if not name:
        return None
    imgs = 0
    for idx in (13, 14):
        block = dig(r, idx)
        if isinstance(block, list):
            imgs = len(block)
            break
    reply_text = dig(r, 4, 2)
    return {
        "review_id": dig(r, 5),
        "stars": dig(r, 1),
        "rel_date": dig(r, 2, 0),
        "published_iso": ms_to_iso(dig(r, 2, 2)),
        "author": name,
        "author_reviews_n": dig(r, 3, 3),
        "local_guide": dig(r, 3, 5, 1),
        "lang": dig(r, 26),
        "text": (dig(r, 27) or "")[:120] or None,
        "text_len": len(dig(r, 27) or ""),
        "translated": bool(dig(r, 28)),
        "owner_reply": bool(reply_text),
        "owner_reply_date": dig(r, 4, 1),
        "owner_reply_len": len(reply_text or ""),
        "images": imgs,
        "origin": dig(r, 44, 0),
        "guided_n": len(dig(r, 30) or []),
    }

def fetch_node(fid, sort_code, token, cookie):
    url = build_url(fid, sort_code, token)
    code, body = curl(url, cookie=cookie)
    if code == "err":
        return None, code
    try:
        jd = json.loads(body[body.index("\n") + 1:])
    except Exception:
        return None, f"parse_fail:{code}"
    node = jd[1][10] if isinstance(jd, list) and len(jd) > 1 and isinstance(jd[1], list) and len(jd[1]) > 10 else None
    return node, code

def page_round(tag, fid, sort_code, cookie, pages):
    reviews, tokens = [], []
    token = ""
    for p in range(1, pages + 1):
        node, code = fetch_node(fid, sort_code, token, cookie)
        if not node or not isinstance(node[2], list):
            print(f"  [{tag}] page{p}: no node (http={code})", flush=True)
            break
        rows = [x for x in (parse_review(r) for r in node[2]) if x]
        nxt = node[6] if len(node) > 6 and isinstance(node[6], str) else ""
        print(f"  [{tag}] page{p}: raw={len(node[2])} parsed={len(rows)} "
              f"token={'yes' if nxt else 'none'} ({len(nxt)}ch)", flush=True)
        reviews.extend(rows)
        tokens.append(nxt)
        if not nxt or nxt == token:
            break
        token = nxt
        time.sleep(1.2)
    return reviews, tokens

def summarize(tag, reviews, tokens):
    if not reviews:
        return {"variant": tag, "n": 0}
    stars = [r["stars"] for r in reviews if r["stars"] is not None]
    iso = [r["published_iso"] for r in reviews if r["published_iso"]]
    sorted_iso = all(iso[i] >= iso[i+1] for i in range(len(iso)-1)) if len(iso) > 1 else None
    rev_sorted_iso = all(iso[i] <= iso[i+1] for i in range(len(iso)-1)) if len(iso) > 1 else None
    s = {
        "variant": tag, "n": len(reviews),
        "stars_hist": {str(k): stars.count(k) for k in sorted(set(stars))},
        "with_text": sum(1 for r in reviews if r["text"]),
        "with_owner_reply": sum(1 for r in reviews if r["owner_reply"]),
        "with_images": sum(1 for r in reviews if r["images"]),
        "with_date_iso": len(iso),
        "langs": sorted({r["lang"] for r in reviews if r["lang"]}),
        "origins": sorted({r["origin"] for r in reviews if r["origin"]}),
        "newest_monotonic": sorted_iso, "oldest_monotonic": rev_sorted_iso,
        "pages": len(tokens),
        "first3": reviews[:3],
    }
    return s

def main():
    nid = mint_nid()
    print(f"NID minted: {'yes' if nid else 'FAILED'}", flush=True)
    cookie_nid = f"SOCS={SOCS}; NID={nid}" if nid else None
    out = {}
    all_reviews = {}

    # 1) cookie 门控: den_hit newest 无 cookie vs NID
    for tag, ck in (("den_newest_nocookie", None), ("den_newest_nid", cookie_nid)):
        revs, toks = page_round(tag, ENTITIES["den_hit"], 2, ck, pages=1)
        out[tag] = summarize(tag, revs, toks)
        all_reviews[tag] = revs
        time.sleep(1.5)

    # 2) 四种排序(den_hit, NID), newest 顺带翻 3 页
    for sort_name, code_n in SORTS.items():
        pages = 3 if sort_name == "newest" else 1
        revs, toks = page_round(f"den_{sort_name}", ENTITIES["den_hit"], code_n, cookie_nid, pages)
        out[f"den_{sort_name}"] = summarize(f"den_{sort_name}", revs, toks)
        all_reviews[f"den_{sort_name}"] = revs
        time.sleep(1.5)

    # 3) 交叉实体 por_miss newest 翻 3 页
    revs, toks = page_round("por_newest", ENTITIES["por_miss"], 2, cookie_nid, 3)
    out["por_newest"] = summarize("por_newest", revs, toks)
    all_reviews["por_newest"] = revs

    # 4) 翻页去重校验: newest 链上 review_id 是否唯一
    for tag in ("den_newest", "por_newest"):
        revs = all_reviews.get(tag) or []
        ids = [r["review_id"] for r in revs if r["review_id"]]
        if ids:
            print(f"[dedup {tag}] {len(ids)} ids, unique={len(set(ids))}", flush=True)
            out.setdefault(tag, {})["dup_ids"] = len(ids) - len(set(ids))

    json.dump({"summary": out, "reviews": all_reviews},
              open("<REDACTED_PATH>/data/e13_reviews_boq.json", "w"),
              ensure_ascii=False, indent=1)
    print("saved -> e13_reviews_boq.json", flush=True)

if __name__ == "__main__":
    main()
