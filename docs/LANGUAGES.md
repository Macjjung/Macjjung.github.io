# 한국어·영어 콘텐츠 관리

## 현재 상태
- 한국어: 현재 승인된 17장. 기존 문구·수치·구성을 유지한다.
- 영어: 17장 본문·120개 공통 고정 문구·메뉴·이미지 설명을 번역하고 실제 웹 화면을 검수했다. 13·14장 승인 반영 시 장별 문구를 해당 슬라이드 데이터로 이동하고 사용하지 않는 고정 문구를 정리했다.
- `status`와 17장 `translationStatus`는 `ready`다. 이는 번역과 웹 배치 검수 상태이며, 영문 PDF 파일의 최종 출력 검수 완료를 의미하지 않는다.
- 분리 시점의 한국어 콘텐츠·고정 문구 사본: `archive/ko-v1-2026-11-12.json`. 비교용이며 실행·배포에 포함하지 않는다. Git 커밋/태그와는 별개의 로컬 콘텐츠 사본이다.

## 편집할 파일
- `js/locales/ko.js`: 한국어 콘텐츠. `slides`는 장별 문구·수치·실제 이미지, `projects`는 목차, `profile`은 이름·역할, `copy`는 기존 화면 생성 코드에서 분리한 고정 문구, `ui`는 메뉴·접근성·설명 문구다.
- `js/locales/en.js`: 같은 구조의 독립 영어 콘텐츠. 한국어와 실시간 연결하거나 덮어쓰지 않는다.
- `js/portfolio-data.js`: URL의 lang 선택만 담당. 콘텐츠는 이 파일에 작성하지 않는다.
- `js/main.js`, `css/style.css`: 공통 렌더러·탐색·비례 축소·인쇄 규칙. 번역 문구는 추가하지 않는다.
- `docs/CONTENT.md`: 두 언어에 공통인 사실·기간·지표의 기준.

`copy` 키는 `membersResults`, `purchaseResults` 등 렌더러 이름과 번호로 구분한다. 번역할 원문으로 검색하면 해당 키를 찾을 수 있다. 일부 문장은 강조·줄바꿈 주변의 여러 키로 구성되므로 전체 문장으로 읽고 번역한다. 값은 일반 텍스트이며 HTML 태그를 넣지 않는다. `\n`을 지원하는 본문 필드만 줄바꿈을 사용한다.

## 열기와 전환
- 한국어: `index.html?lang=ko#cover`
- 기본 / 영어: `index.html?lang=en#cover`
- 현재 장과 보기 모드를 유지한 채 상단 언어 선택 메뉴로 전환한다.
- `view=reading`은 이어 읽기, `view=slides`는 한 장 보기다. 생략하면 화면 크기와 관계없이 Read all(이어 읽기)로 시작한다. 창 크기를 바꿔도 선택한 보기 모드를 유지한다.
- lang 생략 또는 미지원 lang 값은 영어로 처리한다. 한국어는 lang=ko로 명시한다. 로컬 HTTP 서버와 파일 직접 열기 모두 사용할 수 있도록 일반 script 파일을 순서대로 읽는다.

## 영어 번역 순서
1. `en.js`의 `slides`, `projects`, `profile`, `copy`를 번역한다. UI와 이미지 설명·캡션도 확인한다.
2. 슬라이드별 `translationStatus`는 처음에 `pending`이다. 번역 작업 중 `draft`, 사실·배치까지 검수한 뒤 `ready`로 바꾼다.
3. 언어와 무관한 `id`, `variant`, 프로젝트 번호·페이지·슬라이드 ID 목록, `aliases`, 원자료의 숫자 값은 유지한다. 회사·직책·분모·기간·부정적 결과와 인과 한계도 보존한다.
4. 제품 이미지 안의 한글은 자동으로 바뀌지 않는다. 실제 자료의 영문판이 확인되면 영어 파일의 해당 image 경로만 교체하고, 없으면 설명·캡션으로 원문 자료임을 구분한다. 가짜 영문 UI는 만들지 않는다.
5. `python3 scripts/check_locales.py` 실행 후 영어 17장 실제 렌더링, 작은 화면·이어보기·목차·PDF를 별도로 검수한다. 영어가 길어졌다고 공통 글자를 축소하지 않는다.
6. 모든 슬라이드와 공통 `copy`, 이미지·캡션 검수가 끝나면 최상위 `status`를 `ready`로 변경한다. 이때만 준비 표시가 사라진다.

