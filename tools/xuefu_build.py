"""
把「學扶數學」網站（teacher-liujikan.github.io/xuefu）的 3～6 年級題目，
轉成 Noise-Point 的題目片段格式，產生 js/questions/xuefu-data.js，並複製題目圖片。

用法（在 Noise-Point 資料夾執行）：
    python tools/xuefu_build.py <questions_g3-6.json> <圖片資料夾>

轉換規則：
- 「2又3/5」→ 帶分數片段，「3/8」→ 分數片段，「□/5」「（　）/20」→ 分子是空格的分數。
- 「[圖]」「[圖1]」→ 圖片片段，放在原本的位置；題目沒有標位置的圖，接在題目文字後面。
- 高 70、寬 140 像素以內的小圖示（例如位值積木）標成行內圖，和文字排在同一行。
"""
import json, os, re, shutil, struct, sys

SRC, IMG_DIR = sys.argv[1], sys.argv[2]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_IMG = os.path.join(ROOT, "assets", "xuefu")
OUT_JS = os.path.join(ROOT, "js", "questions", "xuefu-data.js")
os.makedirs(OUT_IMG, exist_ok=True)

TOKEN = re.compile(
    r"(?P<expr>\((?P<en>[^()]+)\)/\((?P<ed>[^()]+)\))"
    r"|(?P<mixed>(?<![\d.])(?P<mw>\d+)又(?P<mn>\d+)/(?P<md>\d+)(?![\d.]))"
    r"|(?P<blank>(?P<bn>□|（　）)/(?P<bd>\d+)(?![\d.]))"
    r"|(?P<frac>(?<![\d.）)])(?P<fn>\d+)/(?P<fd>\d+)(?![\d.]))"
    r"|(?P<pic>\[圖(?P<pi>\d*)\])"
    r"|(?P<nl>\n)"
)


def png_size(path):
    with open(path, "rb") as f:
        head = f.read(24)
    if head[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("不是 PNG：" + path)
    return struct.unpack(">II", head[16:24])


def image(rel):
    """複製圖片並回傳圖片片段 {img, w, h, inline}"""
    name = os.path.basename(rel)
    src = os.path.join(IMG_DIR, rel)
    dst = os.path.join(OUT_IMG, name)
    shutil.copyfile(src, dst)
    w, h = png_size(dst)
    tok = {"img": "assets/xuefu/" + name, "w": w, "h": h}
    # 小圖示（位值積木、圈數字）和文字排在同一行；橫長條、比例尺等仍獨立一行
    if h <= 70 and w <= 140:
        tok["inline"] = 1
    return tok


def tokens(text, figs=None):
    """文字 → 片段陣列；figs 是題目圖片清單（會依序取用）"""
    out, pos = [], 0
    used = set()

    def push_text(s):
        if not s:
            return
        if out and isinstance(out[-1], str) and out[-1] != "\n":
            out[-1] += s
        else:
            out.append(s)

    for m in TOKEN.finditer(text):
        push_text(text[pos:m.start()])
        pos = m.end()
        g = m.groupdict()
        if g["expr"]:
            out.append({"f": [0, g["en"], g["ed"]]})
        elif g["mixed"]:
            out.append({"f": [int(g["mw"]), int(g["mn"]), int(g["md"])]})
        elif g["blank"]:
            out.append({"f": [0, g["bn"], int(g["bd"])]})
        elif g["frac"]:
            out.append({"f": [0, int(g["fn"]), int(g["fd"])]})
        elif g["pic"]:
            if figs is None:
                raise ValueError("選項裡有 [圖]：" + text)
            # [圖2] 這種有編號的圖可以在同一題出現好幾次；沒編號的 [圖] 依序取下一張
            idx = int(g["pi"]) - 1 if g["pi"] else len(used)
            if idx >= len(figs):
                raise ValueError("圖片編號對不上：" + text)
            used.add(idx)
            out.append(image(figs[idx]))
        elif g["nl"]:
            out.append("\n")
    push_text(text[pos:])
    if figs:
        rest = [f for i, f in enumerate(figs) if i not in used]
        if rest:
            out.append("\n")
            out.extend(image(f) for f in rest)
    return out


qs = json.load(open(SRC, encoding="utf-8"))
data = {}
for q in qs:
    if q["grade"] < 3 or q["type"] != "choice" or len(q["options"]) != 4:
        raise ValueError("不支援的題目：" + q["id"])
    oi = q.get("optImgs") or [None] * 4
    opts = []
    for text, pic in zip(q["options"], oi):
        t = tokens(text or "") if text else []
        if pic:
            t = t + ([" "] if t else []) + [image(pic)]
        opts.append(t)
    src = ("模擬卷 A" if q["year"] == "mA" else q["year"] + " 年") + "第 " + str(q["no"]) + " 題"
    data.setdefault(q["grade"], []).append({
        "id": q["id"],
        "src": src,
        "k": (q.get("kegang") or [""])[0],
        "q": tokens(q["stem"], list(q.get("fig") or [])),
        "o": opts,
        "a": q["answer"],
    })

for g in data:
    data[g].sort(key=lambda x: (x["id"].split("-")[1] == "mA", x["id"].split("-")[1], int(x["id"].split("-")[2])))

body = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
with open(OUT_JS, "w", encoding="utf-8", newline="\n") as f:
    f.write("/*\n * 學習扶助單元的原題（由 tools/xuefu_build.py 產生，請不要手動修改）。\n")
    f.write(" * 來源：學扶數學網站 https://teacher-liujikan.github.io/xuefu/\n")
    f.write(" * 考古題著作權屬教育部國民及學前教育署；模擬卷 A 為原網站作者原創，僅供教學使用，請勿商用。\n */\n")
    f.write("(function (NP) {\n  'use strict';\n  NP.xuefuData = " + body + ";\n})((window.NP = window.NP || {}));\n")

print("年級題數：", {g: len(v) for g, v in sorted(data.items())})
print("圖片：", len(os.listdir(OUT_IMG)), "張")
