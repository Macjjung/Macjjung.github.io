# Product, with purpose.

NAVER WEBTOON Senior PM 지원용 한국어 개인 포트폴리오. HTML/CSS/Vanilla JavaScript만 사용합니다. WEBTOON Green `#00DC64`를 유지하며 공식 제작·보증 자료는 아닙니다.

## 미리보기

프로젝트에서 `python3 -m http.server 8000 --bind 127.0.0.1` 실행 후 `http://127.0.0.1:8000`을 엽니다. 외부 라이브러리·빌드·API 키가 필요하지 않습니다.

## 17장 구성과 탐색

- 표지 → 대표 성과 → 재화 정책 2장 → 추천 3장 → 파이브 3장 → 결제 2장 → 헤디플 → 호텔오더 → 경력 → 원칙 → 마무리.
- 데스크톱 기본: 슬라이드 모드. 좌우 버튼, 방향키, Home/End, 가로 드래그 및 수평 트랙패드로 탐색합니다.
- 700px 이하 기본: 세로 이어 읽기. 상단 버튼으로 어느 화면에서도 모드를 전환할 수 있습니다. 사용자가 선택한 모드는 현재 페이지에서 화면 크기보다 우선합니다.
- 목차는 프로젝트별로 펼칩니다. 각 슬라이드의 URL 해시, 새로고침·뒤로 가기, 기존 28장 주소의 별칭을 지원합니다.
- Appendix A–H에는 상세 맥락·역할·해석 기준을 유지합니다. 향후 자료 입력을 위해 기존 이미지 플레이스홀더와 자료 추가 예정 목록을 유지합니다.
- 전체 목차는 `docs/SLIDES.md`, 검증 결과는 `docs/VALIDATION.md`를 참고하세요.

## 파일

- `index.html`: 앱 셸과 탐색 버튼
- `js/portfolio-data.js`: 17장 데이터, Appendix, 기존 주소 별칭, 프로필
- `js/main.js`: 프로젝트별 시각화와 탐색·읽기 모드
- `css/style.css`: 디자인, 모바일 및 낮은 노트북 화면 대응
- `scripts/package_site.py`: 새 `dist/`에 배포용 파일을 모으는 기존 도구

## 프로필과 이미지

`profile.name`, `profile.email`, `profile.resume`을 입력하면 표시됩니다. 현재 값은 비어 있으며 이름이나 연락처를 임의로 만들지 않았습니다. 이력서 경로는 `assets/documents/resume.pdf`처럼 assets 내부 PDF를 사용합니다.

실제 이미지는 공개 가능한 파일을 `assets/images/`에 저장하고 Appendix의 `images`에 `{ "src": "assets/images/example.png", "alt": "이미지 설명" }`으로 등록합니다. 기존 assets 루트 이미지와 tmp 파일은 자동으로 사용하지 않습니다.

## 데이터 해석

장기 제품 매출과 개별 정책 효과를 구분합니다. 전후 관찰을 통제 실험처럼 표현하지 않습니다. 추천 퍼널의 단계별 분모는 다르며 도형 면적은 사용자 수를 나타내지 않습니다. 두 조합만 있는 데이터는 비교 형태로 보여주고 전체 히트맵을 추정하지 않습니다. 미확인 측정 기간·분모·증빙 목록은 `docs/CONTENT-REVIEW.md`에 남겨두었습니다.

## 배포

이번 변경은 로컬 원본 및 dist 정적 파일에 반영했습니다. Git 커밋·push·GitHub Pages 게시를 수행하지 않았습니다. 기존 공개 사이트는 배포 전까지 바뀌지 않습니다.

새 패키징은 기존 `dist/`를 보관한 뒤 `python3 scripts/package_site.py`로 생성합니다. 배포 시 이름·연락처와 지표 확인 항목을 검토하세요.
