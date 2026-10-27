(() => {
  'use strict';
  const { slides, appendices, profile } = window.PORTFOLIO;
  const $ = (s) => document.querySelector(s);
  const esc = (v) => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lines = s => esc(s).replace(/\n/g, '<br>');
  const fmt = n => n.toLocaleString('en-US', { maximumFractionDigits: 3 });
  const safePath = path => typeof path === 'string' && /^\.?\/?assets\/[\w./ -]+\.(png|jpe?g|webp|svg)$/i.test(path) && !path.includes('..');
  let current = 0, lastWheel = 0, wheelTotal = 0, lastWheelEvent = 0, pointer = null;
  const cardHTML = items => items ? `<div class="cards count-${items.length}">${items.map(c => `<article class="card"><h3>${esc(c.title)}</h3><p>${esc(c.body)}</p></article>`).join('')}</div>` : '';
  function charts(s) {
    return `<div class="charts"><div class="chart-legend"><span><i></i>${esc(s.beforeLabel || 'BEFORE')}</span><span><i></i>${esc(s.afterLabel || 'AFTER')}</span></div>${s.bars.map((b,i) => {
      const max = Math.max(b.before,b.after)*1.1;
      return `<figure class="chart"><figcaption>${esc(b.label)}<strong class="${b.note.startsWith('−') && s.kind==='funnel'?'negative':''}">${esc(b.note)}</strong></figcaption><svg viewBox="0 0 600 88" role="img" aria-labelledby="chart-${s.id}-${i}"><title id="chart-${s.id}-${i}">${esc(b.label)}: ${esc(s.beforeLabel||'전')} ${b.before}${esc(b.unit)}, ${esc(s.afterLabel||'후')} ${b.after}${esc(b.unit)}</title>${[b.before,b.after].map((n,j)=>`<g tabindex="0" aria-label="${esc(j?(s.afterLabel||'후'):(s.beforeLabel||'전'))} ${fmt(n)}${esc(b.unit)}"><title>${esc(b.label)} · ${esc(j?(s.afterLabel||'후'):(s.beforeLabel||'전'))}: ${fmt(n)}${esc(b.unit)}</title><rect x="0" y="${j*42+5}" width="${n/max*420}" height="26" rx="3" fill="${j?'#00dc64':'#c8ceca'}"/><text x="${n/max*420+12}" y="${j*42+24}">${fmt(n)}${esc(b.unit)}</text></g>`).join('')}</svg></figure>`;
    }).join('')}</div>`;
  }
  const impact = () => `<div class="impact-grid">${[
    ['01','약 6','배','더멤버스 월매출 성장','2,022만 → 1억 2,075만 원','2024.02 → 2026.07 · 전체 제품 성과','economy-results'],
    ['02','11.3','% ↑','소개 로직 최적화','호감 발신율 0.639% → 0.711%','전후 관찰 · 상대 개선율','matching-next'],
    ['03','3.5','개월','파이브 신규 서비스 출시','첫 달 매출 2,500만 원','신규 제품 출시 소요','five'],
    ['04','50','% ↓','PG 결제 수수료 절감','수수료 6% → 3%','간편결제 이용 비중 78% · 기준 확인 필요','payment']
  ].map(([n,v,u,t,d,note,id])=>`<a class="impact-card" href="#${id}"><span class="micro">${n} / ${esc(t)}</span><div class="impact-value">${v}<small>${u}</small></div><h3>${d}</h3><p>${note}</p><span class="card-arrow" aria-hidden="true">↗</span></a>`).join('')}</div>`;
  function render() {
    const s = slides[current];
    $('.presentation').classList.add('dark');
    let body = '';
    if(s.kind === 'cover') body = `<div class="cover-layout"><div><div class="cover-meta"><span class="status-dot"></span> NAVER WEBTOON · SENIOR PRODUCT MANAGER</div><h1>${lines(s.title).replace('제품으로 답합니다.', '<em>제품으로 답합니다.</em>')}</h1><p class="cover-description">${lines(s.subtitle)}</p><div class="cover-actions"><a class="button primary" href="#impact">주요 성과 살펴보기 <span>↗</span></a><a class="text-link" href="#economy">프로젝트 바로 보기 →</a></div><div class="cover-tags">ENGINEERING ROOTS <span>→</span> PRODUCT OWNERSHIP <span>→</span> BUSINESS IMPACT</div></div><div class="cover-art" aria-hidden="true"><div class="art-label">FROM QUESTION<br>TO IMPACT.</div><div class="art-orbit orbit-one"></div><div class="art-orbit orbit-two"></div><div class="art-orbit orbit-three"></div><div class="art-core">P<span>↗</span></div><span class="art-note">DEFINE. BUILD. LEARN.</span><span class="art-plus">+</span></div></div><div class="cover-bottom"><span>기술을 이해하고, 사용자와 사업을 연결합니다.</span><span>28 SLIDES · 8 DEEP DIVES</span></div>`;
    else if(s.kind === 'closing') body = `<div class="closing"><p class="eyebrow">LET’S BUILD WHAT’S NEXT</p><h1>${lines(s.title)}</h1><p class="cover-description">${lines(s.subtitle)}</p><div class="cover-actions"><a href="#impact" class="button primary">주요 성과 다시 보기 ↗</a><a href="#appendix" class="text-link">상세 자료 살펴보기 ↓</a></div>${profile.name?`<p>${esc(profile.name)}</p>`:''}${profile.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)?`<a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a>`:''}${profile.resume&&/^(\.\/)?assets\/[\w./ -]+\.pdf$/i.test(profile.resume)&&!profile.resume.includes('..')?`<p><a href="${esc(profile.resume)}">이력서 PDF ↗</a></p>`:''}<p class="note">${esc(s.note)}</p></div>`;
    else body = `<div class="slide-heading"><div class="slide-heading-meta"><p class="eyebrow">${esc(s.group)} <span>/ ${esc(s.kind==='overview'?'PROJECT OVERVIEW':s.kind==='impact'?'SELECTED IMPACT':'PRODUCT THINKING')}</span></p>${s.appendix?`<a class="appendix-link" href="#appendix-${s.appendix}">분석 기준과 상세 자료 <span>↗</span></a>`:''}</div><h1>${lines(s.title)}</h1><p class="subtitle">${esc(s.subtitle)}</p></div>${s.kind==='overview'?`<div class="overview-layout"><div class="hero-metric"><span class="project-number">CASE ${s.number}</span><strong>${esc(s.metric)}</strong><span>${esc(s.metricLabel)}</span></div>${cardHTML(s.cards)}</div>`:s.kind==='impact'?impact():s.kind==='timeline'?`<div class="timeline">${s.items.map(([date,name,role])=>`<article><span class="micro">${esc(date)}</span><h3>${esc(name)}</h3><p>${esc(role)}</p></article>`).join('')}</div>`:`${s.metrics?`<div class="metrics">${s.metrics.map(([value,label])=>`<div><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`).join('')}</div>`:''}${s.steps?`<ol class="flow">${s.steps.map((step,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><p>${esc(step)}</p></li>`).join('')}</ol>`:''}${s.bars?charts(s):''}${cardHTML(s.cards)}`}${s.takeaway?`<div class="takeaway"><span>KEY TAKEAWAY</span><p>${esc(s.takeaway)}</p></div>`:''}${s.note?`<p class="note">${esc(s.note)}</p>`:''}`;
    $('#slide-content').innerHTML = `<article class="slide type-${s.kind}" aria-label="${current+1} / ${slides.length}">${body}</article>`;
    $('#counter').innerHTML = `<b>${String(current+1).padStart(2,'0')}</b><span>/ ${slides.length}</span>`;
    $('#section-name').textContent = s.group;
    $('#previous').disabled = current===0;
    $('#next').disabled = current===slides.length-1;
    $('#side-previous').disabled = current===0;
    $('#side-next').disabled = current===slides.length-1;
    $('#progress').style.width = `${(current+1)/slides.length*100}%`;
    $('#slide-content').scrollTop=0;
    document.title = `${s.title.replace(/\n/g,' ')} | Senior PM Portfolio`;
    document.querySelectorAll('#toc-list a').forEach(a=> {if(a.hash===`#${s.id}`)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  }
  function go(index) { if(index<0||index>=slides.length||index===current)return;location.hash=slides[index].id; }
  function route() {
    const hash=location.hash.slice(1);
    if(hash.startsWith('appendix')) {
      const target=document.getElementById(hash)||$('#appendix');
      if(target.tagName==='DETAILS') target.open=true;
      requestAnimationFrame(()=>target.scrollIntoView({behavior:'instant',block:'start'}));
      return;
    }
    const i=slides.findIndex(s=>s.id===hash);
    current=i<0?0:i;render(); window.scrollTo({top:0,behavior:'instant'});
  }
  function markdown(text) {
    return text.split('\n').filter(l=>l.trim() && l!=='---').map(l=>{
      const bold = esc(l.replace(/^#+\s*/, '').replace(/^[-*] /,'')).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
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
  $('#toc-list').innerHTML=slides.map((s,i)=>`<a href="#${s.id}"><span>${String(i+1).padStart(2,'0')}</span><div><small>${esc(s.group)}</small>${esc(s.title.replace(/\n/g,' '))}</div><span>↗</span></a>`).join('');
  $('#toc-open').addEventListener('click',()=>$('#toc-dialog').showModal());
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  $('#toc-list').addEventListener('click',e=>{if(e.target.closest('a')) {$('#toc-dialog').close();$('#slide-content').focus({preventScroll:true});}});
  $('#side-previous').addEventListener('click',()=>go(current-1));$('#side-next').addEventListener('click',()=>go(current+1));
  $('#previous').addEventListener('click',()=>go(current-1));$('#next').addEventListener('click',()=>go(current+1));
  $('#back-to-deck').addEventListener('click',()=>{
    const hash = `#${slides[current].id}`;
    // Scrolling down does not change the hash. Always restore the deck,
    // even when returning to the same URL (which emits no hashchange).
    if (location.hash !== hash) history.pushState(null, '', hash);
    route();
    $('#slide-content').focus({preventScroll:true});
  });
  document.addEventListener('keydown',e=>{
    if(document.querySelector('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable||window.scrollY>window.innerHeight/2)return;
    if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) {e.preventDefault();go(e.key==='Home'?0:e.key==='End'?slides.length-1:current+(e.key==='ArrowRight'?1:-1));}
  });
  $('#stage').addEventListener('wheel',e=>{
    if(Math.abs(e.deltaX)<=Math.abs(e.deltaY)||Math.abs(e.deltaX)<2)return;
    e.preventDefault();const now=Date.now();if(now-lastWheel<650)return;
    if(now-lastWheelEvent>180)wheelTotal=0;lastWheelEvent=now;wheelTotal+=e.deltaX;
    if(Math.abs(wheelTotal)>65){go(current+(wheelTotal>0?1:-1));lastWheel=now;wheelTotal=0;}
  },{passive:false});
  $('#stage').addEventListener('pointerdown',e=> {if(e.target.closest('a,button,svg')||(e.pointerType==='mouse'&&e.button!==0))return;pointer={x:e.clientX,y:e.clientY,id:e.pointerId};});
  $('#stage').addEventListener('pointerup',e=>{if(!pointer||pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.6){go(current+(dx<0?1:-1));window.getSelection()?.removeAllRanges();}});
  $('#stage').addEventListener('pointercancel',()=>pointer=null);$('#stage').addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')pointer=null;});
  $('#fullscreen').hidden=!document.fullscreenEnabled;
  $('#fullscreen').addEventListener('click',async()=>{try {if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();} catch {$('#toast').textContent='이 브라우저에서는 전체 화면을 사용할 수 없습니다.';setTimeout(()=>$('#toast').textContent='',3500);}});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-image]');if(!b)return;$('#expanded-image').src=b.dataset.image;$('#expanded-image').alt=b.dataset.alt;$('#image-caption').textContent=b.dataset.alt;$('#image-dialog').showModal();});
  document.querySelectorAll('.image-thumb img').forEach(img=>img.addEventListener('error',()=>{const b=img.closest('button');b.disabled=true;b.removeAttribute('data-image');b.innerHTML='<span>이미지를 불러올 수 없습니다 · 자료 경로 확인 필요</span>';}));
  window.addEventListener('hashchange',route);route();
})();
