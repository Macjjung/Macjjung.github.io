# Product Management Portfolio

쿠팡 Shopping Lead PM 지원용 로컬 포트폴리오. HTML/CSS/Vanilla JavaScript로 구현합니다.

## 현재 구성

전체 표지 → About Me → Contents → 더멤버스 4장 → 구매 이벤트 4장 → 소개 로직 4장, 총 15장입니다. 각 프로젝트는 표지·문제와 판단·실행·결과로 구성합니다.

콘텐츠는 `docs/CONTENT.md`, 구성은 `docs/STRUCTURE-PROPOSAL.md`, 공통 규격은 `docs/DESIGN_SYSTEM.md`를 따릅니다. 내부 참고 PDF는 `docs/references/portfolio-reference.pdf`이며 배포에서 제외합니다.

## 로컬 미리보기

프로젝트에서 `python3 -m http.server 8000 --bind 127.0.0.1` 실행 후 `http://127.0.0.1:8000/index.html#cover`를 엽니다. 외부 의존성이나 빌드는 필요 없습니다.

방향키·Home/End·좌우 버튼·목차로 이동하고, 이어 읽기 버튼으로 전체 슬라이드를 볼 수 있습니다. 인쇄 시 15장 전체를 출력하도록 전환하고 종료하면 기존 모드로 복원합니다. 캔버스는 1920×1080을 비례 축소합니다. 상세 원문은 데이터에 보존하고 Appendix 화면은 표시하지 않습니다.

## 검증과 패키징

JavaScript 문법과 모의 DOM에서 15장 생성·주소·읽기·인쇄 전환을 확인했습니다. 기본 브라우저 연결 장애로 실제 렌더링·잘림·겹침·인쇄 미리보기 검증은 남아 있습니다. 기록과 필요한 자료는 `docs/CONTENT-REVIEW.md`에 있습니다.

기존 `dist/`를 보관한 후 `python3 scripts/package_site.py`를 실행하면 허용된 정적 파일만 새 `dist/`에 생성합니다. 로컬 원본과 패키지는 온라인 사이트와 별개입니다. 이번 작업에서는 온라인 게시를 수행하지 않습니다.
