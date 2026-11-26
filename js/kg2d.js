/* ============================================================
   kg2d.js —— 知识点网络 · 2D 环形图谱 + 公共面板逻辑
   依赖：registry.js（REG / VOLS / regById / regVolName ...）
   零依赖、无构建、不写 localStorage。
   与 kg3d.js 共同装配 window.KG：本文件提供核心方法与 2D 渲染，
   kg3d.js 在其后加载并挂上 open3d/close3d/redraw3d/goTo3d 等钩子。
   ============================================================ */
(function(){
  'use strict';

  var REG = window.REG || [];
  var NS  = 'http://www.w3.org/2000/svg';
  var COLORS = { '入':'#336f92', '进':'#3a7076', '高':'#b04a33' };
  var CX = 500, CY = 360;

  var KG = window.KG = window.KG || {};
  KG.mode = KG.mode || '2d';
  KG.currentId = KG.currentId || null;
  KG._state = KG._state || { vol:0, query:'' };

  /* ---------- 通用小工具 ---------- */
  function $(id){ return document.getElementById(id); }
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c];
    });
  }
  function cls(el, name, on){
    if(!el) return;
    if(on) el.classList.add(name); else el.classList.remove(name);
  }
  function closestCls(el, name){
    while(el && el !== document){
      if(el.classList && el.classList.contains(name)) return el;
      el = el.parentNode;
    }
    return null;
  }
  function colorOf(r){ return COLORS[r.l] || '#336f92'; }
  function sv(tag, attrs, parent){
    var e = document.createElementNS(NS, tag);
    if(attrs) for(var k in attrs){ if(attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]); }
    if(parent) parent.appendChild(e);
    return e;
  }
  function regById(id){ return window.regById ? window.regById(id) : null; }

  /* ---------- 共享可见性（卷筛选 + 搜索） ---------- */
  function isVisible(id){
    var m = KG._visibleMap;
    return !m || m[id] === true;
  }
  KG._isVisible = isVisible;

  KG._applyFilter = function(){
    var vol = KG._state.vol || 0;
    var q = (KG._state.query || '').trim().toLowerCase();
    var near = {};
    var i, r;
    if(vol){
      for(i=0;i<REG.length;i++){
        r = REG[i];
        if(r.v === vol) near[r.id] = true;
      }
      for(i=0;i<REG.length;i++){
        r = REG[i];
        if(r.v === vol){
          r.p.concat(r.rel).forEach(function(id){ near[id] = true; });
        }
      }
    }
    var map = {};
    for(i=0;i<REG.length;i++){
      r = REG[i];
      var okVol = !vol || !!near[r.id];
      var okQuery = !q || String(r.n) === q ||
        r.t.toLowerCase().indexOf(q) >= 0 || r.id.toLowerCase().indexOf(q) >= 0;
      map[r.id] = okVol && okQuery;
    }
    KG._visibleMap = map;

    var chips = $('kgChips') ? $('kgChips').querySelectorAll('button') : [];
    for(i=0;i<chips.length;i++){
      var active = Number(chips[i].getAttribute('data-v')) === vol;
      cls(chips[i], 'on', active);
      chips[i].style.borderColor = active ? '#b04a33' : 'var(--rule)';
      chips[i].style.color = active ? '#b04a33' : 'var(--ink2)';
    }
    var groups = $('kgList') ? $('kgList').querySelectorAll('.kg-g') : [];
    for(i=0;i<groups.length;i++){
      cls(groups[i], 'active', Number(groups[i].getAttribute('data-v')) === vol);
    }
    var links = $('kgList') ? $('kgList').querySelectorAll('.kg-link') : [];
    for(i=0;i<links.length;i++){
      cls(links[i], 'hide', !map[links[i].getAttribute('data-id')]);
    }
    if(KG._paint2d) KG._paint2d();
  };

  KG._setVol = function(v){
    v = Number(v) || 0;
    KG._state.vol = (KG._state.vol === v) ? 0 : v;
    KG._applyFilter();
  };

  /* ---------- 侧栏分组 / 卷 chips ---------- */
  function renderChips(){
    var box = $('kgChips');
    if(!box) return;
    var html = '<button type="button" data-v="0">全部</button>';
    for(var v=1; v<=12; v++){
      html += '<button type="button" data-v="' + v + '">' +
        (v < 10 ? '0' + v : v) + ' ' + esc(window.regVolName(v)) + '</button>';
    }
    box.innerHTML = html;
    // 桌面端默认隐藏 chips，这里显式放开；桌面另可用左侧卷标题筛选。
    box.style.display = 'flex';
    box.style.flexWrap = 'nowrap';
    box.style.overflowX = 'auto';
    if(window.innerWidth > 900) box.style.maxWidth = '52vw';
    var btns = box.querySelectorAll('button');
    for(var i=0;i<btns.length;i++){
      var b = btns[i];
      b.style.fontFamily = 'var(--sans)';
      b.style.fontSize = '10px';
      b.style.letterSpacing = '.6px';
      b.style.color = 'var(--ink2)';
      b.style.border = '1px solid var(--rule)';
      b.style.background = 'var(--sheet)';
      b.style.padding = '3px 8px';
      b.style.whiteSpace = 'nowrap';
    }
  }

  function renderList(){
    var box = $('kgList');
    if(!box) return;
    var byVol = {};
    REG.forEach(function(r){ (byVol[r.v] = byVol[r.v] || []).push(r); });
    var html = '';
    for(var v=1; v<=12; v++){
      var list = byVol[v] || [];
      if(!list.length) continue;
      html += '<div class="kg-g" data-v="' + v + '">' +
        '<i class="dot" style="background:' + colorOf(list[0]) + '"></i>' +
        '<span>' + (v < 10 ? '0' + v : v) + ' · ' + esc(window.regVolName(v)) + '</span>' +
        '<b>' + list.length + '</b></div>';
      list.forEach(function(r){
        html += '<div class="kg-link" data-id="' + r.id + '" title="' + esc(r.t) + '">' +
          '<span style="color:' + colorOf(r) + '">' + r.n + '</span> ' + esc(r.t) + '</div>';
      });
    }
    box.innerHTML = html;
  }

  /* ---------- 详情面板（2D / 3D 共用） ---------- */
  function legendHTML(){
    return '<div class="kg-legend">' +
      '<div><i style="background:#336f92"></i>入门 · 零基础可读</div>' +
      '<div><i style="background:#3a7076"></i>进阶 · 经管学生</div>' +
      '<div><i style="background:#b04a33"></i>高阶 · 投资实操</div>' +
      '<div><i style="background:#fbfdff;border:1px solid #7e96a6"></i>空心圈 = 骨架要点</div>' +
      '<div><i style="background:#b04a33"></i>连线方向 = 前置 → 后续</div>' +
      '</div>';
  }
  function emptyHTML(){
    return '<div class="kg-empty"><b>知识点网络</b>' +
      '100 个节点、12 个卷，按「入门 / 进阶 / 高阶」分层；前置关系构成一张有向图。' +
      '<br><br>点击任一节点，查看它所属卷、难度、读者、前置 / 延伸关系与要点。' +
      '<br>拖拽平移 · 滚轮缩放 · 右上可切换到 3D 图谱。' +
      '</div>' + legendHTML();
  }
  function relButtons(ids){
    if(!ids || !ids.length) return '<span style="font-size:12px;color:var(--muted)">无</span>';
    return ids.map(function(id){
      var r = regById(id);
      return '<button type="button" data-goto="' + id + '">' + esc(r ? r.t : id) + '</button>';
    }).join('');
  }
  KG._showDetail = function(id){
    var box = $('kgDetail');
    if(!box) return;
    var r = regById(id);
    if(!r){ box.innerHTML = emptyHTML(); return; }
    var col = colorOf(r);
    var def = (r.k && r.k.length) ? r.k.join('；') :
      ('《' + window.regVolName(r.v) + '》第 ' + r.n + ' 章 · ' + r.t +
       '。难度' + window.regLevelName(r.l) + '，面向' + window.regAudienceName(r.a) + '。');
    var pts = (r.k && r.k.length)
      ? r.k.map(function(t,i){ return (i+1) + '. ' + esc(t); }).join('<br>')
      : '本章为完整课文，要点与公式见章节正文。';
    box.innerHTML =
      '<div class="kg-dgroup"><i style="background:' + col + '"></i>' +
        esc(window.regLevelName(r.l)) + ' · 第' + r.v + '卷 · ' +
        esc(window.regVolName(r.v)) + ' · No.' + r.n + '</div>' +
      '<div class="kg-dname">' + esc(r.t) + '</div>' +
      '<div class="kg-ddef">' + esc(def) + '</div>' +
      '<a class="kg-dch" data-read="' + r.id + '" href="javascript:void(0)">阅读本章 →</a>' +
      '<div class="kg-dsec">读 者 / 深 度</div>' +
      '<div class="kg-ddef" style="margin-top:0">' + esc(window.regAudienceName(r.a)) +
        ' · ' + (r.d === '骨' ? '骨架要点' : '完整课文') + '</div>' +
      '<div class="kg-dsec">前 置</div><div class="kg-rel">' + relButtons(r.p) + '</div>' +
      '<div class="kg-dsec">延 伸</div><div class="kg-rel">' + relButtons(r.rel) + '</div>' +
      '<div class="kg-dsec">本 章 要 点</div><div class="kg-ddef" style="margin-top:0">' + pts + '</div>' +
      legendHTML();
  };

  function pathOf(id){
    var out = [], guard = {}, r = regById(id);
    while(r && !guard[r.id] && out.length < 5){
      guard[r.id] = true;
      out.unshift(r);
      r = r.p.length ? regById(r.p[0]) : null;
    }
    return out;
  }
  KG._updatePath = function(id){
    var el = $('kgPath');
    if(!el) return;
    var chain = pathOf(id);
    var html = '<span>知识网络</span>';
    chain.forEach(function(node, i){
      html += ' › ' + (i === chain.length - 1 ? '<b>' + esc(node.t) + '</b>' : esc(node.t));
    });
    el.innerHTML = html;
  };

  /* ---------- 选择 / 清除（共享） ---------- */
  KG._select = function(id){
    var r = regById(id);
    if(!r) return;
    KG.currentId = id;
    var ov = $('kgOverlay');
    if(ov) ov.classList.add('has-sel');
    var back = $('kgBack');
    if(back) back.disabled = false;
    KG._showDetail(id);
    KG._updatePath(id);
    if(KG._paint2d) KG._paint2d();
  };
  KG._clear = function(){
    KG.currentId = null;
    var ov = $('kgOverlay');
    if(ov) ov.classList.remove('has-sel');
    var back = $('kgBack');
    if(back) back.disabled = true;
    var pathEl = $('kgPath');
    if(pathEl) pathEl.innerHTML = '';
    var detail = $('kgDetail');
    if(detail) detail.innerHTML = emptyHTML();
    if(KG._paint2d) KG._paint2d();
  };

  /* ---------- 核心 API（供 nav.js 调用） ---------- */
  KG.open = function(){
    var ov = $('kgOverlay');
    if(!ov) return;
    ov.classList.add('show');
    cls(ov, 'mode3', KG.mode === '3d');
    var mb = $('kgMode');
    if(mb) mb.textContent = KG.mode === '3d' ? '2D 图谱' : '3D 图谱';
    KG.redraw();
  };
  KG.close = function(){
    var ov = $('kgOverlay');
    if(!ov) return;
    ov.classList.remove('show');
    if(KG.halt3d) KG.halt3d();
  };
  KG.redraw = function(){
    if(KG.mode === '3d'){
      if(KG.redraw3d) KG.redraw3d();
    } else {
      if(KG.redraw2d) KG.redraw2d();
    }
  };
  KG.goTo = function(id){
    if(!regById(id)) return;
    var st = KG._state;
    if(st.vol || st.query){
      st.vol = 0; st.query = '';
      var si = $('kgSearch'); if(si) si.value = '';
      KG._applyFilter();
    }
    KG._select(id);
    if(KG.mode === '2d' && KG.focus2d) KG.focus2d(id);
    if(KG.mode === '3d' && KG.focus3d) KG.focus3d(id);
  };
  KG.switchMode = function(m){
    if(m !== '2d' && m !== '3d') return;
    if(m === KG.mode) return;
    var ov = $('kgOverlay');
    if(m === '3d'){
      if(KG.close2d) KG.close2d();
      if(ov) ov.classList.add('mode3');
      var mb = $('kgMode'); if(mb) mb.textContent = '2D 图谱';
    } else {
      if(KG.halt3d) KG.halt3d();
      if(ov) ov.classList.remove('mode3');
      var mb2 = $('kgMode'); if(mb2) mb2.textContent = '3D 图谱';
    }
    KG.mode = m;
    if(ov && ov.classList.contains('show')) KG.redraw();
  };
  KG.toggleMode = function(){ KG.switchMode(KG.mode === '2d' ? '3d' : '2d'); };

  /* =========================================================
     2D 渲染
     ========================================================= */
  var svg = null, viewG = null, S = 1, TX = 0, TY = 0;
  var nodeMap = null, edgeEls = null, posMap = null, rot2d = 0;

  function layout(){
    var pos = {}, byVol = {};
    REG.forEach(function(r){ (byVol[r.v] = byVol[r.v] || []).push(r); });
    for(var v=1; v<=12; v++){
      var list = byVol[v] || [];
      var c = list.length;
      var sector = (v-1) * (Math.PI*2/12) - Math.PI/2 + rot2d;
      var per = Math.ceil(c / 2);
      list.forEach(function(r, j){
        var ring = j < per ? 0 : 1;
        var k = ring === 0 ? j : j - per;
        var cnt = ring === 0 ? per : c - per;
        var rad = ring === 0 ? 236 : 322;
        var spread = 26 * Math.PI / 180;
        var frac = cnt > 1 ? k / (cnt - 1) : 0.5;
        var th = sector + (frac - 0.5) * spread;
        pos[r.id] = { x: CX + rad * Math.cos(th), y: CY + rad * Math.sin(th), th: th, rad: rad };
      });
    }
    return pos;
  }

  function applyView(){
    if(viewG) viewG.setAttribute('transform', 'translate(' + TX.toFixed(2) + ',' + TY.toFixed(2) + ') scale(' + S.toFixed(3) + ')');
    if(svg) cls(svg, 'zoomed', S > 1.15);
  }
  function vbPerPixel(rect){
    return Math.max(1000 / Math.max(rect.width,1), 720 / Math.max(rect.height,1));
  }
  function zoomCenter(f){
    var ns = Math.max(0.55, Math.min(4, S * f));
    TX = CX - (CX - TX) / S * ns;
    TY = CY - (CY - TY) / S * ns;
    S = ns; applyView();
  }
  function zoomAt(clientX, clientY, f){
    var rect = svg.getBoundingClientRect();
    var k = vbPerPixel(rect);
    var px = (clientX - rect.left - rect.width/2) * k + CX;
    var py = (clientY - rect.top - rect.height/2) * k + CY;
    var ns = Math.max(0.55, Math.min(4, S * f));
    TX = px - (px - TX) / S * ns;
    TY = py - (py - TY) / S * ns;
    S = ns; applyView();
  }

  function render2d(){
    svg = $('kgSvg');
    if(!svg) return;
    while(svg.firstChild) svg.removeChild(svg.firstChild);

    var defs = sv('defs', null, svg);
    [['kgArrow','#336f92'], ['kgArrowRed','#b04a33']].forEach(function(d){
      var m = sv('marker', {
        id: d[0], viewBox:'0 0 10 10', refX:'9', refY:'5',
        markerWidth:'5', markerHeight:'5', orient:'auto'
      }, defs);
      sv('path', { d:'M0,0 L10,5 L0,10 z', fill:d[1], opacity:'.75' }, m);
    });

    viewG = sv('g', { id:'kgView' }, svg);
    var ringG = sv('g', null, viewG);
    [236, 322].forEach(function(rad){
      sv('circle', { class:'kg-ring', cx:CX, cy:CY, r:rad }, ringG);
    });

    posMap = layout();
    var byVol = {};
    REG.forEach(function(r){ (byVol[r.v] = byVol[r.v] || []).push(r); });
    for(var v=1; v<=12; v++){
      var list = byVol[v] || [];
      if(!list.length) continue;
      var a = (v-1) * (Math.PI*2/12) - Math.PI/2 + rot2d;
      var lx = CX + 180 * Math.cos(a), ly = CY + 180 * Math.sin(a);
      var lab = sv('text', { class:'kg-glabel', x:lx.toFixed(1), y:ly.toFixed(1), 'text-anchor':'middle' }, ringG);
      lab.textContent = window.regVolName(v);
    }

    var edgeG = sv('g', { id:'kgEdges' }, viewG);
    var nodeG = sv('g', { id:'kgNodes' }, viewG);
    edgeEls = [];

    REG.forEach(function(r){
      r.p.forEach(function(pid){
        var a = posMap[pid], b = posMap[r.id];
        if(!a || !b) return;
        var dx = b.x - a.x, dy = b.y - a.y;
        var d = Math.sqrt(dx*dx + dy*dy) || 1;
        var ux = dx/d, uy = dy/d;
        var ln = sv('line', {
          class:'kg-edge',
          x1:(a.x + ux*13).toFixed(1), y1:(a.y + uy*13).toFixed(1),
          x2:(b.x - ux*14).toFixed(1), y2:(b.y - uy*14).toFixed(1),
          'marker-end':'url(#kgArrow)',
          'data-from':pid, 'data-to':r.id
        }, edgeG);
        ln.style.strokeOpacity = '.16';
        edgeEls.push({ el:ln, from:pid, to:r.id });
      });
    });

    nodeMap = {};
    REG.forEach(function(r){
      var p = posMap[r.id];
      var col = colorOf(r);
      var g = sv('g', {
        class:'kg-node' + (r.d === '骨' ? ' skel' : ''),
        'data-id':r.id,
        transform:'translate(' + p.x.toFixed(1) + ',' + p.y.toFixed(1) + ')'
      }, nodeG);
      var circle = sv('circle', { r: r.d === '骨' ? 9.5 : 11 }, g);
      var text = sv('text', { y:24, 'text-anchor':'middle' }, g);
      text.textContent = r.t;
      if(r.d === '骨') circle.style.strokeDasharray = '3 2';
      nodeMap[r.id] = { g:g, circle:circle, fill:(r.d === '骨' ? '#fbfdff' : col), stroke:col };
    });

    var center = sv('g', { class:'kg-node center', transform:'translate(' + CX + ',' + CY + ')' }, viewG);
    var cc = sv('circle', { r:31 }, center);
    cc.style.fill = '#fbfdff'; cc.style.stroke = '#8d7a4c';
    var ct = sv('text', { y:2, 'text-anchor':'middle' }, center);
    ct.textContent = '金融学';
    var ct2 = sv('text', { y:18, 'text-anchor':'middle', class:'kg-center2' }, center);
    ct2.style.fontSize = '10px';
    ct2.textContent = '12 卷 · 100 节点';
    center.addEventListener('click', function(){ KG._clear(); });

    S = 1; TX = 0; TY = 0;
    applyView();
    KG._paint2d();
  }

  function paint2d(){
    if(!nodeMap) return;
    var sel = KG.currentId;
    var neigh = {};
    if(sel){
      var r = regById(sel);
      if(r) r.p.concat(r.rel).forEach(function(id){ neigh[id] = true; });
    }
    REG.forEach(function(r){
      var m = nodeMap[r.id];
      if(!m) return;
      var vis = isVisible(r.id);
      cls(m.g, 'hide', !vis);
      cls(m.g, 'sel', false); cls(m.g, 'rel', false); cls(m.g, 'fade', false);
      if(!vis) return;
      m.circle.style.fill = m.fill;
      m.circle.style.stroke = m.stroke;
      m.circle.style.strokeWidth = '1.4';
      if(sel){
        if(r.id === sel){
          cls(m.g, 'sel', true);
          m.circle.style.fill = '#b04a33';
          m.circle.style.stroke = '#b04a33';
          m.circle.style.strokeWidth = '2.6';
        } else if(neigh[r.id]){
          cls(m.g, 'rel', true);
          m.circle.style.stroke = '#b04a33';
          m.circle.style.strokeWidth = '1.8';
        } else {
          cls(m.g, 'fade', true);
        }
      }
    });
    if(edgeEls){
      edgeEls.forEach(function(e){
        var vis = isVisible(e.from) && isVisible(e.to);
        cls(e.el, 'hide', !vis);
        var on = !!(sel && (e.from === sel || e.to === sel));
        cls(e.el, 'on', on);
        e.el.style.strokeOpacity = !vis ? '0' : (on ? '.62' : '.16');
        e.el.style.stroke = on ? '#b04a33' : '';
        e.el.setAttribute('marker-end', on ? 'url(#kgArrowRed)' : 'url(#kgArrow)');
      });
    }
    var links = $('kgList') ? $('kgList').querySelectorAll('.kg-link') : [];
    for(var i=0;i<links.length;i++){
      cls(links[i], 'on', links[i].getAttribute('data-id') === sel);
    }
  }

  function focus2d(id){
    if(!posMap || !posMap[id]) return;
    TX = CX - posMap[id].x * S;
    TY = CY - posMap[id].y * S;
    applyView();
  }

  /* ---------- 2D 交互绑定 ---------- */
  var panDrag = null, suppressClick = false;
  function bind2d(){
    svg = $('kgSvg');
    if(!svg) return;

    svg.addEventListener('pointerdown', function(e){
      if(closestCls(e.target, 'kg-node')) return;
      panDrag = { x:e.clientX, y:e.clientY, tx:TX, ty:TY, moved:false };
      var st = $('kgStage'); if(st) st.classList.add('drag');
      if(svg.setPointerCapture) { try { svg.setPointerCapture(e.pointerId); } catch(err){} }
    });
    svg.addEventListener('pointermove', function(e){
      if(!panDrag) return;
      var rect = svg.getBoundingClientRect();
      var k = vbPerPixel(rect);
      var dx = (e.clientX - panDrag.x) * k, dy = (e.clientY - panDrag.y) * k;
      if(Math.abs(dx) + Math.abs(dy) > 3) panDrag.moved = true;
      TX = panDrag.tx + dx; TY = panDrag.ty + dy;
      applyView();
    });
    function endPan(){
      if(panDrag) suppressClick = panDrag.moved;
      panDrag = null;
      var st = $('kgStage'); if(st) st.classList.remove('drag');
    }
    svg.addEventListener('pointerup', endPan);
    svg.addEventListener('pointercancel', endPan);

    svg.addEventListener('click', function(e){
      if(suppressClick){ suppressClick = false; return; }
      var node = closestCls(e.target, 'kg-node');
      if(!node || !node.getAttribute('data-id')) return;
      KG.goTo(node.getAttribute('data-id'));
    });
    svg.addEventListener('wheel', function(e){
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.12 : 1/1.12);
    }, { passive:false });

    var zoom2d = $('kgZoom2d');
    if(zoom2d){
      zoom2d.addEventListener('click', function(e){
        var t = e.target;
        while(t && t !== zoom2d && !t.getAttribute('data-z')) t = t.parentNode;
        if(!t || t === zoom2d) return;
        var z = t.getAttribute('data-z');
        if(z === 'in') zoomCenter(1.22);
        else if(z === 'out') zoomCenter(1/1.22);
        else if(z === 'reset'){ S=1; TX=0; TY=0; applyView(); }
        else if(z === 'relayout'){
          rot2d += Math.PI*2/12;
          render2d();
        }
      });
    }
  }

  /* ---------- 面板 / 按钮事件（只绑定一次） ---------- */
  function bindUI(){
    var close = $('kgClose');
    if(close) close.addEventListener('click', function(){ KG.close(); });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' || e.keyCode === 27){
        var ov = $('kgOverlay');
        if(ov && ov.classList.contains('show')) KG.close();
      }
    });

    var mode = $('kgMode');
    if(mode) mode.addEventListener('click', function(){ KG.toggleMode(); });

    var back = $('kgBack');
    if(back){ back.disabled = true; back.addEventListener('click', function(){ KG._clear(); }); }

    var search = $('kgSearch');
    if(search){
      search.addEventListener('input', function(){
        KG._state.query = search.value || '';
        KG._applyFilter();
      });
    }

    var chips = $('kgChips');
    if(chips){
      chips.addEventListener('click', function(e){
        var b = closestCls(e.target, 'kg-chips');
        if(!b) return;
        var t = e.target;
        while(t && t !== chips && !t.getAttribute('data-v')) t = t.parentNode;
        if(t && t !== chips) KG._setVol(t.getAttribute('data-v'));
      });
    }

    var list = $('kgList');
    if(list){
      list.addEventListener('click', function(e){
        var link = closestCls(e.target, 'kg-link');
        if(link){ KG.goTo(link.getAttribute('data-id')); return; }
        var grp = closestCls(e.target, 'kg-g');
        if(grp) KG._setVol(grp.getAttribute('data-v'));
      });
    }

    var detail = $('kgDetail');
    if(detail){
      detail.addEventListener('click', function(e){
        var a = e.target;
        while(a && a !== detail && !a.getAttribute('data-goto') && !a.getAttribute('data-read')) a = a.parentNode;
        if(!a || a === detail) return;
        var id = a.getAttribute('data-goto');
        if(id){ KG.goTo(id); return; }
        id = a.getAttribute('data-read');
        if(id){
          if(typeof CustomEvent !== 'undefined'){
            window.dispatchEvent(new CustomEvent('kg:read', { detail:{ id:id } }));
          }
          if(KG.onRead) KG.onRead(id);
        }
      });
      detail.innerHTML = emptyHTML();
    }
  }

  /* ---------- 暴露方法 ---------- */
  KG.redraw2d = render2d;
  KG.close2d = function(){ /* 2D 无循环，留空占位，供模式切换调用 */ };
  KG.paint2d = paint2d;
  KG._paint2d = paint2d;
  KG.focus2d = focus2d;
  KG.zoom2d = zoomCenter;

  renderChips();
  renderList();
  bindUI();
  bind2d();
  KG._applyFilter();
})();