## 한국어 원문이 바뀔 때
영어의 `sourceRevision`은 분리 시점 한국어 파일의 정규화 JSON SHA-256이다. 검사기가 원문 변경을 알리면 수정된 사실·문구를 영어와 대조한다. 번역에 반영하고 검수한 다음에만 아래 방식으로 새 값을 구해 `sourceRevision`에 기록한다.

`hashlib.sha256(json.dumps(ko, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()`

검사기는 장별 ID·variant·목차 연결·고정 문구 키·숫자형 원자료를 대조한다. 문장 속 숫자의 의미나 단위 환산, 번역 품질은 자동 검증하지 못하므로 CONTENT.md와 사람이 대조해야 한다. 준비본의 한글은 의도적으로 허용하고, 영어 완료 상태에는 미검수 장·남은 한글·원문 변경 경고를 허용하지 않는다.

## 패키징과 출력
- `python3 scripts/package_site.py --output <새 폴더>`는 양쪽 언어 파일을 포함하고, 각 언어에서 확인된 이미지의 합집합만 복사한다. 내부 참고 PDF·archive·원자료는 제외한다.
- 한글과 영문은 각각 해당 주소에서 인쇄하고 `ChiHun_Jung_Portfolio_KO.pdf`, `ChiHun_Jung_Portfolio_EN.pdf`처럼 별도 이름으로 저장한다.
- 영문 PDF는 별도 출력·페이지 경계 검수가 필요하다. 이번 작업은 온라인 게시·Git push를 수행하지 않는다.

## 영어 표현 기준 · 2026-11-12
- 구매 이벤트: purchase promotion. 실제 결제액은 customer spend로 통일한다. 월 결제액은 monthly customer spend, 이벤트 참여자 결제액은 participant spend로 대상을 구분하되 같은 spend 용어를 사용한다. 같은 금액 지표에 payments/revenue를 혼용하지 않는다. 결제 기술·업무 분야를 의미하는 Payments/Payment gateway는 유지한다.
- 더멤버스 재화는 tickets로 통일하고 최초 설명에 in-app credits를 병기한다. 구매량은 ticket purchases / ticket units purchased, 사용량은 ticket usage / ticket units used, 무료 지급량은 free ticket units issued로 구분한다. 골드스푼 재화는 Spoons이며 실제 결제액과 구분한다. ARPU는 지표명을 유지하되 본 자료의 금액 기준을 Customer spend per user로 설명한다.
- 더 블랙의 만남 보장은 date guarantee / guaranteed in-person date로 통일한다. 같은 상품의 제목·설명·환급 조건에서 meeting/date를 혼용하지 않는다.
- 호감 전송: likes sent; 노출: profile impressions; 번호 오픈: contact unlock; 노출 상한: profile exposure cap. 수신 카드 수와 노출 횟수를 구분한다.
- 흑자전환: reached profitability. 확인되지 않은 operating profit/EBITDA 등의 구체적 이익 지표를 만들지 않는다. PMF는 검증 목표이며 달성 성과로 표현하지 않는다.
- 금액 환산: 2,602만/3,059만 원 → ₩26.02M/₩30.59M. 더 블랙 월 800만~1,000만 원 → ₩8–10M per month. 월 결제액 원수치는 차트에 그대로 보존한다.
- 비율의 상대 변화는 %, 비율 차이는 pp로 표기한다. 전후 관찰·비교 조건·부정적 결과를 보존한다.
- 06·10장 한국어 버전은 기존 이미지를 유지한다. 영어 버전은 사용자가 제공한 영문 설명 이미지(the-black-meeting-flow-en.png, purchase-event-before-en.png, purchase-event-after-en.png)를 별도로 연결한다. 이미지 안의 실제 제품 화면에는 한국어가 남아 있으며, 추가 단계별 확대 이미지는 기존 한국어 자료를 유지한다. 10장의 부분 AI 편집 사실도 표시한다. 언어별 image.src에 따라 본문과 클릭 확대에 동일한 이미지가 표시된다.
- 영어에만 크기와 간격을 조정했다. 상세 수치는 DESIGN_SYSTEM.md, 수행 검수는 SLIDE-REVIEW.md를 따른다.
