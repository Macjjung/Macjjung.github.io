# Product Management Portfolio

쿠팡 Shopping Lead PM 지원용 로컬 포트폴리오. HTML/CSS/JavaScript만 사용하며 외부 빌드·글꼴 의존성은 없습니다.

## 현재 구성과 디자인
표지·About Me·Contents + 세 프로젝트 각각 표지·문제/판단·실행·결과, 총 15장입니다.
최세화 포트폴리오를 참고해 Secondary Blue(#0074E9) 프로젝트 표지, 문제→판단→실행 관계도, 보상 전후 흐름, 배정 판단의 합류 도식, 결과 비교를 구성했습니다. 실제 자료가 없는 곳은 확인된 내용을 설명하는 도식을 사용합니다. 도형은 블루 계열, 쿠팡 레드는 강조 글씨에만 사용하며 구매 이벤트 용어는 ‘이벤트’로 통일합니다.

## 로컬 보기
프로젝트에서 `python3 -m http.server 8000 --bind 127.0.0.1` 실행 후 `http://127.0.0.1:8000/index.html#cover`를 엽니다. 서버 없이 index.html을 브라우저로 열어도 정적 슬라이드를 볼 수 있습니다.
방향키·Home/End·버튼·목차·스와이프·이어 읽기를 지원합니다. 1920×1080 캔버스를 비례 축소하며 인쇄 시 전체 15장을 출력하도록 전환합니다. 작은 모바일 화면에서도 16:9를 유지하므로 긴 본문은 확대나 가로 화면으로 읽는 것이 적합합니다.

## 파일 역할
- `docs/CONTENT.md`: 원본 사실과 수치. 사용자 피드백과 2026-11-11 제공 영문 이력서의 기간·역할·결제·커머스 경험을 반영했습니다.
- `docs/DESIGN_SYSTEM.md`: 현재 시각적 방향·서체·색·패턴·검수 기준.
- `docs/STRUCTURE-PROPOSAL.md`: 장별 구성. `docs/REFERENCES.md`: 참고작 적용 방식.
- `docs/CONTENT-REVIEW.md`: 미확인 자료. `docs/SLIDE-REVIEW.md`: 최신 검수 결과.
- `js/portfolio-data.js`: 현재 15장 데이터와 기존 주소 호환 별칭.
- `js/main.js`: 각 variant의 화면 생성과 탐색. `css/style.css`: 한 벌의 현재 스타일.
- `docs/archive/`: 과거 지침·슬라이드 원문·상세 기록. 현재 지침이나 배포 자료가 아닙니다.

실제 화면을 추가할 때는 `assets/images/`에 확인된 파일을 두고 `panels[n].image`에 `verified`, `src`, `alt`, `caption`을 지정합니다. 상세 형식은 DESIGN_SYSTEM.md에 있습니다. 실제 이미지가 연결되면 해당 도식 영역을 교체합니다. 06장은 상단 설명을 유지하며 좌측 하단에 무료재화 핵심 성과, 우측 하단에 사용자 제공 더 블랙 서비스 흐름 이미지를 배치합니다.

## 검수와 패키징
15장 실제 캡처와 겹침·넘침 결과는 `artifacts/slide-review/`에 있습니다. 재검사는 별도 임시 프로필의 Chrome을 디버깅 포트 9333으로 실행한 뒤 `python3 scripts/verify_slides.py --url http://127.0.0.1:8000 --debug-port 9333`을 사용합니다. 검사 도구는 자신의 새 탭만 생성합니다.

`python3 scripts/package_site.py --output /tmp/portfolio-package`로 새 폴더에 패키징합니다. 기존 출력 폴더는 덮어쓰지 않습니다. 활성 소스·favicon·현재 데이터에 명시된 검증 이미지 외에는 포함하지 않습니다. 참고 PDF·archive·비공개 자료·사용하지 않는 원본 이미지는 제외됩니다.

온라인 게시와 로컬 수정은 별개입니다. 이번 변경은 커밋·push·온라인 게시를 수행하지 않았습니다.
