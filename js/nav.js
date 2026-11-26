/* ============================================================
   导航：侧栏（按 REG 生成）/ 章节切换 / 搜索 / 面板 / 首页
   所有分发以 slug 为键，绝不依赖数字下标
   ============================================================ */
(function(){
  var REG = window.REG;
  var byId = {};
  REG.forEach(function(r){ byId[r.id] = r; });

  window.CUR_ID = null;
  window.CUR = 0;

  function pad2(n){ n = String(n); return n.length < 2 ? '0'+n : n; }
  function secOf(id){ return document.querySelector('.chapter[data-id="'+id+'"]'); }

  /* ---------- 侧栏 ---------- */
  function buildSidebar(){
    var nav = document.getElementById('sbnav');
    if(!nav) return;
    var html = '';
    var lastVol = 0;
    REG.forEach(function(r){
      if(r.v !== lastVol){
        html += '<div class="nav-group">'+(window.VISUALS?window.VISUALS.glyph(r.v,18):'')
             +  '<span>卷'+ ['一','二','三','四','五','六','七','八','九','十','十一','十二'][r.v-1] +' · '+window.regVolName(r.v)+'</span></div>';
        lastVol = r.v;
      }
      html += '<a class="nav-item" data-id="'+r.id+'" data-lv="'+r.l+'" title="'+window.regLevelName(r.l)+' · '+window.regAudienceName(r.a)+'">'
           +  '<span class="n">'+pad2(r.n)+'</span>'+r.t+'</a>';
    });
    nav.innerHTML = html;
    Array.prototype.forEach.call(nav.querySelectorAll('.nav-item'), function(it){
      var id = it.getAttribute('data-id');
      it.tabIndex = 0;
      it.setAttribute('role','button');
      it.addEventListener('click', function(e){ e.preventDefault(); go(id); });
      it.addEventListener('keydown', function(e){
        if(e.key==='Enter' || e.key===' '){ e.preventDefault(); go(id); }
      });
    });
  }

  /* ---------- 首页 ---------- */
  var ROUTES = [
    {t:'零基础起步', tag:'ROUTE 01 · 零基础', p:'先建立对钱、时间和风险的直觉，再学会读三张报表，最后把钱放进基金与配置。', path:'01 时间价值 → 05 复利 → 09 三大报表 → 38 基金 → 41 配置', start:'time-value'},
    {t:'课内体系', tag:'ROUTE 02 · 学生', p:'从会计等式出发，接上公司金融与宏观微观，把课堂上的公式放回真实决策里。', path:'10 会计等式 → 22 年金 → 48 NPV → 57 GDP → 66 供需', start:'accounting-equation'},
    {t:'投资实操', tag:'ROUTE 03 · 实操', p:'以能独立做判断为目标：估值、组合、交易纪律、行为偏差，最后收在一张检查表上。', path:'24 DCF → 29 组合 → 41 配置 → 79 仓位 → 97 检查表', start:'dcf-ddm'}
  ];
  function buildHome(){
    var home = document.getElementById('home');
    if(!home) return;
    var V = window.VISUALS;
    var PICKS = {
      '入':['time-value','statements-overview','active-passive-funds'],
      '进':['ratio-overview','portfolio-diversification','corporate-finance-value'],
      '高':['valuation-traps','derivatives-overview','overfitting']
    };
    var SUB = {'入':'从直觉开始，先把钱和报表看明白','进':'把公式放回真实决策里','高':'边界、例外与前沿'};
    var lanes = ['入','进','高'].map(function(l){
      var count = REG.filter(function(r){ return r.l===l; }).length;
      var links = PICKS[l].map(function(id){
        var r=window.regById(id);
        return '<a data-id="'+id+'"><i>'+pad2(r.n)+'</i>'+r.t+(r.d==='骨'?'<em>骨</em>':'')+'</a>';
      }).join('');
      return '<div class="ladder-mini lv-'+l+'"><div class="lm-h"><b>'+window.regLevelName(l)+'</b><span>'+SUB[l]+'</span></div>'
        + '<div class="lm-links">'+links+'</div>'
        + '<button class="lm-all" data-level="'+l+'">查看全部 '+count+' 节 →</button></div>';
    }).join('');
    var routes = ROUTES.map(function(x,i){
      return '<div class="route-card" data-start="'+x.start+'">'
        + '<div class="r-glyph">'+(V?V.glyph([1,2,4][i],38):'')+'</div>'
        + '<div class="r-tag">'+x.tag+'</div><h3>'+x.t+'</h3><p>'+x.p+'</p>'
        + '<div class="r-path"><span>路径</span>'+x.path+'</div><div class="r-go">从这里开始 →</div></div>';
    }).join('');
    var volStrip = window.VOLS.map(function(name,i){
      return '<button class="vol-chip" data-vol="'+(i+1)+'">'+(V?V.glyph(i+1,26):'')+'<b>卷'+['一','二','三','四','五','六','七','八','九','十','十一','十二'][i]+'</b>'+name+'</button>';
    }).join('');
    home.innerHTML =
      '<div class="home-mast">'
      +'<div class="mast-text"><div class="home-seal">金</div>'
      +'<div class="home-kicker">Finance · From Zero to Advanced</div>'
      +'<h1>金融学<span class="h1-dot">·</span>从简到难</h1>'
      +'<div class="home-sub">一张地图 · 三类读者 · 100 个节点</div>'
      +'<div class="home-stat">40 章完整课文　/　60 章骨架大纲　/　21 张手绘图表</div>'
      +'<div class="mast-rule"></div>'
      +'<p class="mast-lead">从「钱为什么有今天和明天之分」开始，走到估值、组合、宏观与交易纪律。十二卷按难度铺开，每一章都能看见它从哪里来、往哪里去。</p>'
      +'</div>'
      +'<div class="mast-map">'+(V?V.starMap():'')+'</div></div>'
      +'<div class="vol-strip">'+volStrip+'</div>'
      +'<div class="home-sec"><h2><span class="sec-no">壹</span> 从哪里开始</h2><p>三条路线，任选一条；随时可以从左侧目录跳到任意章节。</p><div class="route-grid">'+routes+'</div></div>'
      +'<div class="home-sec"><h2><span class="sec-no">贰</span> 难度阶梯</h2><p>从入门到高阶，每一级都标了前置关系；点台阶上的章节即可进入。</p>'
      +'<div class="ladder-wrap"><div class="ladder-stage">'+(V?V.ladderMap():'')+'</div><div class="ladder-mini-grid">'+lanes+'</div></div></div>'
      +'<div class="home-sec"><h2><span class="sec-no">叁</span> 今日一图</h2><p>先把时间价值看明白，后面的估值和配置都站在这块地基上。</p>'
      +'<div class="today-fig"><div class="chart-box"><canvas id="homeCurve"></canvas></div><div class="cap">复利曲线：同样 6% 的年化收益，本金 100 与本金 10 在 30 年后的差距。假设数据，仅用于演示。</div></div></div>';

    Array.prototype.forEach.call(home.querySelectorAll('.route-card'), function(c){
      c.addEventListener('click', function(){ go(c.getAttribute('data-start')); });
    });
    Array.prototype.forEach.call(home.querySelectorAll('.vol-chip'), function(c){
      c.addEventListener('click', function(){
        var v=+c.getAttribute('data-vol');
        var first=REG.filter(function(r){return r.v===v;})[0];
        if(first) go(first.id);
      });
    });
    Array.prototype.forEach.call(home.querySelectorAll('.ov-lane a,.ladder-mini a'), function(a){
      a.addEventListener('click', function(){ go(a.getAttribute('data-id')); });
    });
    Array.prototype.forEach.call(home.querySelectorAll('.lm-all'), function(b){
      b.addEventListener('click', function(){
        if(window.ovOpen) window.ovOpen();
        else if(typeof window.go==='function') window.go('time-value');
      });
    });
  }

  function goHome(){
    var home = document.getElementById('home');
    REG.forEach(function(r){ var s=secOf(r.id); if(s) s.classList.remove('active'); });
    Array.prototype.forEach.call(document.querySelectorAll('.nav-item'), function(it){
      it.classList.remove('active');
    });
    var nb = document.getElementById('sbnav');
    if(nb && nb.scrollTo) nb.scrollTo({top:0,behavior:'smooth'});
    if(home) home.classList.remove('hide');
    var cf = document.getElementById('cfoot'); if(cf) cf.style.visibility='hidden';
    var cn = document.getElementById('curNum'), ct = document.getElementById('curTitle');
    var cv = document.getElementById('crumbVol');
    if(cn) cn.textContent='';
    if(ct) ct.textContent='从这里开始';
    if(cv) cv.textContent='地图';
    window.CUR_ID = null;
    document.body.classList.remove('nav-open');
    window.scrollTo(0,0);
    if(typeof window.drawHomeCurve==='function') window.drawHomeCurve();
  }
  window.goHome = goHome;

  /* ---------- 章节切换 ---------- */
  window.go = function(id, opt){
    opt = opt || {};
    var r = byId[id];
    if(!r) return;
    var target = secOf(id);
    if(!target) return;
    REG.forEach(function(x){ var s=secOf(x.id); if(s) s.classList.remove('active'); });
    target.classList.add('active');
    var home = document.getElementById('home'); if(home) home.classList.add('hide');
    var cf = document.getElementById('cfoot'); if(cf) cf.style.visibility='visible';

    Array.prototype.forEach.call(document.querySelectorAll('.nav-item'), function(it){
      var on = it.getAttribute('data-id')===id;
      it.classList.toggle('active', on);
    });
    var actNav = document.querySelector('.nav-item.active');
    var navBox = document.getElementById('sbnav');
    if(actNav && navBox && navBox.scrollHeight > navBox.clientHeight + 10){
      var nt = actNav.offsetTop - navBox.offsetTop - navBox.clientHeight/2 + actNav.clientHeight/2;
      if(navBox.scrollTo) navBox.scrollTo({top:Math.max(0,nt),behavior:'smooth'});
    }
    var cn=document.getElementById('curNum'), ct=document.getElementById('curTitle');
    if(cn) cn.textContent=pad2(r.n)+'　';
    if(ct) ct.textContent=r.t;
    var cv=document.getElementById('crumbVol');
    if(cv) cv.textContent='卷'+['一','二','三','四','五','六','七','八','九','十','十一','十二'][r.v-1]+' · '+window.regVolName(r.v);
    var pb=document.getElementById('prevBtn'), nb=document.getElementById('nextBtn');
    var pt=document.getElementById('prevTitle'), nt2=document.getElementById('nextTitle');
    var idx=r.i, prev=REG[idx-1], next=REG[idx+1];
    if(pb) pb.disabled=!prev;
    if(nb) nb.disabled=!next;
    if(pt) pt.textContent=prev ? '← '+pad2(prev.n)+' '+prev.t : '已经是第一章';
    if(nt2) nt2.textContent=next ? pad2(next.n)+' '+next.t+' →' : '已经是最后一章';
    window.CUR_ID=id; window.CUR=idx;
    document.body.classList.remove('nav-open');
    if(!opt.noScroll) window.scrollTo({top:0,behavior:'smooth'});
    Array.prototype.forEach.call(target.querySelectorAll('canvas'), function(cv){ cv._w=-1; });
    if(typeof window.drawForId==='function') window.drawForId(id);
    if(typeof window.updatePoscard==='function') window.updatePoscard(id);
  };

  var prevBtn=document.getElementById('prevBtn'), nextBtn=document.getElementById('nextBtn');
  if(prevBtn) prevBtn.addEventListener('click', function(){ if(window.CUR>0) go(REG[window.CUR-1].id); });
  if(nextBtn) nextBtn.addEventListener('click', function(){ if(window.CUR<REG.length-1) go(REG[window.CUR+1].id); });
  var menuBtn=document.getElementById('menuBtn');
  if(menuBtn) menuBtn.addEventListener('click', function(){ document.body.classList.toggle('nav-open'); });
  var mask=document.getElementById('navMask');
  if(mask) mask.addEventListener('click', function(){ document.body.classList.remove('nav-open'); });
  var hb=document.getElementById('homeBtn'); if(hb) hb.addEventListener('click', goHome);
  var ch=document.getElementById('crumbHome'); if(ch) ch.addEventListener('click', goHome);
  var cvBtn=document.getElementById('crumbVol');
  if(cvBtn) cvBtn.addEventListener('click', function(){ if(window.ovOpen) window.ovOpen(); });
  var ovb=document.getElementById('ovTopBtn'); if(ovb) ovb.addEventListener('click', function(){ if(window.ovOpen) window.ovOpen(); });

  /* ---------- 面板 ---------- */
  var searchPanel=document.getElementById('searchOverlay');
  var drawer=document.getElementById('fxDrawer');
  function openPanel(which){
    closePanel();
    if(which==='search'){
      if(searchPanel) searchPanel.classList.add('show');
      var inp=document.getElementById('searchInput');
      if(inp) setTimeout(function(){ inp.focus(); inp.select(); },30);
      if(typeof window.renderSearch==='function') window.renderSearch();
    }else{
      if(drawer) drawer.classList.add('show');
      if(typeof window.renderFormulaDrawer==='function') window.renderFormulaDrawer();
    }
  }
  function closePanel(){
    if(searchPanel) searchPanel.classList.remove('show');
    if(drawer) drawer.classList.remove('show');
  }
  window.openPanel=openPanel; window.closePanel=closePanel;
  document.addEventListener('click', function(e){
    var b=e.target.closest ? e.target.closest('[data-open]') : null;
    if(b){ e.preventDefault(); openPanel(b.getAttribute('data-open')); }
    var kg=e.target.closest ? e.target.closest('[data-kg]') : null;
    if(kg && window.KG) window.KG.open();
  });
  if(searchPanel) searchPanel.addEventListener('click', function(e){ if(e.target===searchPanel) closePanel(); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-close]'), function(b){ b.addEventListener('click', closePanel); });

  /* ---------- 搜索 ---------- */
  var INDEX=[];
  function buildIndex(){
    REG.forEach(function(r){
      INDEX.push({id:r.id, n:r.n, t:r.t, text:r.t+' '+r.k.join(' ')+' '+window.regVolName(r.v), v:3});
    });
    Array.prototype.forEach.call(document.querySelectorAll('.chapter'), function(sec){
      var id=sec.getAttribute('data-id'), r=byId[id]; if(!r) return;
      sec.querySelectorAll('h3,h4,p,li,td,th,.card-t,.formula').forEach(function(el){
        var t=(el.textContent||'').replace(/\s+/g,' ').trim();
        if(t.length>2) INDEX.push({id:id,n:r.n,t:t.slice(0,50),text:t,v:1});
      });
    });
  }
  window.renderSearch=function(){
    var res=document.getElementById('searchRes'), inp=document.getElementById('searchInput');
    if(!res||!inp) return;
    var q=inp.value.trim().toLowerCase();
    if(!q){ res.innerHTML='<div class="search-empty">输入关键词，搜索全部 100 个节点</div>'; return; }
    var hits=[], seen={};
    INDEX.forEach(function(it){
      if(it.text.toLowerCase().indexOf(q)>=0 && !seen[it.id+it.t]){
        seen[it.id+it.t]=1; hits.push(it);
      }
    });
    hits.sort(function(a,b){ return b.v-a.v || a.n-b.n; });
    res.innerHTML=hits.slice(0,40).map(function(it,i){
      return '<div class="search-row'+(i===0?' on':'')+'" data-id="'+it.id+'"><b>'+pad2(it.n)+'</b><span>'+it.t+'</span></div>';
    }).join('') || '<div class="search-empty">没有匹配结果</div>';
    Array.prototype.forEach.call(res.querySelectorAll('.search-row'), function(row){
      row.addEventListener('click', function(){ closePanel(); go(row.getAttribute('data-id')); });
    });
  };
  var si=document.getElementById('searchInput');
  if(si) si.addEventListener('input', window.renderSearch);

  /* ---------- 键盘 / 滚动 ---------- */
  document.addEventListener('keydown', function(e){
    var kg=document.getElementById('kgOverlay');
    if(kg && kg.classList.contains('show')) return;
    var tag=(e.target.tagName||'').toLowerCase();
    var typing=tag==='input'||tag==='textarea'||tag==='select';
    if((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); openPanel('search'); return; }
    if(e.key==='Escape'){ closePanel(); document.body.classList.remove('nav-open'); return; }
    if(typing) return;
    if(e.key==='ArrowRight' && !e.shiftKey && window.CUR<REG.length-1) go(REG[window.CUR+1].id);
    if(e.key==='ArrowLeft' && !e.shiftKey && window.CUR>0) go(REG[window.CUR-1].id);
    if(e.key==='/'){ e.preventDefault(); openPanel('search'); }
  });
  window.addEventListener('scroll', function(){
    var h=document.documentElement.scrollHeight-window.innerHeight;
    var p=h>0?(window.scrollY/h*100):0;
    var rb=document.getElementById('readbar'); if(rb) rb.style.width=Math.max(0,Math.min(100,p))+'%';
    var tt=document.getElementById('toTop'); if(tt) tt.classList.toggle('show', window.scrollY>700);
  },{passive:true});
  var toTop=document.getElementById('toTop');
  if(toTop) toTop.addEventListener('click', function(){ window.scrollTo({top:0,behavior:'smooth'}); });
  var sfTop=document.getElementById('sfTop');
  if(sfTop) sfTop.addEventListener('click', function(){ window.scrollTo({top:0,behavior:'smooth'}); });
  Array.prototype.forEach.call(document.querySelectorAll('.sitefoot a[data-id]'), function(a){
    a.addEventListener('click', function(){ go(a.getAttribute('data-id')); });
  });
  var sfStat=document.getElementById('sfStat');
  if(sfStat){
    var full=REG.filter(function(r){return r.d==='完';}).length;
    sfStat.textContent=window.VOLS.length+' 卷 / '+REG.length+' 节点 / '+full+' 章完整课文';
  }

  /* ---------- 打印时展开 ---------- */
  window.addEventListener('beforeprint', function(){
    Array.prototype.forEach.call(document.querySelectorAll('.chapter.active details'), function(d){
      d.setAttribute('data-was', d.open?'1':'0'); d.open=true;
    });
  });
  window.addEventListener('afterprint', function(){
    Array.prototype.forEach.call(document.querySelectorAll('.chapter.active details'), function(d){
      if(d.getAttribute('data-was')==='0') d.open=false;
    });
  });

  var fxInput=document.getElementById('fxSearch');
  if(fxInput) fxInput.addEventListener('input', function(){ if(window.renderFormulaDrawer) window.renderFormulaDrawer(); });

  buildSidebar();
  buildHome();
  buildIndex();
})();
