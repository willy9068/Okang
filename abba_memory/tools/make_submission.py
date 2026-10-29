# 데모 제출 폴더 만들기 (사용자 요청 2026-10-29): D:\Okang\데모제출\ 에 필수 6가지 + 제안서를 번호 폴더로 모은다.
#   1 게임 개요 문서 · 2 대표 이미지(사용자가 찍어 넣음) · 3 데모 빌드(단일 HTML) · 4 소스 코드(zip) · 5 리소스(zip)
#   6 데모 플레이 영상(사용자가 녹화해 넣음) · 7 제안서(사용자가 고친 pptx 그대로)
# 사용: python abba_memory/tools/make_submission.py   (먼저 build_single.py 로 제출본을 새로 만들 것)
import io
import os
import shutil
import sys
import zipfile

TOOLS = os.path.dirname(os.path.abspath(__file__))
DEMO = os.path.dirname(TOOLS)            # abba_memory
ROOT = os.path.dirname(DEMO)             # D:\Okang
OUT = os.path.join(ROOT, '데모제출')
SKIP_DIRS = {'__pycache__', 'editor_backup'}
PROPOSAL = '오캉과엄마_아빠의기억_제안서.pptx'   # 사용자 결정 2026-10-29: A안(사투리 전용 슬라이드)을 사용자가 고치고 이 이름으로 저장한 판 그대로


def files_under(base):
    for d, dirs, names in os.walk(base):
        dirs[:] = sorted(x for x in dirs if x not in SKIP_DIRS)
        for n in sorted(names):
            if not n.endswith('.pyc'):
                yield os.path.join(d, n)


def add(z, path):
    z.write(path, os.path.relpath(path, ROOT).replace(os.sep, '/'))


def write(rel, text):
    p = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    io.open(p, 'w', encoding='utf-8', newline='\n').write(text)


def main():
    for sub in ['1_게임개요', '3_데모빌드', '4_소스코드', '5_리소스', '7_제안서']:   # 2·6은 손으로 넣는 것이라 지우지 않음
        shutil.rmtree(os.path.join(OUT, sub), ignore_errors=True)
        os.makedirs(os.path.join(OUT, sub))

    # 1 게임 개요 문서 (제출용 개요 + 첨부 레퍼런스 조사)
    shutil.copy(os.path.join(ROOT, '오캉과엄마_아빠의기억_게임개요_제출용.md'), os.path.join(OUT, '1_게임개요', '오캉과엄마_아빠의기억_게임개요.md'))
    shutil.copy(os.path.join(ROOT, '오캉과엄마_아빠의기억_레퍼런스조사.md'), os.path.join(OUT, '1_게임개요', '첨부_레퍼런스조사.md'))

    # 3 데모 빌드
    shutil.copy(os.path.join(DEMO, 'dist', 'abba_memory_demo.html'), os.path.join(OUT, '3_데모빌드', 'abba_memory_demo.html'))

    # 4 소스 코드: src·tools·assets·README·편집기 실행 파일. 풀면 abba_memory/ 폴더 그대로 실행·테스트·빌드됨
    with zipfile.ZipFile(os.path.join(OUT, '4_소스코드', 'abba_memory_소스코드.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
        for sub in ['src', 'tools', 'assets']:
            for p in files_under(os.path.join(DEMO, sub)):
                add(z, p)
        for rel in ['README.md', 'DEVLOG.md', '편집기_켜기.bat']:
            add(z, os.path.join(DEMO, rel))

    # 5 리소스: 게임 이미지 전체, 이미지 프롬프트·선택 기록, 수치(data.js)·화면 문장(ui_text.js)·대사(story_data.js), 설계·개발 기록
    with zipfile.ZipFile(os.path.join(OUT, '5_리소스', 'abba_memory_리소스.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
        for p in files_under(os.path.join(DEMO, 'assets')):
            add(z, p)
        for rel in ['오캉과엄마_아빠의기억_AI이미지_프롬프트_ComfyUI.md', '오캉과엄마_아빠의기억_게임개요_제출용.md',
                    '오캉과엄마_아빠의기억_게임개요.md', '오캉과엄마_아빠의기억_기획정리_v2.md',
                    '오캉과엄마_아빠의기억_데모_개발가이드_클로드코드.md', '오캉과엄마_아빠의기억_레퍼런스조사.md',
                    '오캉과엄마_아빠의기억_일일히스토리_1028.md', '오캉과엄마_아빠의기억_일일히스토리_1029.md',
                    'abba_memory/DEVLOG.md', 'abba_memory/src/data.js', 'abba_memory/src/ui_text.js', 'abba_memory/src/story_data.js']:
            add(z, os.path.join(ROOT, rel))

    # 7 제안서 (고치지 않고 그대로 복사)
    src = os.path.join(ROOT, PROPOSAL)
    if os.path.exists(src):
        shutil.copy2(src, os.path.join(OUT, '7_제안서', PROPOSAL))
    else:
        print('제안서가 없습니다:', src)

    os.makedirs(os.path.join(OUT, '2_대표이미지'), exist_ok=True)
    if not os.listdir(os.path.join(OUT, '2_대표이미지')):
        write('2_대표이미지/여기에_대표이미지.txt', '대표 이미지(게임을 상징하는 플레이 상황, UI 포함이면 우대)를 이 폴더에 넣습니다.\n'
              '제출본 3_데모빌드/abba_memory_demo.html 을 실제로 플레이하며 찍은 화면.\n')
    os.makedirs(os.path.join(OUT, '6_데모플레이영상'), exist_ok=True)
    if not os.listdir(os.path.join(OUT, '6_데모플레이영상')):
        write('6_데모플레이영상/여기에_영상.txt', '데모 플레이 영상(제출본 3_데모빌드/abba_memory_demo.html 을 실제로 플레이한 화면 녹화)을 이 폴더에 넣습니다.\n'
              '핵심 장면(재료를 합쳐 접시에 내기 → 가게 확장 → 기억 장면에서 아버지의 대사 고르기 → 태자 반응·속마음)이 처음 몇 초 안에 보이게.\n')

    for sub in sorted(os.listdir(OUT)):
        d = os.path.join(OUT, sub)
        if not os.path.isdir(d):
            continue
        names = sorted(os.listdir(d))
        size = sum(os.path.getsize(os.path.join(d, n)) for n in names)
        print(sub, len(names), '개', round(size / 1048576, 2), 'MB')


if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    main()
