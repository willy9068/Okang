# 제출본 만들기: src/ 의 파일과 assets/ 의 그림을 HTML 한 파일로 합칩니다.
# 실행: python tools/build_single.py   →   dist/abba_memory_demo.html
# - 스크립트는 index.html 에 적힌 순서대로 그대로 넣음 (ES module·fetch 없음, file:// 로 열림)
# - 그림은 data.js 의 images 목록 중 assets/ 에 있는 것만 WebP 로 줄여 넣음 (없는 그림은 게임이 대신 그림)
# - Pillow 가 필요합니다: pip install pillow
import base64
import io
import os
import re
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # abba_memory
SRC = os.path.join(ROOT, 'src')
ASSETS = os.path.join(ROOT, 'assets')
OUT = os.path.join(ROOT, 'dist', 'abba_memory_demo.html')

WEBP_QUALITY = 82          # 화질 (0~100). 낮을수록 파일이 작아짐
BG_MAX = (1080, 1920)      # 배경 그림 최대 크기 (지금 그림 크기 그대로)


def image_names():
    """data.js 의 images 목록에서 그림 이름을 읽음"""
    s = open(os.path.join(SRC, 'data.js'), encoding='utf-8').read()
    block = s[s.index('images: ['):]
    block = block[:block.index(']')]
    block = re.sub(r'//[^\n]*', '', block)   # 주석 빼기
    return re.findall(r"'([a-z0-9_]+)'", block)


def to_webp(path):
    im = Image.open(path)
    im = im.convert('RGBA') if im.mode in ('RGBA', 'LA', 'P') else im.convert('RGB')
    if im.width > BG_MAX[0] or im.height > BG_MAX[1]:
        im.thumbnail(BG_MAX, Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=WEBP_QUALITY, method=6)
    return buf.getvalue()


def main():
    html = open(os.path.join(SRC, 'index.html'), encoding='utf-8').read()

    # 그림
    data, used, missing, raw_total = {}, 0, [], 0
    for name in image_names():
        p = os.path.join(ASSETS, name + '.png')
        if not os.path.exists(p):
            missing.append(name)
            continue
        b = to_webp(p)
        raw_total += os.path.getsize(p)
        used += len(b)
        data[name] = 'data:image/webp;base64,' + base64.b64encode(b).decode('ascii')
    assets_js = ('var G = G || {};\nG.ASSET_ONLY = true;\nG.ASSET_DATA = {\n' +
                 ',\n'.join('  %s: "%s"' % (k, v) for k, v in data.items()) + '\n};\n')

    # 스크립트를 순서대로 넣기 (ui.js 앞에 그림)
    # 목록은 index.html 의 SCRIPTS (개발본은 이 목록을 매번 새로 읽음)
    m = re.search(r'<script>\s*var SCRIPTS = \[(.*?)\];.*?</script>', html, re.S)
    if not m:
        sys.exit('index.html 에서 SCRIPTS 목록을 찾지 못했습니다.')
    names = re.findall(r"'([^']+\.js)'", m.group(1))
    parts = []
    for name in names:
        code = open(os.path.join(SRC, name), encoding='utf-8').read()
        code = code.replace('</script', '<\\/script')
        if name == 'ui.js':
            parts.append('<script>\n' + assets_js + '</script>')
        parts.append('<script>\n// ---- ' + name + ' ----\n' + code + '\n</script>')
    html = html[:m.start()] + '\n'.join(parts) + html[m.end():]
    n = len(names)
    if 'ASSET_DATA' not in html:
        sys.exit('ui.js 를 찾지 못해 그림을 넣지 못했습니다.')
    if re.search(r'<script src=|<link [^>]*href=', html):
        sys.exit('밖의 파일을 부르는 줄이 남아 있습니다.')

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write(html)

    mb = lambda x: '%.1fMB' % (x / 1048576)
    print('만듦: dist/abba_memory_demo.html (%s)' % mb(os.path.getsize(OUT)))
    print('  스크립트 %d개, 그림 %d장 (PNG %s → WebP %s)' % (n, len(data), mb(raw_total), mb(used)))
    if missing:
        print('  그림 없음 (게임이 대신 그림): ' + ', '.join(missing))


if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    main()
