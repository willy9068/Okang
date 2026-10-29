# 대사·UI 편집기 서버. 실행: abba_memory/편집기_켜기.bat (또는 python tools/editor_server.py)
# - 이 컴퓨터에서만 열리는 주소(127.0.0.1)로 abba_memory 폴더를 보여 주고, 편집기 화면을 브라우저로 엶
# - 편집기에서 '저장'을 누르면 src/ui_text.js 와 src/story_data.js 를 다시 씀
# - 저장하기 전 파일은 tools/editor_backup/<날짜_시각>/ 에 남겨 둠
import datetime
import http.server
import json
import os
import shutil
import sys
import threading
import webbrowser

PORT = 8770
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # abba_memory
SRC = os.path.join(ROOT, 'src')
BACKUP = os.path.join(ROOT, 'tools', 'editor_backup')

UI_HEADER = """// 화면 배치(위치·크기, 540×960 좌표) · 화면 문장 · 이름표 · 손님 이름
// ★ 편집기(abba_memory/편집기_켜기.bat)가 이 파일을 통째로 다시 씁니다. 직접 고쳐도 되지만 형식(JSON)을 지켜 주세요.
var G = G || {};

"""

STORY_HEADER = """// 스토리 대사 (★ 모두 임시 문장 — 원작 확인·제작사 검수 전. 작성자가 직접 고쳐 쓰는 파일입니다)
// 상징(2026-10-29, 켄터키 루트 제로 참고): 장화 · 가마솥과 국 · 간판(이름). 이유는 대사로 다 말하지 않고 물건으로 암시합니다.
// 말투(2026-10-29): 전부 부산 사투리 (장면 설명·속마음은 아버지가 회상하는 말투). 사투리 검수 전
//   참고: 사용자 제공 '부산사투리 모음'(만다꼬, 어데, 우야꼬, 밥 뭇나, 파이다, 머라캐쌌노, 고마해라, 욕보이소),
//         영화 「범죄와의 전쟁」(1982~1990 부산 남자 말투: ~제·~노·~다 아이가, 마, 묵다). 아버지는 스토리 2부터 태자에게 반말
// ★ 편집기(abba_memory/편집기_켜기.bat)가 이 파일을 통째로 다시 씁니다.
//
// 장면: intro(도입, 새 게임 시작 때) / story1(확장 1단계 직후) / story2(확장 2단계 직후) / ending(마무리, 스토리 2 바로 뒤)
// 한 줄의 모양
//   { "who": "narr",   "text": "..." }   장면 설명 (이름표 없음, 두 인물 다 어둡게)
//   { "who": "father", "text": "..." }   나(아버지)
//   { "who": "mother", "text": "..." }   태자
//   { "who": "mono",   "text": "..." }   아버지 속마음 (남색 창, 노란 기울임 글자)
//   { "choice": { "prompt": "...", "options": [ { "text", "react", "mono" } ×3 ] } }
//       react = 고른 직후 태자의 반응 한 줄, mono = 이어지는 아버지 독백 한 줄.
//       고른 뒤 이야기는 어떤 것을 골라도 같습니다 (선택은 쌓이지 않음).
// 이름표 글자는 ui_text.js 의 names 에서 바꿉니다.
var G = G || {};

"""

STORY_IDS = ['intro', 'story1', 'story2', 'ending']
WHO = ['narr', 'father', 'mother', 'mono']
UI_KEYS = ['layout', 'boardPos', 'storyLayout', 'names', 'customers', 'tutorial', 'texts']


def check(ui, story):
    """저장 전에 형식이 맞는지 확인. 틀리면 이유 문장을 돌려줌"""
    for k in UI_KEYS:
        if k not in ui:
            return '화면 값에 %s 가 없습니다.' % k
    for sid in STORY_IDS:
        if sid not in story or not isinstance(story[sid].get('lines'), list) or not story[sid]['lines']:
            return '대사 장면 %s 가 비어 있습니다.' % sid
        for n, line in enumerate(story[sid]['lines'], 1):
            if 'choice' in line:
                ops = line['choice'].get('options', [])
                if len(ops) != 3:
                    return '%s %d번째 선택지는 보기가 3개여야 합니다.' % (sid, n)
                for o in ops:
                    if not (o.get('text') and o.get('react') and o.get('mono')):
                        return '%s %d번째 선택지에 빈 칸(보기·반응·속마음)이 있습니다.' % (sid, n)
            elif line.get('who') not in WHO or not str(line.get('text', '')).strip():
                return '%s %d번째 줄이 비어 있거나 말하는 사람이 없습니다.' % (sid, n)
    return None


def save(ui, story):
    stamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    bdir = os.path.join(BACKUP, stamp)
    os.makedirs(bdir, exist_ok=True)
    for f in ('ui_text.js', 'story_data.js'):
        p = os.path.join(SRC, f)
        if os.path.exists(p):
            shutil.copy2(p, os.path.join(bdir, f))
    ui_js = UI_HEADER + 'G.UI_TEXT = ' + json.dumps(ui, ensure_ascii=False, indent=2) + ';\n\nG.applyUiText(G.UI_TEXT);\n'
    story_js = STORY_HEADER + 'G.STORY = ' + json.dumps(story, ensure_ascii=False, indent=2) + ';\n'
    with open(os.path.join(SRC, 'ui_text.js'), 'w', encoding='utf-8', newline='\n') as fp:
        fp.write(ui_js)
    with open(os.path.join(SRC, 'story_data.js'), 'w', encoding='utf-8', newline='\n') as fp:
        fp.write(story_js)
    return stamp


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')   # 저장한 파일이 바로 보이게
        super().end_headers()

    def reply(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != '/api/save':
            self.reply(404, {'ok': False, 'error': '없는 주소'})
            return
        try:
            n = int(self.headers.get('Content-Length', '0'))
            data = json.loads(self.rfile.read(n).decode('utf-8'))
            err = check(data.get('ui', {}), data.get('story', {}))
            if err:
                self.reply(400, {'ok': False, 'error': err})
                return
            stamp = save(data['ui'], data['story'])
            print('저장함 (이전 파일은 tools/editor_backup/%s)' % stamp)
            self.reply(200, {'ok': True, 'backup': stamp})
        except Exception as e:   # 저장 실패는 화면에 이유를 보여 줌
            self.reply(500, {'ok': False, 'error': str(e)})

    def log_message(self, fmt, *args):
        pass   # 요청마다 줄이 찍히지 않게


def main(open_browser=True):
    url = 'http://127.0.0.1:%d/tools/editor.html' % PORT
    try:
        srv = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), Handler)
    except OSError:
        print('편집기가 이미 켜져 있는 것 같습니다. 브라우저에서 엽니다: ' + url)
        webbrowser.open(url)
        return
    print('편집기 주소: ' + url)
    print('이 창을 닫으면 편집기가 꺼집니다.')
    if open_browser:
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    main(open_browser='--no-browser' not in sys.argv)
