(async () => {
  'use strict';
  const publicView = new URLSearchParams(location.search).get('view') === 'public';
  if (publicView) {
    window.PORTFOLIO.slides = window.PORTFOLIO.slides.filter(s => !s.pending);
    window.PORTFOLIO.appendices = window.PORTFOLIO.appendices.filter(a => a.id !== 'd');
    window.PORTFOLIO.slides.forEach(s => {
      if(s.cards) s.cards = s.cards.filter(c => !/추가 정보 필요|추가 예정|명세 확인 필요|근거 보완 필요/.test(c.title+' '+c.body));
      if(s.kind === 'closing') s.note = '';
    });
  }
  const { slides, appendices, profile, aliases = {} } = window.PORTFOLIO;
  const viewLink = document.createElement('a');
  viewLink.href = publicView ? location.pathname + location.hash : '?view=public' + location.hash;
  viewLink.textContent = publicView ? '편집용 보기' : '공개용 보기';
  document.querySelector('.topbar nav').prepend(viewLink);
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lines = s => esc(s).replace(/\n/g, '<br>');
  const safePath = p => typeof p === 'string' && /^\.?\/?assets\/[\w./ -]+\.(png|jpe?g|webp|svg)$/i.test(p) && !p.includes('..');
  const media = matchMedia('(max-width: 700px)');
  let reading = media.matches, explicitMode = false, current = 0, pointer = null, lastWheel = 0, wheelTotal = 0, lastWheelEvent = 0;
  const cards = items => items?.length ? `<div class="cards count-${items.length}">${items.map(c=>`<article class="card"><h3>${esc(c.title)}</h3><p>${esc(c.body)}</p></article>`).join('')}</div>` : '';
  const metrics = items => items?.length ? `<div class="metrics">${items.map(([v,l])=>`<div><strong>${esc(v)}</strong><span>${esc(l)}</span></div>`).join('')}</div>` : '';
  const steps = (items, cls='flow') => `<ol class="${cls}">${items.map((s,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><p>${esc(s)}</p></li>`).join('')}</ol>`;
  function charts(s) {
    return `<div class="charts"><p class="chart-legend">변경 전 <span>→</span> 변경 후 · 각 지표별 동일 척도</p>${s.bars.map(b=>{
      const max=Math.max(b.before,b.after)*1.1;
      return `<figure class="chart"><figcaption>${esc(b.label)}<strong>${esc(b.note)}</strong></figcaption><div class="bar-comparison" aria-label="${esc(b.label)} 변경 전 ${b.before}${esc(b.unit)}, 변경 후 ${b.after}${esc(b.unit)}">${[b.before,b.after].map((n,j)=>`<div class="bar-row"><span>${j?'후':'전'}</span><div class="bar-track"><i class="${j?'after':'before'}" style="width:${n/max*100}%"></i></div><b>${n}${esc(b.unit)}</b></div>`).join('')}</div></figure>`;
    }).join('')}</div>`;
  }
  const impact = () => `<div class="impact-grid">${[
    ['11.3','% ↑','추천 · 문제와 지표','반응 편차를 소개 배분에 반영','발신율 상대 개선 · 후속 전환 하락까지 분석','matching'],
    ['28.1','% ↓','수익화 · 정책 판단','기존 잔액을 보호한 재화 조정','MAU 기준 무료 지급량 감소 · 전후 관찰','economy'],
    ['3.5','개월','신규 출시 · 오너십','새 타깃의 수요를 별도 서비스로','경영진과 방향 협의 · 기획·출시 총괄','five'],
    ['50','% ↓','결제 · 기술과 사업','반복 입력과 PG 비용을 함께 개선','수수료 6% → 3% · OCR과 PG 연결','payment']
  ].map(([v,u,t,d,n,id],i)=>`<a class="impact-card" href="#${id}"><span class="micro">0${i+1} / ${t}</span><div class="impact-value">${v}<small>${u}</small></div><h3>${d}</h3><p>${n}</p><span class="card-arrow" aria-hidden="true">↗</span></a>`).join('')}</div>`;
  function contact() {
    return `${profile.name?`<p class="profile-name">${esc(profile.name)}</p>`:''}${profile.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)?`<a class="button primary" href="mailto:${esc(profile.email)}">연락하기 ↗</a>`:''}${profile.resume&&/^(\.\/)?assets\/[\w./ -]+\.pdf$/i.test(profile.resume)&&!profile.resume.includes('..')?`<a class="text-link" href="${esc(profile.resume)}">이력서 PDF ↗</a>`:''}`;
  }
  function baseContent(s) {
    switch(s.kind) {
      case 'impact': return impact();
      case 'bars': return charts(s);
      case 'policy': return `<p class="context-line">${esc(s.context)}</p>${cards(s.cards)}`;
      case 'diagnosis': return `<div class="comparison-pairs">${s.comparisons.map(([l,v])=>`<div><span>${esc(l)} · 사용자당 호감 수신</span><strong>${v}</strong></div>`).join('')}</div>${cards(s.cards)}`;
      case 'funnel': return `<div class="funnel-path"><span>노출</span><span>호감 발신</span><span>호감 수락</span><span>번호 오픈</span></div><div class="funnel-rates">${s.bars.map(b=>`<article><h3>${esc(b.label)}</h3><p class="rate-values">${b.before}% <span>→</span> <b>${b.after}%</b></p><strong class="${b.note.startsWith('−')?'negative':'positive'}">${esc(b.note)}</strong><p class="rate-denominator">분모: ${esc(b.label.split(' → ')[0])}</p></article>`).join('')}</div><p class="diagram-caption">단계별 전환율 비교 · 도형 크기는 사용자 수나 전환율을 나타내지 않습니다.</p>`;
      case 'pairs': return `<div class="comparison-pairs">${s.pairs.map(([l,v])=>`<div><span>${esc(l)}</span><strong>${v}</strong><small>관찰 기반 예상 최종 전환</small></div>`).join('')}</div>${cards(s.cards)}`;
      case 'decision': return `<div class="decision-wrap"><table class="decision"><caption>기존 서비스 통합 vs 별도 서비스 출시</caption><thead><tr><th scope="col">판단 기준</th><th scope="col">A · 기존 서비스 통합</th><th scope="col">B · 별도 출시 <span>선택</span></th></tr></thead><tbody>${s.rows.map(r=>`<tr><th scope="row">${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div>`;
      case 'branch': return `<div class="research-insight"><span>인터뷰에서 얻은 관점</span><p>호감 이후 조건의 중요도가 낮아진다는 의견과 양육·나이 차이·관계에 대한 우려가 공존했습니다.</p></div><div class="branch-start">자녀 유무 기본 비공개 → 실제 만남 권장</div><div class="branch-options"><article><span>만남 이후 확인</span><strong>무료</strong></article><article><span>사전 확인 선택</span><strong>소개티켓 1장</strong><p>차감 안내 후 사용자가 선택</p></article></div>`;
      case 'five-kpi': return `<div class="five-kpis">${s.kpis.map(([label,value,caption])=>`<article><span>${esc(label)}</span><strong class="${value.startsWith('−')?'negative':'positive'}">${esc(value)}</strong><small>${esc(caption)} · 원문 해석</small></article>`).join('')}</div><div class="compact-flow"><span>실행 범위<br><b>6인 팀 · PO / 디자인 / 개발</b></span><span>출시 소요<br><b>3.5개월 · 제품 결과물은 4개월 내 표기</b></span></div>`;
      case 'metrics': return metrics(s.metrics)+cards(s.cards);
      case 'beforeafter': return `<div class="journey-compare"><article><h3>BEFORE · 매 결제</h3>${steps(s.before)}<p>카드정보를 반복 입력</p></article><article><h3>AFTER · 최초 등록 이후</h3>${steps(s.after)}<p>등록된 결제 키를 사용</p></article></div>`;
      case 'architecture': return metrics(s.metrics)+cards(s.cards)+`<div class="compact-flow"><span>최초 등록<br><b>촬영·OCR → PG 등록 → 결제 키</b></span><span>반복 결제<br><b>앱 내 요청 → 키 기반 PG 승인</b></span></div>`;
      case 'inputs': return `<div class="input-model"><div><span>인센티브 구간</span><span>미용실 수수료</span><span>결제수단 수수료</span></div><strong>개인 조건에 맞는 정산</strong></div>${cards(s.cards)}`;
      case 'lanes': return `<div class="swimlanes"><div><h3>투숙객</h3><p>객실 태블릿 상품 선택 → 주문·결제</p></div><div><h3>서비스</h3><p>호텔오더 → RUMY 업무 수신·상태 관리</p></div><div><h3>매장·현장</h3><p>주문 확인 → 처리 → 객실 배송</p></div></div>${cards(s.cards)}`;
      case 'career': return `<div class="career-grid">${s.items.map(([d,n,r])=>`<article><small>${esc(d)}</small><h3>${esc(n)}</h3><p>${esc(r)}</p></article>`).join('')}</div>`;
      default: return cards(s.cards);
    }
  }
  function content(s) {
    return baseContent(s) + (['funnel','bars'].includes(s.kind)?cards(s.cards):'') + (s.flow?steps(s.flow):'') + (s.placeholder?`<div class="evidence-slot"><span>[이미지 삽입 영역]</span><p>${esc(s.placeholder)}</p></div>`:'');
  }
  const sectionStarts = {
    impact: ['OVERVIEW', '문제와 판단', '사례별 문제·선택·실행·결과를 보여드립니다.', 'Growth · 제품 성장'],
    economy: ['PROJECT 01', '더멤버스 · 재화 정책', '사용자 신뢰를 지키며 재화 경제를 조정하는 역량', 'Monetization · 수익화'],
    matching: ['PROJECT 02', '골드스푼 · 소개 로직', '노출부터 후속 전환까지 분석하는 역량', 'Recommendation · 추천'],
    five: ['PROJECT 03', '파이브 · 신규 출시', '새로운 시장 기회를 제품 출시로 연결하는 역량', '0→1 · 신규 제품'],
    payment: ['PROJECT 04', 'PG·OCR · 결제 개선', '반복 결제의 마찰과 사업 비용을 줄이는 역량', 'Conversion & Payment · 결제'],
    hediple: ['PROJECT 05', '헤디플 · 개인 서비스', '문제 발견부터 출시·운영까지 책임지는 역량', 'Ownership · 제품 오너십'],
    hotel: ['PROJECT 06', '호텔오더 · B2B2C', '디지털 제품을 현장 운영과 연결하는 역량', 'Execution · 실행'],
    career: ['EXPERIENCE', '경력과 기술 기반', '기술 이해를 제품 판단과 협업으로 연결하는 역량', 'Technical Leadership · 기술 협업'],
    principles: ['CLOSING', '일하는 방식', '사례에서 반복되는 의사결정 기준을 보여줍니다.', 'Product Thinking · 제품 판단']
  };
  // Shared canvas, header, title area and footer for the three design-system pilots.
  function pilotFrame(s, i, body) {
    const cover = s.pilot === 'cover';
    return `<article id="${s.id}" class="slide pilot-slide pilot-${s.pilot}" data-layout="${s.layout}" aria-label="${i+1} / ${slides.length}"><div class="pilot-canvas">
      <header class="pilot-header"><span>PRODUCT, WITH PURPOSE.</span><span>LEAD PRODUCT MANAGER / COUPANG SHOPPING</span></header>
      ${cover ? '' : `<div class="pilot-title-area"><p class="pilot-eyebrow">${esc(s.group)}</p><h1 class="pilot-h1">${lines(s.title)}</h1><p class="pilot-subtitle">${esc(s.subtitle)}</p></div>`}
      ${body}<footer class="pilot-footer"><span>INDEPENDENT PRODUCT PORTFOLIO · ${esc(s.group)}</span><span>${String(i+1).padStart(2,'0')} / ${slides.length}</span></footer>
    </div></article>`;
  }
  function pilotArticle(s,i) {
    let body;
    if(s.pilot === 'cover') body = `<div class="pilot-cover-title"><p class="pilot-caption">PRODUCT STRATEGY / CUSTOMER BEHAVIOR / BUSINESS GROWTH</p><h1>${lines(s.title)}</h1><p>${esc(s.subtitle)}</p></div><aside class="pilot-cover-index"><p class="pilot-caption">SELECTED CASE STUDIES / 01—03</p><div class="pilot-index-item"><span>01</span><h3>구매 이벤트 개선</h3><p>구매·소비 데이터 기반 보상 경험 재설계</p></div><a href="#matching-next"><span>02</span><h3>소개 로직 개편</h3><p>반응 데이터 기반 카드 배정 최적화</p></a><a href="#members-growth"><span>03</span><h3>더멤버스 성장 전략</h3><p>핵심 경험과 구매 가치 재설계</p></a></aside><p class="pilot-cover-note">고객의 행동에서 출발해<br>제품의 판단과 사업의 결과까지.</p><div class="pilot-color-strip" aria-label="Brown, Red, Yellow, Green, Blue"><i></i><i></i><i></i><i></i><i></i></div>`;
    else if(s.pilot === 'matching') body = `<div class="pilot-main pilot-analysis">
      <figure class="pilot-rate-chart"><figcaption><h2>노출 대비 호감 전송률</h2><span class="pilot-caption">분모: 카드 노출 수 · 동일 척도</span></figcaption>
        <div class="pilot-axis"><span>0%</span><span>0.4%</span><span>0.8%</span></div>
        ${[["개편 전", "0.639",79.875],["개편 후","0.711",88.875]].map(([label,value,width])=>`<div class="pilot-rate-row"><span>${label}</span><strong>${value}%</strong><div class="pilot-bar-track"><div style="width:${width}%" class="pilot-bar ${label==='개편 후'?'is-after':''}"></div></div></div>`).join('')}
        <div class="pilot-sample"><p>카드 노출 수　14,948,917 → 15,329,663</p><p>호감 전송 수　95,532 → 108,973</p></div>
      </figure>
      <aside class="pilot-analysis-aside"><p class="pilot-caption">핵심 지표 / 노출당 호감 전송 효율</p><strong class="pilot-kpi">+11.2%</strong><p>상대 증가</p><p class="pilot-reading">노출 수 +2.5%<br>호감 전송 수 +14.1%</p></aside>
      <div class="pilot-tradeoffs"><h3>후속 전환은 하락</h3><div><p>호감 수락률</p><p>25.9% → 24.9% <span>(−1.0%p)</span></p></div><div><p>수락 대비 번호 오픈율</p><p>77.0% → 75.3% <span>(−1.7%p)</span></p></div></div>
      <div class="pilot-caption pilot-caveat"><p>전 2026.07.08–08.26 / 후 2026.08.27–10.15 · 각 50일</p><p>전후 관찰 결과이며 개편만의 인과효과나 추천 품질 전체의 개선으로 단정하지 않습니다.</p></div>
    </div>`;
    else body = `<div class="pilot-main pilot-growth">
      <div class="pilot-growth-equation">
        <section class="pilot-growth-factor"><p class="pilot-caption">고객 규모</p><h2>MAU</h2><strong class="pilot-kpi">약 2.3배</strong><p>2,670명 → 6,120명</p></section>
        <span class="pilot-equation-symbol" aria-hidden="true">×</span>
        <section class="pilot-growth-factor"><p class="pilot-caption">고객당 매출</p><h2>ARPU</h2><strong class="pilot-kpi">약 2.6배</strong><p>7,562원 → 19,730원</p></section>
        <span class="pilot-equation-symbol" aria-hidden="true">≈</span>
        <section class="pilot-growth-outcome"><p class="pilot-caption">사업 전체 성과</p><h2>월 결제액</h2><strong class="pilot-kpi">약 6배</strong><p>20,190,500원 → 120,749,800원</p></section>
      </div>
      <div class="pilot-growth-strategy"><div><h3>초기 수익화 개선</h3><p>무료재화 재설계</p></div><span aria-hidden="true">→</span><div><h3>고객 가치와 구매 이유 강화</h3><p>모바일 결정사 포지셔닝 · ‘더 블랙’ 출시</p></div><p class="pilot-growth-profit">흑자전환 달성</p></div>
      <div class="pilot-caption pilot-caveat"><p>담당 기간 비교: 2024.02 → 2026.07 · 월 결제액 = MAU × ARPU (배수는 반올림)</p><p>여러 제품·사업·마케팅 활동의 결과일 수 있으며, 특정 정책 하나의 직접 효과로 귀속하지 않습니다.</p></div>
    </div>`;
    return pilotFrame(s,i,body);
  }
  function fitPilotCanvases() {
    document.querySelectorAll('.pilot-slide').forEach(slide => {
      const host = document.querySelector('#stage');
      const width = Math.min(1920, host.clientWidth, reading ? Infinity : host.clientHeight * 1920 / 1080);
      slide.style.width = `${width}px`;
      slide.style.setProperty('--pilot-scale', width / 1920);
      slide.style.height = `${width * 1080 / 1920}px`;
    });
  }
  new ResizeObserver(fitPilotCanvases).observe(document.querySelector('#stage'));
  function article(s,i) {
    if (s.pilot) return pilotArticle(s,i);
    let body;
    if(s.kind==='cover') body=`<div class="cover-layout"><div><p class="cover-meta"><span class="status-dot"></span> 지원 포지션 · NAVER WEBTOON SENIOR PM</p><h1>${lines(s.title).replace('제품으로 답합니다.','<em>제품으로 답합니다.</em>')}</h1><p class="cover-description">${lines(s.subtitle)}</p>${profile.name?`<p class="profile-name">${esc(profile.name)}</p>`:''}<div class="cover-actions"><a class="button primary" href="#impact">주요 성과 살펴보기 ↗</a><a class="text-link" href="#economy">프로젝트 바로 보기 →</a></div><div class="cover-tags">ENGINEERING → PRODUCT STRATEGY & GROWTH</div></div><div class="selected-impact"><p class="eyebrow">SELECTED IMPACT</p><div><strong>약 6배</strong><span>더멤버스 월매출 성장 · 흑자 전환</span></div><div><strong>−28.1%</strong><span>더멤버스 무료 재화 지급량</span></div><div><strong>3.5개월</strong><span>파이브 신규 서비스 출시</span></div><div><strong>+11.3%</strong><span>골드스푼 호감 발신율 · 상대 개선</span></div><p class="note">서로 다른 제품·프로젝트의 성과입니다.</p></div></div><div class="cover-bottom"><span>문제 발견 · 출시와 검증 · 기획 · 리더십</span><span>${slides.length} SLIDES · ${appendices.length} DEEP DIVES</span></div>`;
    else if(s.kind==='closing') body=`<div class="closing"><p class="eyebrow">LET’S BUILD WHAT’S NEXT</p><h1>${lines(s.title)}</h1><p class="cover-description">${lines(s.subtitle)}</p><div class="cover-actions">${contact()}<a class="text-link" href="#impact">대표 성과 다시 보기 ↗</a><a class="text-link" href="#appendix">상세 자료 보기 ↓</a></div><p class="note">${esc(s.note)}</p></div>`;
    else body=`<header class="slide-heading"><div class="slide-heading-meta"><p class="eyebrow">${esc(s.group)} <span>${String(i+1).padStart(2,'0')} / ${slides.length}</span></p>${s.appendix?`<a class="appendix-link" href="#appendix-${s.appendix}">분석 기준과 상세 자료 <span>↗</span></a>`:''}</div><h1>${lines(s.title)}</h1>${s.lead?`<p class="lead">${esc(s.lead)}</p>`:''}<p class="subtitle">${esc(s.subtitle)}</p></header>${s.ownership?`<p class="ownership-line">${esc(s.ownership)}</p>`:''}${content(s)}${s.transfer?`<p class="transfer-line"><span>웹툰에서 이어갈 관점</span>${esc(s.transfer)}</p>`:''}${s.note?`<p class="note">${esc(s.note)}</p>`:''}`;
    const section=sectionStarts[s.id];
    const boundary=section?`<div class="section-boundary"><span>${section[0]}</span><strong>${section[1]}</strong><small class="axis-description"><span>${esc(section[3])}</span>${esc(section[2])}</small></div>`:'';
    const next=slides[i+1];
    const nextSection=next&&sectionStarts[next.id];
    const transition=next?`<a class="reading-transition ${nextSection?'new-project':''}" href="#${next.id}"><span>${nextSection?'다음 구간':'이어서 보기'} · ${String(i+2).padStart(2,'0')} / ${slides.length}</span><strong>${esc(nextSection?nextSection[1]:next.title.replace(/\n/g,' '))}</strong><b aria-hidden="true">↓</b></a>`:`<a class="reading-transition new-project" href="#appendix"><span>본문 끝</span><strong>Appendix · 상세 자료 이어 보기</strong><b aria-hidden="true">↓</b></a>`;
    return `<article id="${s.id}" class="slide type-${s.kind}${section?' section-start':''}" aria-label="${i+1} / ${slides.length}">${boundary}${body}${transition}</article>`;
  }
  function syncNav() {
    $('#counter').innerHTML=`<b>${String(current+1).padStart(2,'0')}</b><span>/ ${slides.length}</span>`;
    $('#section-name').textContent=slides[current].group;
    const upcoming=slides[current+1];
    const newSection=upcoming&&sectionStarts[upcoming.id];
    $('.key-hint').innerHTML=upcoming?`<a class="next-preview" href="#${upcoming.id}"><span>${newSection?'다음 구간':'다음 내용'}</span><strong>${esc(newSection?newSection[1]:upcoming.title.replace(/\n/g,' '))}</strong><b aria-hidden="true">→</b></a>`:`<a class="next-preview" href="#appendix"><span>본문 끝</span><strong>Appendix · 상세 자료</strong><b aria-hidden="true">↓</b></a>`;
    for(const id of ['previous','side-previous']) $('#'+id).disabled=current===0;
    for(const id of ['next','side-next']) $('#'+id).disabled=current===slides.length-1;
    $('#progress').style.width=`${(current+1)/slides.length*100}%`;
    document.querySelectorAll('#toc-list a').forEach(a=>{if(a.hash===`#${slides[current].id}`)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  }
  function render() {
    document.body.classList.toggle('reading',reading);
    document.querySelector('#presentation').classList.toggle('pilot-active', !reading && !!slides[current].pilot);
    $('#mode-toggle').textContent=reading?'슬라이드 보기':'이어 읽기';
    $('#mode-toggle').setAttribute('aria-pressed',String(reading));
    $('#slide-content').innerHTML=reading?slides.map(article).join(''):article(slides[current],current);
    $('#slide-content').scrollTop=0;syncNav();fitPilotCanvases();
  }
  function route() {
    let hash=location.hash.slice(1);
    if(hash==='slide-content'){$('#slide-content').focus({preventScroll:true});return;}
    if(aliases[hash]) {hash=aliases[hash];history.replaceState(null,'',`#${hash}`);}
    if(hash.startsWith('appendix')) {
      const target=document.getElementById(hash)||$('#appendix');
      if(target.tagName==='DETAILS')target.open=true;
      document.title=`${target.querySelector('h3')?.textContent||'상세 근거'} | Senior PM Portfolio`;
      target.scrollIntoView({behavior:'instant',block:'start'});return;
    }
    const i=slides.findIndex(s=>s.id===hash);current=i<0?0:i;
    if(!reading)render(); else syncNav();
    document.title=`${slides[current].title.replace(/\n/g,' ')} | Senior PM Portfolio`;
    if(reading)document.getElementById(slides[current].id).scrollIntoView({behavior:'instant',block:'start'});
    else window.scrollTo({top:0,behavior:'instant'});
  }
  function go(i) {if(i>=0&&i<slides.length&&i!==current)location.hash=slides[i].id;}
  function markdown(text) {
    return text.split('\n').filter(l=>l.trim()&&l!=='---'&&(!publicView||!/추가 정보 필요|자료 필요|추가 예정|이메일 입력|선택 사항|공개할 프로필/.test(l))).map(l=>{
      const bold=esc(l.replace(/^#+\s*/,'').replace(/^[-*] /,'')).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
      if(l.startsWith('# '))return `<h3>${bold}</h3>`;
      if(l.startsWith('## '))return `<h4>${bold}</h4>`;
      if(l.startsWith('| ---'))return '';
      if(l.startsWith('|'))return `<p class="data-line">${bold.split('|').filter(Boolean).join(' / ')}</p>`;
      return `<p${l.startsWith('- ')?' class="detail-item"':''}>${bold}</p>`;
    }).join('');
  }
  function heatmap() {
    return `<div class="heatmap" aria-label="관찰된 조합별 예상 최종 전환"><h4>조합별 예상 최종 전환 · 제공된 두 조합만 표시</h4><div class="heat-grid"><span>남성 / 여성</span><span>여성 2등급</span><span>여성 3등급</span><span>남성 0등급</span><strong class="heat-high">0.380%</strong><span>자료 없음</span><span>남성 4등급</span><span>자료 없음</span><strong class="heat-low">0.023%</strong></div><p class="note">약 16.5배 차이. 관찰 기반 기대치이며 보편 확률이 아닙니다. 미제공 조합은 보간하지 않았습니다.</p></div>`;
  }
  $('#appendix-nav').innerHTML=appendices.map(a=>`<a href="#appendix-${a.id}">${a.id.toUpperCase()} / ${esc(a.title)}</a>`).join('');
  $('#appendix-content').innerHTML=appendices.map(a=>`<details id="appendix-${a.id}"><summary><span>${a.id.toUpperCase()}</span><h3>${esc(a.title)}</h3><small>상세 설명 · 자료 · 검증 항목</small></summary><div class="appendix-body"><div class="appendix-detail">${a.brief?.length?`<div class="case-brief"><p class="eyebrow">판단과 실행 요약</p>${a.brief.map(b=>`<article><h4>${esc(b.title)}</h4><p>${esc(b.body)}</p></article>`).join('')}</div>`:''}${markdown(a.raw)}${a.id==='b'?heatmap():''}</div><aside><h4>확인 및 공개 승인</h4><ul>${a.checks.map(c=>`<li>${esc(c)} · 추후 검증</li>`).join('')}</ul><p class="note">내부 정책·수치·실제 자료는 공개 승인 확인 필요.</p><h4>제품 화면 & 원본 자료</h4><div class="gallery">${a.images.length?a.images.filter(i=>safePath(i.src)).map(i=>`<button class="image-thumb" data-image="${esc(i.src)}" data-alt="${esc(i.alt)}"><img src="${esc(i.src)}" alt="${esc(i.alt)}" loading="lazy"><span>${esc(i.alt)} ↗</span></button>`).join(''):`<div class="image-placeholder"><span>▧</span><strong>자료 추가 예정</strong><p>실제 화면과 원본 증빙이 제공되면<br>이곳에서 확대하여 볼 수 있습니다.</p></div>`}</div><ul class="material-list">${a.materials.map(m=>`<li>${esc(m)}<small>자료 추가 예정</small></li>`).join('')}</ul><a class="text-link" href="#${slides.find(s=>s.appendix===a.id)?.id||'career'}">해당 프로젝트로 돌아가기 ↑</a></aside></div></details>`).join('');
  const groups = [['시작하기',['cover','impact']],['01 / 문제 발견과 판단',['economy','economy-data','members-growth']],['02 / 출시와 검증',['five','five-results']],['03 / 정책 기획과 후속 설계',['matching','matching-next']],['04 / 리더십 · 준비 중',['leadership','leadership-results']],['마무리',['closing']]];
  $('#toc-list').innerHTML=groups.map(([name,ids])=>[name,ids.filter(id=>slides.some(s=>s.id===id))]).filter(([,ids])=>ids.length).map(([name,ids])=>`<details class="toc-group"><summary>${name}<small>${ids.length}장</small></summary>${ids.map(id=>{const i=slides.findIndex(s=>s.id===id);return `<a href="#${id}"><span>${String(i+1).padStart(2,'0')}</span><div>${esc(slides[i].title.replace(/\n/g,' '))}</div><span>↗</span></a>`;}).join('')}</details>`).join('');
  $('#toc-open').addEventListener('click',()=>$('#toc-dialog').showModal());
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  $('#toc-list').addEventListener('click',e=>{if(e.target.closest('a')){$('#toc-dialog').close();$('#slide-content').focus({preventScroll:true});}});
  $('#mode-toggle').addEventListener('click',()=>{explicitMode=true;reading=!reading;history.replaceState(null,'',`#${slides[current].id}`);render();route();});
  media.addEventListener('change',()=>{if(!explicitMode){reading=media.matches;render();route();}});
  for(const id of ['previous','side-previous'])$('#'+id).addEventListener('click',()=>go(current-1));
  for(const id of ['next','side-next'])$('#'+id).addEventListener('click',()=>go(current+1));
  $('#back-to-deck').addEventListener('click',()=>{history.pushState(null,'',`#${slides[current].id}`);route();$('#slide-content').focus({preventScroll:true});});
  document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a&&a.hash===location.hash){e.preventDefault();route();}});
  document.addEventListener('keydown',e=>{
    if(reading||document.querySelector('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable||window.scrollY>window.innerHeight/2)return;
    if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();go(e.key==='Home'?0:e.key==='End'?slides.length-1:current+(e.key==='ArrowRight'?1:-1));}
  });
  $('#stage').addEventListener('wheel',e=>{if(reading||Math.abs(e.deltaX)<=Math.abs(e.deltaY)||Math.abs(e.deltaX)<2)return;e.preventDefault();const now=Date.now();if(now-lastWheel<650)return;if(now-lastWheelEvent>180)wheelTotal=0;lastWheelEvent=now;wheelTotal+=e.deltaX;if(Math.abs(wheelTotal)>65){go(current+(wheelTotal>0?1:-1));lastWheel=now;wheelTotal=0;}},{passive:false});
  $('#stage').addEventListener('pointerdown',e=>{if(reading||e.target.closest('a,button,svg,table')||(e.pointerType==='mouse'&&e.button!==0))return;pointer={x:e.clientX,y:e.clientY,id:e.pointerId};});
  $('#stage').addEventListener('pointerup',e=>{if(!pointer||pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.6){go(current+(dx<0?1:-1));window.getSelection()?.removeAllRanges();}});
  $('#stage').addEventListener('pointercancel',()=>pointer=null);
  $('#stage').addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')pointer=null;});
  let scrollQueued=false;
  window.addEventListener('scroll',()=>{if(!reading||scrollQueued)return;scrollQueued=true;requestAnimationFrame(()=>{scrollQueued=false;const nodes=[...document.querySelectorAll('#slide-content > article')];const index=nodes.findLastIndex(n=>n.getBoundingClientRect().top<150);if(index>=0&&index!==current){current=index;syncNav();}});},{passive:true});
  $('#fullscreen').hidden=!document.fullscreenEnabled;
  $('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('#toast').textContent='이 브라우저에서는 전체 화면을 사용할 수 없습니다.';setTimeout(()=>$('#toast').textContent='',3500);}});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-image]');if(!b)return;$('#expanded-image').src=b.dataset.image;$('#expanded-image').alt=b.dataset.alt;$('#image-caption').textContent=b.dataset.alt;$('#image-dialog').showModal();});
  document.querySelectorAll('.image-thumb img').forEach(img=>img.addEventListener('error',()=>{const b=img.closest('button');b.disabled=true;b.removeAttribute('data-image');b.innerHTML='<span>이미지를 불러올 수 없습니다.</span>';}));
  window.addEventListener('hashchange',route);render();route();
})();
