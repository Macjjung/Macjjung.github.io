# Product, with purpose.

NAVER WEBTOON Senior PM 지원용 한국어 인터랙티브 포트폴리오. HTML/CSS/Vanilla JavaScript와 SVG만 사용하며 빌드·API 키·외부 CDN이 필요하지 않습니다. WEBTOON Green `#00DC64`를 사용하는 개인 포트폴리오로, 공식 제작·보증 자료가 아닙니다.

## 실행

프로젝트 루트에서 `python3 -m http.server 8000 --bind 127.0.0.1` 실행 후 `http://127.0.0.1:8000`을 엽니다. 서버는 Ctrl+C로 종료합니다. `index.html` 직접 열기도 가능하지만 HTTP 미리보기를 권장합니다.

## 탐색

- 좌우 버튼·방향키·Home/End, 마우스 드래그, 모바일 가로 스와이프, 수평 트랙패드로 28장을 탐색합니다.
- 긴 슬라이드는 내부 세로 스크롤이 가능합니다. 세로 제스처는 슬라이드를 전환하지 않습니다.
- 목차에서 각 슬라이드로 이동합니다. `#matching-next`처럼 URL 해시를 공유하고 새로고침·뒤로 가기로 복원합니다.
- `Appendix` 또는 프로젝트 하단 링크로 본문 아래의 별도 영역에 진입합니다. A–H 아코디언과 복귀 링크가 있습니다.
- 차트는 전후 수치를 항상 함께 표시합니다. 막대 hover 시 SVG 툴팁을 제공하고, 접근성 설명과 키보드 포커스를 포함합니다.
- 지원 브라우저에서 전체 화면을 사용합니다. 작은 화면에는 이 버튼을 표시하지 않습니다.
- 실제 이미지가 등록되면 갤러리에서 클릭·키보드로 확대합니다. Escape로 대화상자를 닫습니다. 미제공 자료는 플레이스홀더로 표시합니다.

## 구성

- `index.html`: 정적 앱 셸, 접근성 랜드마크, 대화상자
- `css/style.css`: 디자인 토큰·반응형·모션 감소 설정
- `js/portfolio-data.js`: 28개 슬라이드, A–H 상세 데이터, 프로필
- `js/main.js`: 렌더러, SVG 차트, 목차·해시·제스처·갤러리
- `assets/images/`: 외부 공개를 승인받은 이미지 전용
- `docs/SLIDES.md`: 전체 슬라이드 목차
- `docs/CONTENT-REVIEW.md`: 미확인 항목·공개 승인·시각화 설명
- `docs/VALIDATION.md`: 수행한 검증과 아직 필요한 브라우저 검증
- `scripts/package_site.py`: 배포 파일만 `dist/`에 복사하는 선택적 도구

## GitHub Pages 배포

현재 구현을 외부에 자동 게시하지 않았습니다. 먼저 `docs/CONTENT-REVIEW.md`의 회사 자료 공개 여부를 확인하세요. 숨겨진 아코디언이나 사용하지 않는 데이터도 공개 저장소에서 읽을 수 있습니다.

1. 로컬 실행 후 슬라이드·Appendix·연락처와 공개 승인 항목을 검토합니다.
2. `python3 scripts/package_site.py`로 `dist/`를 생성합니다. 기존 `dist/`가 있으면 안전을 위해 중단하므로 기존 결과를 검토하고 별도 보관하거나 삭제한 후 재실행합니다.
3. GitHub의 새 공개 저장소에 **dist 폴더 내부 파일**을 루트로 업로드·커밋합니다. `index.html`, `css`, `js`, `assets`, `.nojekyll`이 저장소 루트에 있어야 합니다. 개발 소스 전체를 공개하려면 기존 파일과 Git 이력도 먼저 검토하세요.
4. 저장소 Settings → Pages → Build and deployment에서 Deploy from a branch를 선택하고 `main` / `(root)`를 저장합니다.
5. Pages 배포 완료 후 표시된 주소를 엽니다. 일반 프로젝트 주소는 `https://<계정>.github.io/<저장소>/` 형식입니다.
6. 배포 주소의 `#impact`, `#appendix-b`로 직접 진입하고 새로고침·뒤로 가기를 확인합니다. 모든 정적 자원 경로는 상대 경로입니다.

