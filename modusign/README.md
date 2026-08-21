# Portfolio — Code to Impact

CPO(Chief Product Officer)의 9년 커리어 포트폴리오 사이트입니다.

## 🚀 로컬 실행

**index.html을 더블클릭하거나 브라우저에 드래그 앤 드롭하면 바로 실행됩니다.**

```bash
# 또는 터미널에서
open index.html
```

상대 경로(`css/`, `js/`)를 사용하므로 폴더 구조 그대로 유지하면 됩니다.

## 📁 폴더 구조

```
portfolio/
├── index.html          # 시맨틱 마크업 + 메타태그
├── css/
│   └── style.css       # 스타일 (라이트/다크 테마 변수 포함)
├── js/
│   └── main.js         # 스크롤 프로그레스 바, 네비게이션 dots
├── assets/             # 이미지/파비콘 (향후 추가)
└── README.md           # 이 파일
```

## 🌐 배포 방법

### GitHub Pages
1. 이 폴더를 GitHub 저장소에 푸시
2. Settings → Pages → Deploy from `main` branch 선택
3. URL 자동 생성

### Netlify
1. [netlify.com](https://netlify.com) 로그인
2. "New site from Git" 선택
3. 저장소 연결 후 자동 배포

### Vercel
1. [vercel.com](https://vercel.com) 로그인
2. "New Project" → Git 저장소 선택
3. 자동 배포

모두 상대 경로를 사용하므로 추가 설정 없이 바로 배포됩니다.

## ✨ 주요 기능

- **라이트/다크 테마**: 시스템 설정에 따라 자동 전환 (CSS 변수)
- **스크롤 프로그레스 바**: 페이지 상단 3px 진행 바
- **네비게이션 점**: 우측 15개 섹션 마커 (마우스 호버 시 라벨 표시)
- **IntersectionObserver**: 현재 섹션 자동 감지 및 활성화
- **반응형 디자인**: 모바일/태블릿/데스크톱 지원

## 🔧 파일 분리 구조

| 파일 | 역할 |
|------|------|
| `index.html` | 시맨틱 마크업 + `<head>` 메타태그 |
| `css/style.css` | 전체 스타일 (약 470줄) |
| `js/main.js` | 인터랙션 (약 30줄) |

원본의 인라인 스타일과 스크립트를 모두 분리했으므로, 캐싱 효율이 높고 유지보수가 쉽습니다.

---

**배포 준비 완료!** 🎉 로컬에서 완벽하게 테스트된 후 어디든 올리면 됩니다.
