(() => {
  'use strict';
  const {slides, profile, projects, copy, ui, locale, status, aliases = {}} = window.PORTFOLIO;
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lines = value => esc(value).replace(/\n/g, '<br>');
  const tag = text => `<span class="tag">${esc(text)}</span>`;
  const arrow = '<span class="arrow" aria-hidden="true">→</span>';
  const pairs = rows => `<dl class="facts">${rows.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
  const table = (headers,rows) => `<table><thead><tr>${headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const safeImage = path => typeof path==='string' && /^assets\/images\/[\w./ -]+\.(png|jpe?g|webp|svg)$/i.test(path) && !path.includes('..');
  // Only explicitly verified assets enter slides. Missing evidence has a meaningful diagram fallback.
  const evidence = (asset, fallback) => asset?.verified && safeImage(asset.src)
    ? `<figure class="evidence"><button class="image-open" data-image="${esc(asset.src)}" data-alt="${esc(asset.alt)}" aria-label="${esc(copy.shared01)}"><img src="${esc(asset.src)}" alt="${esc(asset.alt)}"></button>${asset.caption === '' ? '' : `<figcaption>${esc(asset.caption || asset.alt)}</figcaption>`}</figure>`
    : fallback;
  const chart = c => `<figure class="bar-chart"><figcaption>${esc(c.title)}</figcaption><div class="chart-axis">${c.ticks.map(t=>`<span>${esc(t)}</span>`).join('')}</div>${c.rows.map(([label,value,display],i)=>`<div class="bar-row"><div class="bar-label"><span>${esc(label)}</span><strong>${esc(display)}</strong></div><div class="bar-track"><i class="${i?'after':''}" style="width:${value/c.maximum*100}%"></i></div></div>`).join('')}<p class="caption">${esc(copy.shared02)}${esc(c.unit)}</p></figure>`;
  const projectConcepts = {
    '01': [copy.shared03,copy.shared04,copy.shared05],
    '02': [copy.shared06,copy.shared07,copy.shared08],
    '03': [copy.shared09,copy.shared10,copy.shared11]
  };
  function currencyResults(r) {
    const u=r.usage;
    return `<section class="currency-results" aria-label="${esc(r.title)}"><h3>${esc(r.title)}</h3><div class="currency-metrics"><article class="currency-usage" aria-label="${esc(u.definition)}"><h4>${esc(u.label)}</h4><div class="currency-rate">${u.before}% → ${u.after}% <span>${esc(u.change)}</span></div><div class="currency-bars" role="img" aria-label="${esc(copy.shared12)}${u.before}${esc(copy.shared13)}${u.after}${esc(copy.shared14)}"><div><span>${u.before}%</span><i style="height:${u.before}%"></i></div><div><span>${u.after}%</span><i style="height:${u.after}%"></i></div></div></article>${r.metrics.map(m=>`<article class="currency-metric"><h4>${esc(m.label)}</h4><p>${esc(m.detail)}</p><strong>${esc(m.value)}</strong></article>`).join('')}</div><p class="currency-period">${esc(r.period)}<br>${esc(r.note)}</p></section>`;
  }
  const renderers = {
    cover: s => `<div class="cover-center"><p class="cover-overline">${esc(s.overline)}</p><h1>Portfolio<span class="cover-period">.</span></h1><div class="cover-identity"><p>${esc(profile.name)}</p><span>${esc(profile.role)}</span></div></div><div class="cover-bottom">${projects.map(p=>`<a href="#${p.id}"><span>${p.number}</span>${esc(p.skill)}</a>`).join('')}</div>`,
    project: s => `<div class="project-copy">${tag('PROJECT '+s.projectNumber)}<h1>${lines(s.title)}</h1><p class="project-summary">${lines(s.summary)}</p><div class="project-skill">${esc(s.skill)}</div>${pairs(s.meta)}</div><div class="project-art" aria-hidden="true"><span class="chapter-number">${s.projectNumber}</span>${projectConcepts[s.projectNumber].map((v,i)=>`<div class="concept concept-${i}"><span>0${i+1}</span>${esc(v)}</div>`).join('')}</div>`,
    about: s => `<div class="career-columns"><section class="career-history"><h2 class="career-section-title">${esc(copy.about01)}<span>${esc(copy.about02)}</span></h2><div class="career-journey">${s.journey.map(([period,role,detail])=>`<section><span class="caption">${esc(period)}</span><h3>${esc(role)}</h3><p>${lines(detail)}</p></section>`).join('')}</div></section><section class="career-expertise"><h2 class="career-section-title">${esc(copy.about03)}</h2><div class="career-proof">${s.proofs.map(([label,action,result])=>`<section>${tag(label)}<div class="career-proof-body"><h3>${esc(action)}</h3><p>${lines(result)}</p></div></section>`).join('')}</div></section></div><p class="career-bridge">${esc(copy.about04)}</p>`,
    'career-summary': s => `<div class="closing-layout"><section class="closing-career"><h2>${esc(copy.careerSummary01)}</h2>${s.career.map(([period,role,detail])=>`<div><span>${esc(period)}</span><h3>${esc(role)}</h3><p>${lines(detail)}</p></div>`).join('')}</section><div class="closing-strengths">${s.strengths.map(r=>`<section><span class="closing-label">${esc(r.label)}</span><div><h2>${esc(r.title)}</h2><p>${esc(r.body)}</p><strong>${esc(r.evidence)}</strong><small>${esc(r.qualification)}</small></div></section>`).join('')}</div><div class="closing-contribution"><span>${esc(copy.careerSummary02)}</span><p>${esc(s.contribution)}</p></div></div>`,
    'thank-you': s => `<div class="thanks-center"><h1>${esc(s.title)}</h1><div class="thanks-identity"><strong>${esc(profile.name)}</strong><span>${esc(profile.role)}</span></div><p class="thanks-invitation">${esc(s.invitation)}</p></div>`,
    contents: () => `<div class="contents-list">${projects.map((p,i)=>`<a href="#${p.id}"><span class="contents-number">${p.number}</span><div><p class="caption">${['PRODUCT STRATEGY','PURCHASE EXPERIENCE','RECOMMENDATION'][i]}</p><h2>${esc(p.name)}</h2><p>${esc(p.skill)}</p><p class="project-context">${esc(p.context)}</p></div><span class="contents-page">${p.pages} <b>↗</b></span></a>`).join('')}</div>`,
    'strategy-decisions': s => { const c=s.businessContext; return `<div class="strategy-context"><b>${esc(c.label)}</b><p>${esc(copy.strategyDecisions01)}<strong>${esc(c.acquisitionCost)}</strong>${esc(copy.strategyDecisions02)}<strong>${esc(c.revenue120)}</strong> → ${esc(c.decision)}</p></div>${s.strategies.map((strategy,i)=>`<section class="strategy-group"><div class="strategy-row-title"><h2><span>${esc(strategy.label)}</span> ${esc(strategy.title)}</h2><p>${esc(strategy.description)}</p></div><div class="strategy-map ${i?'value':'free'}">${strategy.cards.map((card,j)=>`${j?arrow:''}<section class="strategy-cell ${['','hypothesis','decision'][j]}"><div class="cell-stage"><span>0${j+1}</span> ${esc(card.stage)}</div><h3>${lines(card.title)}</h3><p>${lines(card.description)}</p></section>`).join('')}</div></section>`).join('')}`; },
    'dual-execution': s => `<div class="strategy-layout"><section class="strategy-panel"><div class="strategy-heading">${tag(copy.shared03)}<h2>${esc(copy.dualExecution01)}</h2></div><div class="execution-summary"><div><span class="caption">${esc(copy.dualExecution02)}</span><p>${esc(copy.dualExecution03)}<br>${esc(copy.dualExecution04)}</p></div>${arrow}<div><span class="caption">${esc(copy.dualExecution05)}</span><p>${esc(copy.dualExecution06)}<strong>${esc(copy.dualExecution07)}</strong><br>${esc(copy.dualExecution08)}<strong>${esc(copy.dualExecution09)}</strong>${esc(copy.dualExecution10)}</p></div></div>${currencyResults(s.panels[0].results)}</section><section class="strategy-panel"><div class="strategy-heading">${tag(copy.shared04)}<h2>${esc(copy.dualExecution11)}</h2></div><div class="execution-summary"><div><span class="caption">${esc(copy.dualExecution12)}</span><p>${esc(copy.dualExecution13)}<br><strong>${esc(copy.dualExecution14)}</strong>${esc(copy.dualExecution15)}</p></div>${arrow}<div class="execution-promise"><span class="caption">${esc(copy.dualExecution16)}</span><p><strong>${esc(copy.dualExecution17)}</strong><br>${esc(copy.dualExecution18)}</p></div></div><p class="diagram-note">${esc(copy.dualExecution19)}</p>${evidence(s.panels[1].image,("<div class=\"execution-image-space\" aria-label=\"" + esc(copy.dualExecution20) + "\"></div>"))}</section></div>`,
    'members-results': s => `<div class="growth-layout"><section class="growth-main"><div class="result-lead"><div><span>${esc(copy.membersResults01)}</span><strong>${esc(copy.membersResults02)}</strong></div><p>${esc(copy.membersResults03)}<br><b>${esc(copy.membersResults04)}</b></p></div><figure class="column-chart"><figcaption class="caption">${esc(copy.membersResults05)}</figcaption><div class="column-plot"><div class="column-grid" aria-hidden="true">${[...s.chart.ticks].reverse().map(t=>`<div><span>${esc(t)}</span></div>`).join('')}</div><div class="column-bars">${s.chart.rows.map(([label,value,display],i)=>`<div class="column-group"><div class="column-bar ${i?'after':''}" style="height:${value/s.chart.maximum*100}%"><strong>${esc(display)}</strong></div><span class="column-label">${esc(label)}</span></div>`).join('')}</div></div></figure></section><div class="growth-detail"><section><p class="caption">${esc(copy.membersResults06)}</p><div class="growth-factors"><div><h3>MAU <small>${esc(copy.membersResults07)}</small></h3><p><span>${esc(copy.membersResults08)}</span>${arrow}<strong>${esc(copy.membersResults09)}</strong></p></div><div><h3>ARPU <small>${esc(copy.membersResults10)}</small></h3><p><span>${esc(copy.membersResults11)}</span>${arrow}<strong>${esc(copy.membersResults12)}</strong></p></div></div></section><section class="tinted"><p class="caption">${esc(copy.membersResults13)}</p><div class="policy-metrics"><div><h3>ARPU</h3><strong>+56.7%</strong></div><div><h3>${esc(copy.membersResults14)}</h3><strong>+65.3%</strong></div></div><p class="caption">${esc(copy.membersResults15)}</p></section><section><p class="caption">${esc(copy.membersResults16)}</p><h3>${esc(copy.membersResults17)}</h3></section></div></div>`,
    'purchase-problem': s => `<div class="event-reasoning"><div class="event-evidence">${s.reasoning.map(r=>`<section><span class="caption">${esc(r.label)}</span><h2>${esc(r.title)}</h2><p>${esc(r.body)}</p></section>`).join('')}<section class="event-hypothesis"><span class="caption">${esc(copy.purchaseProblem01)}</span><h2>${esc(s.hypothesis.title)}</h2><p>${esc(s.hypothesis.body)}</p></section></div><section class="behavior-design"><div class="behavior-heading">${tag(copy.purchaseProblem02)}<h2>${esc(copy.purchaseProblem03)}</h2></div><div class="behavior-columns"><span>${esc(copy.purchaseProblem04)}</span><span>${esc(copy.purchaseProblem05)}</span><span>${esc(copy.purchaseProblem06)}</span></div>${s.behaviorRows.map((r,i)=>`<div class="behavior-row"><div><span class="behavior-number">0${i+1}</span><h3>${esc(r.question)}</h3></div><div><strong>${esc(r.information)}</strong></div><div>${arrow}<p>${esc(r.action)}</p></div></div>`).join('')}<p class="behavior-purpose">${esc(copy.purchaseProblem07)}</p></section></div>`,
    'purchase-execution': s => `<div class="event-screen-comparison">${s.panels.map((p,i)=>`<section class="event-screen-panel ${i?'after':'before'}"><header>${tag(p.label)}<h2>${esc(p.title)}</h2>${p.supplementalImage?.verified && safeImage(p.supplementalImage.src)?`<button class="event-detail-open" data-image="${esc(p.supplementalImage.src)}" data-alt="${esc(p.supplementalImage.alt)}" aria-label="${esc(copy.purchaseExecution01)}">${esc(copy.purchaseExecution02)}</button>`:''}</header><p class="event-flow">${esc(p.flow)}</p>${evidence(p.image,`<div class="event-screen-space" aria-label="${esc(p.placeholder)}${esc(copy.purchaseExecution03)}"><span>${esc(p.placeholder)}</span><p>${esc(p.description)}</p></div>`)}${i?`<div class="event-ux-decisions">${s.uxDecisions.map(([n,label,copy])=>`<div><span>${esc(n)} · ${esc(label)}</span><p>${esc(copy)}</p></div>`).join('')}</div>`:`<div class="event-before-note"><span>${esc(copy.purchaseExecution04)}</span><p>${esc(copy.purchaseExecution05)}</p></div>`}</section>`).join('')}</div>`,
    'purchase-results': s => `<div class="purchase-results-layout"><div class="metric-pair">${s.metrics.map(([label,value,detail])=>`<section><h3>${esc(label)}</h3><strong>${esc(value)}</strong><p>${esc(detail)}</p></section>`).join('')}</div><div class="purchase-results-bottom"><section class="event-outcome"><h2>${esc(copy.purchaseResults01)}</h2><p class="caption">${esc(copy.purchaseResults02)}</p>${table([copy.purchaseResults03,copy.purchaseResults04,copy.purchaseResults05,copy.purchaseResults06],[[copy.purchaseResults07,'−10.1%','−11.8%',copy.purchaseResults08],[copy.purchaseResults09,'−11.4%','−6.0%',copy.purchaseResults10]])}<div class="event-result-reading"><strong>${esc(copy.purchaseResults11)}</strong><p>${esc(copy.purchaseResults12)}</p></div></section><section class="learning-panel"><h2>${esc(copy.purchaseResults13)}</h2><p class="caption">${esc(copy.purchaseResults14)}</p><div class="event-index-pair"><p>${esc(copy.purchaseResults15)}<strong>1.559 → 1.636</strong></p><p>${esc(copy.purchaseResults16)}<strong>1.170 → 1.212</strong></p></div><p>${esc(copy.purchaseResults17)}</p><div class="event-next"><span class="caption">${esc(copy.purchaseResults18)}</span><h3>${esc(copy.purchaseResults19)}</h3><p>${esc(copy.purchaseResults20)}</p><p class="caption">${esc(copy.purchaseResults21)}</p></div></section></div><aside class="event-analysis-note" aria-label="${esc(copy.purchaseResults22)}"><p><strong>${esc(s.analysisNote.formula)}</strong></p><p>${esc(s.analysisNote.description)}</p></aside></div>`,
    'matching-problem': s => {
      const e=s.evidence,d=s.decision;
      return `<div class="matching-problem-design">
        <section class="problem"><p class="eyebrow">${esc(s.problem.label)}</p><div class="problem-flow">${s.problem.steps.map(([label,detail],i)=>`${i?arrow:''}<div><p class="caption">${esc(label)}</p><h2>${i===2?`<span class="red">${esc(detail.split("\n")[0])}</span><br>${lines(detail.split("\n").slice(1).join("\n"))}`:lines(detail)}</h2></div>`).join('')}</div></section>
        <div class="lower"><section class="evidence"><p class="eyebrow">${esc(e.label)}</p><h2>${esc(e.title)}</h2><p class="caption">${esc(e.definition)}</p>
          <figure class="bars"><div class="axis">${e.ticks.map(t=>`<span>${esc(t)}</span>`).join('')}</div>${e.rows.map(([label,value,display])=>`<div class="row"><span class="row-label">${esc(label)}</span><div class="track"><i class="bar" style="width:${value/e.maximum*100}%"></i><b>${esc(display)}</b></div></div>`).join('')}<figcaption class="caption">${esc(e.source)}</figcaption></figure>
          <div class="reading"><b>${esc(e.reading)}</b><small>${esc(e.caveat)}</small></div>
        </section><section class="decision"><p class="eyebrow">${esc(d.label)}</p><h2>${esc(d.title)}<br><span class="blue">${esc(d.emphasis)}</span></h2>
          <div class="model"><div class="model-title"><b>${esc(d.modelTitle)}</b><span>${esc(d.modelContext)}</span></div><div class="formula">d(u,v) = √[ (aᵤ − aᵥ)² + (s′ᵤ − sᵥ)² + gᵤᵥ² ]</div><div class="definitions">${d.definitions.map(t=>`<span>${esc(t)}</span>`).join('')}</div><p class="model-note">${lines(d.modelNote)}</p></div>
          <div class="distinction"><div>${esc(d.received)} <b>${esc(d.count)}</b><br><span class="caption">${esc(d.bonus)}</span></div><div>${esc(d.exposure)}<br><b>${esc(d.cap)}</b></div></div>
        </section></div></div>`;
    },
    'matching-execution': s => {
      const p=s.policy;
      return `<div class="matching-execution-design"><div class="columns"><section class="implementation"><p class="eyebrow">${esc(p.label)}</p>
        <div class="change"><div><p class="label">${esc(p.beforeLabel)}</p><strong>${esc(p.before)}</strong></div>${arrow}<div><p class="label">${esc(p.afterLabel)}</p><strong class="blue">${esc(p.after)}</strong></div></div>
        <div class="analysis-intro"><h3>${esc(p.title)}</h3><p class="small">${esc(p.sample)}</p></div>
        <table class="policy"><thead><tr>${p.headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${p.rows.map(r=>`<tr><td>${esc(r.tier)}</td><td>${esc(r.share)}</td>${r.cap!==undefined?`<td class="cap" rowspan="${r.span}">${r.cap} <small>${esc(p.unit)}</small></td><td class="cut" rowspan="${r.span}">${esc(r.cut)}</td>`:''}</tr>`).join('')}</tbody></table>
        <p class="cut-note">${esc(p.note)}</p><div class="decision"><b>${esc(p.decision)}</b></div><p class="pool">${esc(p.pool)}</p>
        </section><section class="research"><p class="eyebrow">${esc(copy.matchingExecution08)}</p><h2>${esc(copy.matchingExecution09)}</h2>
        <div class="probabilities"><span><b>p</b>${esc(copy.matchingExecution10)}</span><span><b>q</b>${esc(copy.matchingExecution11)}</span></div>
        <div class="formula-block"><p class="formula">1000pq</p><p class="formula-label">${esc(copy.matchingExecution12)}</p></div>
        <div class="formula-block"><p class="formula">5p + 20pq</p><p class="formula-label">${esc(copy.matchingExecution13)}</p><p class="research-note">${esc(copy.matchingExecution14)}<br>${esc(copy.matchingExecution15)}</p></div>
        <div class="total"><p class="label">${esc(copy.matchingExecution16)}</p><p class="formula">${esc(copy.matchingExecution17)}</p><p class="small">${esc(copy.matchingExecution18)}<br>${esc(copy.matchingExecution19)}</p></div>
        </section></div></div>`;
    },
    'matching-results': s => {const r=s.results,c=r.consumption;return `<div class="recommendation-results"><section class="first-release-results">${tag(copy.matchingResults01)}<div class="recommendation-metrics"><section class="recommendation-chart">${chart(s.chart)}<p class="recommendation-delta">${esc(copy.matchingResults02)}<strong>${esc(r.rateChange)}</strong></p></section><section class="recommendation-consumption"><h3>${esc(copy.matchingResults03)}<br>${esc(copy.matchingResults04)}</h3><strong>${esc(c.change)}</strong><p>${esc(c.before)} → ${esc(c.after)}${esc(copy.matchingResults05)}</p></section></div><p class="recommendation-volumes">${r.volume.map(([label,value])=>esc(label)+' <b>'+esc(value)+'</b>').join('　·　')}</p><div class="downstream-metrics"><h3>${esc(copy.matchingResults06)}</h3>${r.tradeoffs.map(([label,before,after,delta])=>`<div><span>${esc(label)}</span><p>${esc(before)} → ${esc(after)}</p><strong>${esc(delta)}</strong></div>`).join('')}</div><div class="recommendation-service"><span>${esc(copy.matchingResults07)}</span><p>${r.service.map(([label,value])=>esc(label)+' <b>'+esc(value)+'</b>').join('　·　')}</p></div></section><section class="research-agenda">${tag(copy.matchingResults08)}<h2>${esc(copy.matchingResults09)}</h2>${s.research.map(([label,question],i)=>`<article><span>0${i+1} · ${esc(label)}</span><p>${esc(question)}</p></article>`).join('')}<div class="research-next"><h3>${esc(copy.matchingResults10)}</h3><p>${esc(copy.matchingResults11)}</p></div></section></div>`;}

  };
  function slideHTML(s,i) {
    const special=['cover','project','thank-you'].includes(s.variant);
    if(!renderers[s.variant]) throw new Error('Unknown slide variant: '+s.variant);
    return `<article class="slide variant-${s.variant}" lang="${s.translationStatus === 'pending' ? 'ko' : locale}" id="${s.id}" aria-label="${i+1} / ${slides.length}"><div class="slide-canvas"><header class="slide-header"><span>${esc(profile.name)} / Product Manager</span><span>${special?'PORTFOLIO 2026':esc(s.group)}${status==='draft'?` <span class="locale-draft-label" lang="${locale}"> / ${esc(ui.draftLabel)}</span>`:''}</span></header>${special?'':`<div class="slide-heading">${tag(s.stage || 'INTRODUCTION')}<h1>${lines(s.title)}</h1><p class="subtitle">${esc(s.subtitle)}</p></div>`}<div class="slide-body">${renderers[s.variant](s)}</div>${s.notes?`<aside class="slide-notes">${s.notes.map(n=>`<p>${esc(n)}</p>`).join('')}</aside>`:''}<footer class="slide-footer"><span>${s.variant==='project'?esc(copy.navigation01):esc(s.group)}</span><span>${String(i+1).padStart(2,'0')} / ${slides.length}</span></footer></div></article>`;
  }
  const initialMode=new URLSearchParams(location.search).get('view');
  let reading=initialMode!=='slides',current=0,printMode=null,pointer=null,lastWheel=0;
  const stage=$('#stage'),content=$('#slide-content');
  function fit(){
    // Reading mode fits one whole slide beneath the sticky toolbar, with breathing room.
    const contentStyle=getComputedStyle(content);
    const readingInset=Math.max(parseFloat(contentStyle.paddingTop),parseFloat(contentStyle.paddingBottom),parseFloat(getComputedStyle(content.querySelector('.slide')).scrollMarginTop)-$('.topbar').offsetHeight);
    const availableHeight=reading
      ? window.innerHeight-$('.topbar').offsetHeight-readingInset*2
      : stage.clientHeight;
    const width=Math.max(1,Math.min(1920,stage.clientWidth,availableHeight*16/9));
    document.querySelectorAll('.slide').forEach(s=>{s.style.width=width+'px';s.style.height=width*9/16+'px';s.style.setProperty('--scale',width/1920);});
  }
  function sync(){
    $('#counter').textContent=`${String(current+1).padStart(2,'0')} / ${slides.length}`;
    $('#section-name').textContent=slides[current].group;
    ['previous','side-previous'].forEach(id=>$('#'+id).disabled=current===0);
    ['next','side-next'].forEach(id=>$('#'+id).disabled=current===slides.length-1);
    $('#progress').style.width=(current+1)/slides.length*100+'%';
    document.querySelectorAll('#toc-list a').forEach(a=>a.toggleAttribute('aria-current',a.hash==='#'+slides[current].id));
    document.title=slides[current].title.replace(/\n/g,' ')+' | '+ui.titleSuffix;
  }
  function render(){
    document.body.classList.toggle('reading',reading);
    $('#mode-toggle').textContent=reading?ui.slides:ui.reading;
    $('#mode-toggle').setAttribute('aria-pressed',String(reading));
    content.innerHTML=reading?slides.map(slideHTML).join(''):slideHTML(slides[current],current);
    fit();sync();
  }
  function route(){
    let id=location.hash.slice(1);
    if(id==='slide-content'){content.focus();return;}
    if(aliases[id]){id=aliases[id];history.replaceState(null,'','#'+id);}
    if(id.startsWith('appendix-')){id=slides.find(s=>s.appendix===id.slice(9))?.id||'cover';history.replaceState(null,'','#'+id);}
    current=Math.max(0,slides.findIndex(s=>s.id===id));
    if(reading){sync();document.getElementById(slides[current].id)?.scrollIntoView({block:'start'});}else{render();window.scrollTo(0,0);}
  }
  function go(index){if(index>=0&&index<slides.length) location.hash=slides[index].id;}
  $('#toc-list').innerHTML=[{name:'INTRODUCTION',ids:['cover','about','contents']},...projects,{name:copy.navigation04,ids:['career-summary','thank-you']}].map(p=>`<section><h3>${esc(p.name)}</h3>${p.ids.map(id=>{const i=slides.findIndex(s=>s.id===id);return `<a href="#${id}"><span>${String(i+1).padStart(2,'0')}</span>${esc(slides[i].title.replace(/\n/g,' '))}</a>`;}).join('')}</section>`).join('');
  // Shell and slide copy live in the selected locale; the renderer stays shared.
  const textLabels={'.skip':'skip','#toc-open':'toc','.key-hint':'keyHint','#toc-title':'tocTitle','#image-dialog h2':'imageTitle'};
  Object.entries(textLabels).forEach(([selector,key])=>$(selector).textContent=ui[key]);
  const ariaLabels={'.presentation':'presentation','.topbar nav':'navigation','#language-select':'language','#fullscreen':'fullscreen','#previous':'previous','#side-previous':'previous','#next':'next','#side-next':'next','#toc-dialog [data-close]':'closeToc','#image-dialog [data-close]':'closeImage'};
  Object.entries(ariaLabels).forEach(([selector,key])=>$(selector).setAttribute('aria-label',ui[key]));
  $('meta[name="description"]').content=ui.description;
  if(status==='draft') $('.edition').textContent=ui.draftLabel;
  $('#language-select').value=locale;
  $('#language-select').onchange=e=>{
    const target=new URL(location.href);
    target.searchParams.set('lang',e.target.value==='en'?'en':'ko');
    target.searchParams.set('view',reading?'reading':'slides');
    target.hash=slides[current].id;
    location.href=target.href;
  };
  $('#toc-open').onclick=()=>$('#toc-dialog').showModal();
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}));
  $('#toc-list').onclick=e=>{if(e.target.closest('a')){$('#toc-dialog').close();content.focus({preventScroll:true});}};
  $('#mode-toggle').onclick=()=>{reading=!reading;render();route();};
  ['previous','side-previous'].forEach(id=>$('#'+id).onclick=()=>go(current-1));
  ['next','side-next'].forEach(id=>$('#'+id).onclick=()=>go(current+1));
  document.addEventListener('keydown',e=>{if(reading||document.querySelector('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();go(e.key==='Home'?0:e.key==='End'?slides.length-1:current+(e.key==='ArrowRight'?1:-1));}});
  stage.addEventListener('pointerdown',e=>{if(!reading&&!e.target.closest('button,a')&&e.button===0)pointer={x:e.clientX,y:e.clientY};});
  stage.addEventListener('pointerup',e=>{if(!pointer)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.6)go(current+(dx<0?1:-1));});
  stage.addEventListener('pointercancel',()=>pointer=null);
  stage.addEventListener('wheel',e=>{if(reading||Math.abs(e.deltaX)<30||Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;e.preventDefault();if(Date.now()-lastWheel>650){lastWheel=Date.now();go(current+(e.deltaX>0?1:-1));}},{passive:false});
  let scrollFrame=false;
  window.addEventListener('scroll',()=>{if(!reading||scrollFrame)return;scrollFrame=true;requestAnimationFrame(()=>{scrollFrame=false;const all=[...content.children];const i=all.findLastIndex(s=>s.getBoundingClientRect().top<150);if(i>=0&&i!==current){current=i;sync();}});});
  $('#fullscreen').hidden=!document.fullscreenEnabled;
  $('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('#toast').textContent=copy.navigation05;}};
  document.addEventListener('click',e=>{const b=e.target.closest('[data-image]');if(!b)return;$('#expanded-image').src=b.dataset.image;$('#expanded-image').alt=b.dataset.alt;$('#image-caption').textContent=b.dataset.alt;$('#image-dialog').showModal();});
  content.addEventListener('error',e=>{if(e.target.tagName==='IMG'){const figure=e.target.closest('figure');figure?.classList.add('image-error');if(figure)figure.querySelector('figcaption').textContent=copy.navigation06;}},true);
  window.addEventListener('beforeprint',()=>{printMode=reading;reading=true;render();});
  window.addEventListener('afterprint',()=>{if(printMode!==null){reading=printMode;printMode=null;render();route();}});
  new ResizeObserver(fit).observe(stage);
  window.addEventListener('resize',fit);
  window.addEventListener('hashchange',route);
  render();route();
})();
