(() => {
  'use strict';
  const { slides, appendices, profile, aliases = {} } = window.PORTFOLIO;
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
    ['약 6','배','전체 제품 성장','월매출 2,022만 → 1억 2,075만 원','2024.02 → 2026.07 · 여러 개선이 반영된 장기 성과','economy'],
    ['11.3','% ↑','골드스푼 추천 배분','발신율 0.639% → 0.711%','상대 개선 · 후속 단계 전환율은 하락','matching-next'],
    ['3.5','개월','신규 출시','첫 달 매출 2,500만 원','기존 모듈 활용 · 신규 타깃 정책 설계','five'],
    ['50','% ↓','결제 비용','PG 수수료 6% → 3%','자체 OCR + PG 카드 등록·재결제','payment']
  ].map(([v,u,t,d,n,id],i)=>`<a class="impact-card" href="#${id}"><span class="micro">0${i+1} / ${t}</span><div class="impact-value">${v}<small>${u}</small></div><h3>${d}</h3><p>${n}</p><span class="card-arrow" aria-hidden="true">↗</span></a>`).join('')}</div>`;
  function contact() {
    return `${profile.name?`<p class="profile-name">${esc(profile.name)}</p>`:''}${profile.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)?`<a class="button primary" href="mailto:${esc(profile.email)}">연락하기 ↗</a>`:''}${profile.resume&&/^(\.\/)?assets\/[\w./ -]+\.pdf$/i.test(profile.resume)&&!profile.resume.includes('..')?`<a class="text-link" href="${esc(profile.resume)}">이력서 PDF ↗</a>`:''}`;
  }
  function content(s) {
    switch(s.kind) {
      case 'impact': return impact();
      case 'bars': return charts(s);
      case 'policy': return `<p class="context-line">${esc(s.context)}</p>${cards(s.cards)}`;
      case 'diagnosis': return `<div class="comparison-pairs">${s.comparisons.map(([l,v])=>`<div><span>${esc(l)} · 사용자당 호감 수신</span><strong>${v}</strong></div>`).join('')}</div>${cards(s.cards)}`;
      case 'funnel': return `<div class="funnel-path"><span>노출</span><span>호감 발신</span><span>호감 수락</span><span>번호 오픈</span></div><div class="funnel-rates">${s.bars.map(b=>`<article><h3>${esc(b.label)}</h3><p class="rate-values">${b.before}% <span>→</span> <b>${b.after}%</b></p><strong class="${b.note.startsWith('−')?'negative':'positive'}">${esc(b.note)}</strong><p class="rate-denominator">분모: ${esc(b.label.split(' → ')[0])}</p></article>`).join('')}</div><p class="diagram-caption">단계별 전환율 비교 · 도형 크기는 사용자 수나 전환율을 나타내지 않습니다.</p>`;
      case 'pairs': return `<div class="comparison-pairs">${s.pairs.map(([l,v])=>`<div><span>${esc(l)}</span><strong>${v}</strong><small>관찰 기반 예상 최종 전환</small></div>`).join('')}</div>${cards(s.cards)}`;
      case 'decision': return `<div class="decision-wrap"><table class="decision"><caption>기존 서비스 통합 vs 별도 서비스 출시</caption><thead><tr><th scope="col">판단 기준</th><th scope="col">A · 기존 서비스 통합</th><th scope="col">B · 별도 출시 <span>선택</span></th></tr></thead><tbody>${s.rows.map(r=>`<tr><th scope="row">${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div>`;
      case 'branch': return `<div class="research-insight"><span>인터뷰에서 얻은 관점</span><p>호감이 형성된 뒤에는 자녀 유무가 반드시 결정적 장애물이 되지는 않는다는 의견.</p></div><div class="branch-start">자녀 유무 기본 비공개 → 실제 만남 권장</div><div class="branch-options"><article><span>만남 이후 확인</span><strong>무료</strong></article><article><span>사전 확인 선택</span><strong>소개티켓 1장</strong><p>차감 안내 후 사용자가 선택</p></article></div>`;
      case 'metrics': return metrics(s.metrics)+cards(s.cards);
      case 'beforeafter': return `<div class="journey-compare"><article><h3>BEFORE · 매 결제</h3>${steps(s.before)}<p>카드정보를 반복 입력</p></article><article><h3>AFTER · 최초 등록 이후</h3>${steps(s.after)}<p>등록된 결제 키를 사용</p></article></div>`;
      case 'architecture': return metrics(s.metrics)+cards(s.cards)+`<div class="compact-flow"><span>최초 등록<br><b>촬영·OCR → PG 등록 → 결제 키</b></span><span>반복 결제<br><b>앱 내 요청 → 키 기반 PG 승인</b></span></div>`;
      case 'inputs': return `<div class="input-model"><div><span>인센티브 구간</span><span>미용실 수수료</span><span>결제수단 수수료</span></div><strong>개인 조건에 맞는 정산</strong></div>${cards(s.cards)}`;
      case 'lanes': return `<div class="swimlanes"><div><h3>투숙객</h3><p>객실 태블릿 상품 선택 → 주문·결제</p></div><div><h3>서비스</h3><p>호텔오더 → RUMY 업무 수신·상태 관리</p></div><div><h3>매장·현장</h3><p>주문 확인 → 처리 → 객실 배송</p></div></div>${cards(s.cards)}`;
      case 'career': return `<div class="career-grid">${s.items.map(([d,n,r])=>`<article><small>${esc(d)}</small><h3>${esc(n)}</h3><p>${esc(r)}</p></article>`).join('')}</div>${cards(s.cards)}<a class="text-link career-more" href="#appendix-g">바잉스퀘어 상세 ↗</a>`;
      default: return cards(s.cards);
    }
  }
  const sectionStarts = {
    impact: ['OVERVIEW', '대표 성과', '추천·수익화·신규 출시의 성과와 판단을 보여줍니다.', 'Growth · 제품 성장'],
    economy: ['PROJECT 01', '더멤버스 · 재화 정책', '사용자 신뢰를 지키며 재화 경제를 조정하는 역량', 'Monetization · 수익화'],
    matching: ['PROJECT 02', '골드스푼 · 소개 로직', '노출부터 후속 전환까지 분석하는 역량', 'Recommendation · 추천'],
    five: ['PROJECT 03', '파이브 · 신규 출시', '새로운 시장 기회를 제품 출시로 연결하는 역량', '0→1 · 신규 제품'],
    payment: ['PROJECT 04', 'PG·OCR · 결제 개선', '반복 결제의 마찰과 사업 비용을 줄이는 역량', 'Conversion & Payment · 결제'],
    hediple: ['PROJECT 05', '헤디플 · 개인 서비스', '문제 발견부터 출시·운영까지 책임지는 역량', 'Ownership · 제품 오너십'],
    hotel: ['PROJECT 06', '호텔오더 · B2B2C', '디지털 제품을 현장 운영과 연결하는 역량', 'Execution · 실행'],
    career: ['EXPERIENCE', '경력과 기술 기반', '기술 이해를 제품 판단과 협업으로 연결하는 역량', 'Technical Leadership · 기술 협업'],
    principles: ['CLOSING', '일하는 방식', '사례에서 반복되는 의사결정 기준을 보여줍니다.', 'Product Thinking · 제품 판단']
  };
  function article(s,i) {
    let body;
    if(s.kind==='cover') body=`<div class="cover-layout"><div><p class="cover-meta"><span class="status-dot"></span> 지원 포지션 · NAVER WEBTOON SENIOR PM</p><h1>${lines(s.title).replace('제품으로 답합니다.','<em>제품으로 답합니다.</em>')}</h1><p class="cover-description">${lines(s.subtitle)}</p>${profile.name?`<p class="profile-name">${esc(profile.name)}</p>`:''}<div class="cover-actions"><a class="button primary" href="#impact">주요 성과 살펴보기 ↗</a><a class="text-link" href="#economy">프로젝트 바로 보기 →</a></div><div class="cover-tags">ENGINEERING → PRODUCT → BUSINESS</div></div><div class="cover-art" aria-hidden="true"><div class="art-label">FROM QUESTION<br>TO IMPACT.</div><div class="art-orbit orbit-one"></div><div class="art-orbit orbit-two"></div><div class="art-core">P<span>↗</span></div><span class="art-note">DEFINE. BUILD. LEARN.</span></div></div><div class="cover-bottom"><span>추천 · 수익화 · 신규 출시 · 실행</span><span>${slides.length} SLIDES · ${appendices.length} DEEP DIVES</span></div>`;
    else if(s.kind==='closing') body=`<div class="closing"><p class="eyebrow">LET’S BUILD WHAT’S NEXT</p><h1>${lines(s.title)}</h1><p class="cover-description">${lines(s.subtitle)}</p><div class="cover-actions">${contact()}<a class="text-link" href="#impact">대표 성과 다시 보기 ↗</a><a class="text-link" href="#appendix">상세 자료 보기 ↓</a></div><p class="note">${esc(s.note)}</p></div>`;
    else body=`<header class="slide-heading"><div class="slide-heading-meta"><p class="eyebrow">${esc(s.group)} <span>${String(i+1).padStart(2,'0')} / ${slides.length}</span></p>${s.appendix?`<a class="appendix-link" href="#appendix-${s.appendix}">분석 기준과 상세 자료 <span>↗</span></a>`:''}</div><h1>${lines(s.title)}</h1>${s.lead?`<p class="lead">${esc(s.lead)}</p>`:''}<p class="subtitle">${esc(s.subtitle)}</p></header>${content(s)}${s.note?`<p class="note">${esc(s.note)}</p>`:''}`;
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
    $('#mode-toggle').textContent=reading?'슬라이드 보기':'이어 읽기';
    $('#mode-toggle').setAttribute('aria-pressed',String(reading));
    $('#slide-content').innerHTML=reading?slides.map(article).join(''):article(slides[current],current);
    $('#slide-content').scrollTop=0;syncNav();
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
    return text.split('\n').filter(l=>l.trim()&&l!=='---').map(l=>{
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
  $('#appendix-content').innerHTML=appendices.map(a=>`<details id="appendix-${a.id}"><summary><span>${a.id.toUpperCase()}</span><h3>${esc(a.title)}</h3><small>상세 설명 · 자료 · 검증 항목</small></summary><div class="appendix-body"><div class="appendix-detail">${markdown(a.raw)}${a.id==='b'?heatmap():''}</div><aside><h4>확인 및 공개 승인</h4><ul>${a.checks.map(c=>`<li>${esc(c)} · 추후 검증</li>`).join('')}</ul><p class="note">내부 정책·수치·실제 자료는 공개 승인 확인 필요.</p><h4>제품 화면 & 원본 자료</h4><div class="gallery">${a.images.length?a.images.filter(i=>safePath(i.src)).map(i=>`<button class="image-thumb" data-image="${esc(i.src)}" data-alt="${esc(i.alt)}"><img src="${esc(i.src)}" alt="${esc(i.alt)}" loading="lazy"><span>${esc(i.alt)} ↗</span></button>`).join(''):`<div class="image-placeholder"><span>▧</span><strong>자료 추가 예정</strong><p>실제 화면과 원본 증빙이 제공되면<br>이곳에서 확대하여 볼 수 있습니다.</p></div>`}</div><ul class="material-list">${a.materials.map(m=>`<li>${esc(m)}<small>자료 추가 예정</small></li>`).join('')}</ul><a class="text-link" href="#${slides.find(s=>s.appendix===a.id)?.id||'career'}">해당 프로젝트로 돌아가기 ↑</a></aside></div></details>`).join('');
  const groups=[['빠르게 보기',['cover','impact']],['01 / 재화 정책',['economy','economy-data']],['02 / 골드스푼 추천 배분',['matching','matching-next','matching-plan']],['03 / 신규 출시',['five','five-research','five-results']],['04 / 결제 개선',['payment','payment-architecture']],['다른 실행 경험',['hediple','hotel','career']],['일하는 방식과 마무리',['principles','closing']]];
  $('#toc-list').innerHTML=groups.map(([name,ids])=>`<details class="toc-group"><summary>${name}<small>${ids.length}장</small></summary>${ids.map(id=>{const i=slides.findIndex(s=>s.id===id);return `<a href="#${id}"><span>${String(i+1).padStart(2,'0')}</span><div>${esc(slides[i].title.replace(/\n/g,' '))}</div><span>↗</span></a>`;}).join('')}</details>`).join('');
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
