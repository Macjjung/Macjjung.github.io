(async () => {
  'use strict';
  const publicView = new URLSearchParams(location.search).get('view') === 'public';
  if (publicView) {
    window.PORTFOLIO.slides = window.PORTFOLIO.slides.filter(s => !s.pending);
    window.PORTFOLIO.slides.forEach(s => {
      if(s.cards) s.cards = s.cards.filter(c => !/추가 정보 필요|추가 예정|명세 확인 필요|근거 보완 필요/.test(c.title+' '+c.body));
      if(s.kind === 'closing') s.note = '';
    });
  }
  const { slides, profile, projects, aliases = {} } = window.PORTFOLIO;
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

  const sectionStarts = Object.fromEntries(projects.map(p=>[p.id,['PROJECT '+p.number,p.name,p.skill,'']]));
  const flow = items => '<ol class="structure-flow">'+items.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ol>';
  const slot = p => '<figure class="structure-evidence"><div>'+esc(p.label || '제품 화면 삽입 예정')+' · 삽입 예정</div><figcaption>'+esc(p.caption)+'</figcaption></figure>';
  const table = (headers,rows) => '<table class="structure-table"><thead><tr>'+headers.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
  const chart = c => '<figure class="structure-chart"><h2>'+esc(c.title)+'</h2><div class="structure-axis">'+c.ticks.map(t=>'<span>'+esc(t)+'</span>').join('')+'</div>'+c.rows.map(([label,value,display],i)=>'<div class="structure-bar-row"><p><span>'+esc(label)+'</span><strong>'+esc(display)+'</strong></p><div class="structure-track"><i class="'+(i?'after':'')+'" style="width:'+value/c.maximum*100+'%"></i></div></div>').join('')+'<figcaption>0부터 시작하는 동일 척도 · '+esc(c.unit)+'</figcaption></figure>';
  const pairs = rows => '<dl class="structure-pairs">'+rows.map(([k,v])=>'<div><dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd></div>').join('')+'</dl>';

  // L06: matching results only. Each measure keeps its own unit and population.
  function matchingResults(s) {
    const r = s.results, c = r.consumption;
    const bars = s.chart.rows.map(([label,value,display],i) =>
      '<span class="matching-rate-label">'+esc(label)+'</span>'+
      '<svg class="matching-rate-bar" viewBox="0 0 800 28" preserveAspectRatio="none" aria-hidden="true"><rect width="800" height="28" fill="#F3F5F8"/><rect width="'+(value/s.chart.maximum*800)+'" height="28" fill="'+(i?'#3DACDC':'#AAB3BF')+'"/></svg>'+
      '<strong class="matching-rate-value">'+esc(display)+'</strong>').join('');
    return '<div class="matching-results-layout">'+
      '<div class="matching-primary">'+
        '<figure class="matching-efficiency" aria-labelledby="matching-efficiency-title">'+
          '<figcaption><h2 id="matching-efficiency-title">'+esc(s.chart.title)+'</h2><p class="matching-change">상대 증가 <strong>'+esc(r.rateChange)+'</strong></p></figcaption>'+
          '<div class="matching-rate-grid"><div class="matching-rate-axis">'+s.chart.ticks.map(t=>'<span>'+esc(t)+'</span>').join('')+'</div>'+bars+'</div>'+
          '<p class="matching-volume">'+r.volume.map(([label,value])=>'<span>'+esc(label)+' <b>'+esc(value)+'</b></span>').join('')+'</p>'+
        '</figure>'+
        '<section class="matching-consumption"><h2>'+esc(c.title)+'</h2>'+
          '<div class="matching-consumption-values"><div><span>개편 전</span><strong>'+esc(c.before)+'</strong></div><span class="matching-value-arrow" aria-hidden="true">→</span><div><span>개편 후</span><strong>'+esc(c.after)+'<small>'+esc(c.unit)+'</small></strong></div></div>'+
          '<p class="matching-consumption-change">사용자당 소비 <strong>'+esc(c.change)+'</strong></p><p class="matching-unit-note">스푼 소비량 · 행동 건수·실제 결제액과 구분</p>'+
        '</section>'+
      '</div>'+
      '<section class="matching-service"><h3>서비스 전체 · 동반 변화</h3><div><p>'+r.service.map(([label,value])=>'<span>'+esc(label)+' <b>'+esc(value)+'</b></span>').join('')+'</p><p class="matching-unit-note">같은 50일간의 관찰이며, 소개 로직 개편만의 인과효과가 아닙니다.</p></div></section>'+
      '<section class="matching-followups"><h3>후속 전환율 하락</h3>'+r.tradeoffs.map(([label,before,after,delta])=>'<div><h3>'+esc(label)+'</h3><p><span>'+esc(before)+' → <strong>'+esc(after)+'</strong></span><b>'+esc(delta)+'</b></p></div>').join('')+'</section>'+
    '</div>';
  }

  function structureArticle(s,i) {
    let body='';
    switch(s.variant) {
      case 'cover': body='<div class="structure-cover-content"><h1>'+lines(s.title)+'</h1><p class="structure-name">'+esc(profile.name)+'</p><p>'+esc(profile.role)+'</p></div>';break;
      case 'project': body='<div class="structure-project-content"><p class="structure-label">PROJECT '+s.projectNumber+'</p><h1>'+esc(s.title)+'</h1><p class="structure-summary">'+esc(s.summary)+'</p><p class="structure-skill">'+esc(s.skill)+'</p>'+pairs(s.meta)+'</div>';break;
      case 'about': body='<div class="structure-columns"><section><h2>'+esc(profile.name)+'</h2><p>'+esc(profile.role)+'</p><h3 class="structure-spaced">주요 수행 영역</h3>'+s.areas.map(x=>'<p>'+esc(x)+'</p>').join('')+'</section><section><h2>Experience</h2>'+s.experience.map(([period,company,role])=>'<div class="structure-career"><p class="structure-label">'+esc(period)+'</p><h3>'+esc(company)+'</h3><p>'+esc(role)+'</p></div>').join('')+'</section></div>';break;
      case 'contents': body='<div class="structure-contents">'+projects.map(p=>'<a href="#'+p.id+'"><span>'+p.number+'</span><div><h2>'+esc(p.name)+'</h2><p>'+esc(p.skill)+'</p></div><span>p. '+p.pages+' →</span></a>').join('')+'</div>';break;
      case 'decision-grid': body='<p class="structure-label">'+esc(s.baselineLabel)+'</p><div class="structure-baseline">'+s.baseline.map(([k,v])=>'<div><span>'+esc(k)+'</span><strong>'+esc(v)+'</strong></div>').join('')+'</div>'+table(['문제','판단','실행'],s.decisions)+'<p class="structure-evidence-note">'+esc(s.evidence)+'</p>';break;
      case 'dual-execution': case 'purchase-execution': body='<div class="structure-columns">'+s.panels.map(p=>'<section><h2>'+esc(p.title)+'</h2>'+(p.flow?flow(p.flow):'<p class="structure-panel-copy">'+esc(p.body)+'</p>')+slot(p)+'</section>').join('')+'</div>';break;
      case 'purchase-problem': case 'matching-problem': body='<div class="structure-columns"><div class="structure-reasoning">'+s.steps.map(([h,p])=>'<section><h3>'+esc(h)+'</h3><p>'+esc(p)+'</p></section>').join('')+'</div><section>'+(s.image?slot(s.image):'<h2>기존 보상 지급 흐름</h2>'+flow(['티켓 구매','행사 종료까지 대기','보상 지급'])+'<p class="structure-panel-copy">구매·사용 의사가 생긴 시점과 보상 수령 사이에 시차가 있었습니다.</p><p class="structure-label">설명용 흐름 · 실측 시간축 아님</p>'+slot({label:'구매·소비 분석 자료',caption:'예: 성별·시차별 구매–소비 상관관계 그래프'}))+'</section></div>';break;
      case 'members-results': body='<div class="structure-columns structure-result-columns">'+chart(s.chart)+'<section class="structure-results-list"><h3>사업 전체 · 2024.02 → 2026.07</h3>'+pairs([['MAU','2,670 → 6,120명'],['ARPU','7,562 → 19,730원'],['손익','담당 기간 중 흑자전환']])+'<h3>정책 적용 월 · 2024.04 → 05</h3><p>ARPU +56.7% · 월 결제액 +65.3%</p><p class="structure-label">5월은 가입 지급량 변경 전후가 섞인 기간</p><h3>더 블랙 · 상품 매출</h3><p>월 800만~1,000만 원 · 순증 효과 아님</p></section></div>';break;
      case 'purchase-results': body='<div class="structure-metrics structure-result-columns">'+s.metrics.map(([label,v,detail])=>'<section><h3>'+esc(label)+'</h3><strong>'+esc(v)+'</strong><p>'+esc(detail)+'</p></section>').join('')+'</div><div class="structure-columns structure-compact structure-result-columns"><section><h3>서비스 전체 · 종료 후 매출 변화</h3>'+table(['기간','변경 전','변경 후'],[['1~7일','−10.1%','−11.8%'],['8~14일','−11.4%','−6.0%']])+'<p>17일 누적 결제 지수 0.992 → 1.022</p></section><section><h3>구매 절벽 해소는 확인하지 못했다</h3><p>참여자 구매 지수 1.559 → 1.636<br>참여자 소비 지수 1.170 → 1.212</p><p>소비 지수의 개선 폭이 더 작았습니다.</p><p><b>후속 계획</b> · 보상 수령 직후 사용 넛지</p></section></div>';break;
      case 'matching-execution': body='<div class="structure-columns"><section><h3>기존 · 유사도 기반</h3>'+flow(['사용자 특성','유사도 계산','카드 배정'])+'</section><section><h3>변경 · 실제 반응으로 보완</h3>'+flow(['성별·등급별 반응','낮은 반응 조합 축소','배정 비율 조정'])+'</section></div><div class="structure-columns structure-execution-bottom"><section><h2>관찰한 사용자 흐름</h2>'+flow(['노출','호감 전송','수락','번호 오픈'])+'<p>연결 이후 재화 소비와 실제 결제도 별도로 관찰했습니다.</p></section>'+slot({label:'사용자 흐름 화면',caption:'예: 데일리카드·호감 전송·번호 오픈 화면'})+'</div>';break;
      case 'matching-results': body=matchingResults(s);break;
    }
    const special=['cover','project'].includes(s.variant);
    return '<article id="'+s.id+'" class="slide pilot-slide structure-slide structure-'+s.variant+' title-lines-'+s.titleLines+'" data-layout="'+s.layout+'" aria-label="'+(i+1)+' / '+slides.length+'"><div class="pilot-canvas"><header class="pilot-header"><span>'+esc(profile.name)+' · Product Manager</span><span>쿠팡 Shopping · Lead PM 지원</span></header>'+(special?'':'<div class="pilot-title-area"><p class="pilot-eyebrow">'+esc(s.group)+(s.stage?' / '+esc(s.stage):'')+'</p><h1 class="pilot-h1">'+lines(s.title)+'</h1><p class="pilot-subtitle">'+esc(s.subtitle)+'</p></div>')+(special?'<div class="structure-intro-frame">'+body+'</div>'+(s.variant==='cover'?'<div class="pilot-color-strip"><i></i><i></i><i></i><i></i><i></i></div>':''):'<div class="structure-main"><div class="structure-body">'+body+'</div>'+(s.notes?'<aside class="structure-notes">'+s.notes.map(n=>'<p>'+esc(n)+'</p>').join('')+'</aside>':'')+'</div>')+'<footer class="pilot-footer"><span>'+esc(s.group)+'</span><span>'+String(i+1).padStart(2,'0')+' / '+slides.length+'</span></footer></div></article>';
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
  const article = structureArticle;
  function syncNav() {
    $('#counter').innerHTML=`<b>${String(current+1).padStart(2,'0')}</b><span>/ ${slides.length}</span>`;
    $('#section-name').textContent=slides[current].group;
    const upcoming=slides[current+1];
    const newSection=upcoming&&sectionStarts[upcoming.id];
    $('.key-hint').innerHTML=upcoming?`<a class="next-preview" href="#${upcoming.id}"><span>${newSection?'다음 구간':'다음 내용'}</span><strong>${esc(newSection?newSection[1]:upcoming.title.replace(/\n/g,' '))}</strong><b aria-hidden="true">→</b></a>`:``;
    for(const id of ['previous','side-previous']) $('#'+id).disabled=current===0;
    for(const id of ['next','side-next']) $('#'+id).disabled=current===slides.length-1;
    $('#progress').style.width=`${(current+1)/slides.length*100}%`;
    document.querySelectorAll('#toc-list a').forEach(a=>{if(a.hash===`#${slides[current].id}`)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  }
  function render() {
    document.body.classList.toggle('reading',reading);
    document.querySelector('#presentation').classList.toggle('pilot-active', !!slides[current].pilot);
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
      hash = slides.find(s => `appendix-${s.appendix}` === hash)?.id || 'cover';
      history.replaceState(null, '', `#${hash}`);
    }
    const i=slides.findIndex(s=>s.id===hash);current=i<0?0:i;
    if(!reading)render(); else syncNav();
    document.title=`${slides[current].title.replace(/\n/g,' ')} | Senior PM Portfolio`;
    if(reading)document.getElementById(slides[current].id).scrollIntoView({behavior:'instant',block:'start'});
    else window.scrollTo({top:0,behavior:'instant'});
  }
  function go(i) {if(i>=0&&i<slides.length&&i!==current)location.hash=slides[i].id;}
  const groups = [["시작하기",["cover","about","contents"]],...projects.map(p=>[p.number+" / "+p.name,p.ids])];
  $('#toc-list').innerHTML=groups.map(([name,ids])=>[name,ids.filter(id=>slides.some(s=>s.id===id))]).filter(([,ids])=>ids.length).map(([name,ids])=>`<details class="toc-group"><summary>${name}<small>${ids.length}장</small></summary>${ids.map(id=>{const i=slides.findIndex(s=>s.id===id);return `<a href="#${id}"><span>${String(i+1).padStart(2,'0')}</span><div>${esc(slides[i].title.replace(/\n/g,' '))}</div><span>↗</span></a>`;}).join('')}</details>`).join('');
  $('#toc-open').addEventListener('click',()=>$('#toc-dialog').showModal());
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  $('#toc-list').addEventListener('click',e=>{if(e.target.closest('a')){$('#toc-dialog').close();$('#slide-content').focus({preventScroll:true});}});
  $('#mode-toggle').addEventListener('click',()=>{explicitMode=true;reading=!reading;history.replaceState(null,'',`#${slides[current].id}`);render();route();});
  media.addEventListener('change',()=>{if(!explicitMode){reading=media.matches;render();route();}});
  for(const id of ['previous','side-previous'])$('#'+id).addEventListener('click',()=>go(current-1));
  for(const id of ['next','side-next'])$('#'+id).addEventListener('click',()=>go(current+1));
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
  let printReading = null;
  window.addEventListener('beforeprint',()=>{printReading=reading;reading=true;render();});
  window.addEventListener('afterprint',()=>{if(printReading!==null){reading=printReading;printReading=null;render();route();}});
  window.addEventListener('hashchange',route);render();route();
})();