기존 `assets/` 루트 PNG와 `tmp/`는 내용·공개 가능 여부를 검증하지 않아 사이트에서 사용하지 않았습니다. 패키징 스크립트도 이 파일들을 복사하지 않습니다. 검토 없이 저장소 전체를 공개하면 과거 Git 이력과 사용하지 않는 파일까지 공개될 수 있습니다.

## 콘텐츠 수정 / 프로젝트 추가

`window.PORTFOLIO.slides`의 객체를 편집합니다. 각 객체의 `id`는 고유해야 합니다. `group`, `title`, `subtitle`과 `kind`를 지정합니다. `title` 안의 `\n`은 제목 줄바꿈입니다.

지원 kind: `cover`, `closing`, `cards`, `overview`, `impact`, `timeline`, `bars`, `results`, `funnel`, `policy`, `compare`, `flow`, `metrics`, `principles`.

- `cards`: `{title, body}` 목록
- `bars`: `{label, before, after, unit, note}` 목록. 동일 차트 내 두 막대는 같은 0 기준 축을 사용합니다. 서로 다른 지표는 별도 축입니다.
- `steps`: 순서가 있는 텍스트 목록
- `metrics`: `[값, 설명]` 목록
- `appendix`: 연결할 상세 항목 ID (`a`–`h`)
- `note`: 기간·분모·인과 해석의 한계
- `takeaway`: 핵심 학습

추가 프로젝트는 이 구조에 맞는 슬라이드와 appendix 객체를 추가하면 목차·번호·진행률이 자동 생성됩니다. 커버 하단의 요약 개수는 함께 수정하세요. `impact()`는 네 가지 대표 성과용 특수 레이아웃이므로 대표 성과를 변경하면 `js/main.js`의 해당 함수도 수정합니다.

## 실제 이미지와 프로필 추가

1. 공개 승인을 받은 비식별 이미지를 `assets/images/`에 저장합니다.
2. 해당 appendix의 `images`를 다음처럼 수정합니다: `[{ "src": "assets/images/payment-flow.png", "alt": "개인·카드정보를 제거한 카드 등록 화면" }]`.
3. 프로젝트 실제 화면을 연결했으면 `materials`의 추가 예정 문구도 검토합니다. 현재 materials는 원본 자료가 미제공인 목록입니다.
4. `profile.name`, `profile.email`에 본인이 공개하려는 이름·연락처를 입력합니다. 기본값은 빈 문자열이며 임의 연락처를 넣지 않았습니다.
5. 이력서는 `assets/documents/resume.pdf`에 저장하고 `profile.resume`에 경로를 설정합니다. closing 슬라이드의 추가 예정 안내도 함께 수정합니다.

허용 이미지 형식은 PNG/JPG/JPEG/WebP/SVG, 경로는 로컬 assets 하위입니다. URL·스크립트 삽입은 허용하지 않습니다. SVG에는 신뢰할 수 있는 정적 자료만 넣으세요.

## 배포 전 확인

- 이름·연락처·이력서 및 자료 추가 예정 항목을 교체하거나 의도대로 유지
- 내부 매출·등급 체계·정책·사업장·화면의 외부 공개 승인
- 개인정보·카드정보·원본 로그·API 키와 과거 Git 이력 확인
- 28장 전체, 8개 Appendix, 목차·해시·뒤로 가기·새로고침
- 데스크톱 1440×900 / 1280×720, 모바일 390×844 / 360×800
- 가로 스와이프·세로 스크롤·최종 장 아래 Appendix 접근
- 이미지 있음/없음/오류, 확대·Escape·포커스 복귀
- 200% 확대, 키보드·화면낭독기, 모션 감소, 실제 터치 디바이스

GitHub 공식 안내: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
