/* ============================================================
   kg3d.js —— 知识点网络 · 伪 3D 椭球云团（原生 Canvas，无 Three.js）
   依赖：registry.js、kg2d.js（后者提供 window.KG 核心与共享面板）
   本文件只补充 3D 相关方法到 window.KG，不覆盖核心 open/close/
   redraw/goTo，保证 2D / 3D 共用同一份选择状态与详情面板。
   ============================================================ */
(function(){
  'use strict';

  var REG = window.REG || [];
  var KG = window.KG = window.KG || {};
  var COLORS = { '入':'#336f92', '进':'#3a7076', '高':'#b04a33' };

  var canvas = null, ctx = null, dpr = 1, cw = 0, ch = 0;
  var base = null, clusters = null, projected = [], projById = {};
  var bound = false, running = false, raf = 0, lastT = 0;
  var seed = 0;
  var drag = null;

  var st = {
    yaw: 0,
    pitch: 0.42,
    zoom: 1,
    autoRot: true,
    vy: 0,
    vp: 0,
    targetYaw: null
  };

  function $(id){ return document.getElementById(id); }
  function clamp(v, a, b){ return v < a ? a : (v > b ? b : v); }
  function shortest(a){
    a = (a + Math.PI) % (Math.PI*2);
    if(a < 0) a += Math.PI*2;
    return a - Math.PI;
  }
  function colorOf(r){ return COLORS[r.l] || '#336f92'; }
  function regById(id){ return window.regById ? window.regById(id) : null; }

  /* ---------- 基础坐标：12 卷沿椭圆分布，每卷一小团 ---------- */
  function buildBase(){
    var byVol = {}, i, r;
    for(i=0;i<REG.length;i++){
      r = REG[i];
      (byVol[r.v] = byVol[r.v] || []).push(r);
    }
    var arr = [], cl = [];
    for(var v=1; v<=12; v++){
      var a = (v-1) * (Math.PI*2/12) - Math.PI/2 + seed;
      var ccx = 300 * Math.cos(a);
      var ccz = 205 * Math.sin(a);
      var ccy = ((v % 4) - 1.5) * 16;
      cl.push({ name: window.regVolName(v), x:ccx, y:ccy, z:ccz });
      var list = byVol[v] || [];
      var c = list.length;
      var rad = 15 + 8 * Math.sqrt(c);
      for(var j=0;j<c;j++){
        var u = (j + 0.5) / c;
        var phi = Math.acos(clamp(1 - 2*u, -1, 1));
        var theta = Math.PI * (1 + Math.sqrt(5)) * j;
        arr.push({
          r: list[j],
          x: ccx + rad * Math.sin(phi) * Math.cos(theta),
          y: ccy + rad * Math.cos(phi) * 0.7,
          z: ccz + rad * Math.sin(phi) * Math.sin(theta),
          th: a
        });
      }
    }
    clusters = cl;
    return arr;
  }

  function project(p){
    var cy = Math.cos(st.yaw), sy = Math.sin(st.yaw);
    var cp = Math.cos(st.pitch), sp = Math.sin(st.pitch);
    var x1 = p.x*cy + p.z*sy;
    var z1 = -p.x*sy + p.z*cy;
    var y2 = p.y*cp - z1*sp;
    var z2 = p.y*sp + z1*cp;
    var s = 900 / (900 + z2);
    return {
      x: cw/2 + x1 * s * st.zoom,
      y: ch/2 + y2 * s * st.zoom,
      s: s,
      z: z2
    };
  }

  /* ---------- 尺寸 / DPR ---------- */
  function resize(){
    if(!canvas || !ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = canvas.clientWidth || 1;
    ch = canvas.clientHeight || 1;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ---------- 绘制 ---------- */
  function draw(){
    if(!ctx || !cw || !ch) return;
    ctx.clearRect(0, 0, cw, ch);

    // 云团中心的题眼
    ctx.save();
    ctx.textAlign = 'center';
    ctx.globalAlpha = .20;
    ctx.fillStyle = '#7e96a6';
    ctx.font = '600 ' + Math.round(26 * Math.min(st.zoom, 1.6)) + 'px "Optima","Microsoft YaHei",sans-serif';
    ctx.fillText('金融学', cw/2, ch/2 - 2);
    ctx.font = '10px "Optima","Microsoft YaHei",sans-serif';
    ctx.fillText('12 卷 · 100 节点', cw/2, ch/2 + 18);
    ctx.restore();

    // 卷名（淡）
    if(clusters && st.zoom > .7){
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '11px "Optima","Microsoft YaHei",sans-serif';
      clusters.forEach(function(c){
        var p = project(c);
        ctx.globalAlpha = clamp((p.s - .65) * .9, .04, .28);
        ctx.fillStyle = '#7e96a6';
        ctx.fillText(c.name, p.x, p.y + 4);
      });
      ctx.restore();
    }

    projected = [];
    projById = {};
    var i, r, pp;
    for(i=0;i<base.length;i++){
      r = base[i].r;
      if(!KG._isVisible(r.id)) continue;
      pp = project(base[i]);
      pp.r = r;
      pp.radius = clamp((r.d === '骨' ? 5.2 : 6.4) * pp.s * st.zoom, 2.6, 12);
      projected.push(pp);
      projById[r.id] = pp;
    }
    projected.sort(function(a, b){ return b.z - a.z; }); // 远的先画

    var sel = KG.currentId;
    var neigh = {};
    if(sel){
      var sr = regById(sel);
      if(sr) sr.p.concat(sr.rel).forEach(function(id){ neigh[id] = true; });
    }

    // 前置关系连线
    ctx.save();
    ctx.lineCap = 'round';
    for(i=0;i<REG.length;i++){
      r = REG[i];
      if(!projById[r.id]) continue;
      for(var k=0;k<r.p.length;k++){
        var from = projById[r.p[k]];
        if(!from) continue;
        var to = projById[r.id];
        var on = !!(sel && (r.p[k] === sel || r.id === sel));
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = on ? 'rgba(176,74,51,.62)' : 'rgba(51,111,146,.15)';
        ctx.lineWidth = on ? 1.6 : 1;
        ctx.stroke();
      }
    }
    ctx.restore();

    var showAllLabels = st.zoom >= 1.3;
    for(i=0;i<projected.length;i++){
      pp = projected[i];
      r = pp.r;
      var isSel = (r.id === sel);
      var isRel = !!neigh[r.id];
      var col = isSel ? '#b04a33' : colorOf(r);
      var alpha = clamp((pp.s - .6) * 1.5, .35, 1);
      if(sel && !isSel && !isRel) alpha *= .45;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(pp.x, pp.y, isSel ? pp.radius + 3 : pp.radius, 0, Math.PI*2);
      if(r.d === '骨' && !isSel){
        ctx.fillStyle = '#fbfdff';
        ctx.fill();
        ctx.setLineDash([2, 2]);
      } else {
        ctx.fillStyle = col;
        ctx.fill();
      }
      ctx.strokeStyle = col;
      ctx.lineWidth = (isSel || isRel) ? 2 : 1.2;
      ctx.stroke();
      ctx.restore();

      if(showAllLabels || isSel || isRel){
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = (isSel ? '600 12px ' : '11px ') + '"Source Han Serif SC","SimSun",serif';
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(235,243,251,.95)';
        ctx.strokeText(r.t, pp.x, pp.y + pp.radius + 13);
        ctx.fillStyle = isSel ? '#b04a33' : '#41545f';
        ctx.fillText(r.t, pp.x, pp.y + pp.radius + 13);
        ctx.restore();
      }
    }
  }

  /* ---------- 动画循环 ---------- */
  function update(dt){
    if(!drag){
      if(Math.abs(st.vy) > .00002 || Math.abs(st.vp) > .00002){
        st.yaw += st.vy * dt / 16;
        st.pitch = clamp(st.pitch + st.vp * dt / 16, -1.35, 1.35);
        st.vy *= .92;
        st.vp *= .92;
      } else if(st.targetYaw != null){
        var d = shortest(st.targetYaw - st.yaw);
        st.yaw += d * .09;
        if(Math.abs(d) < .008) st.targetYaw = null;
      } else if(st.autoRot){
        st.yaw += .0018 * dt / 16;
      }
    }
  }
  function tick(t){
    if(!running) return;
    raf = requestAnimationFrame(tick);
    var dt = lastT ? Math.min(48, t - lastT) : 16;
    lastT = t;
    update(dt);
    draw();
  }
  function start(){
    if(running) return;
    var ov = $('kgOverlay');
    if(document.hidden || !ov || !ov.classList.contains('show') || KG.mode !== '3d') return;
    running = true; lastT = 0;
    raf = requestAnimationFrame(tick);
  }
  function stop(){
    running = false;
    if(raf) cancelAnimationFrame(raf);
    raf = 0; lastT = 0;
  }

  /* ---------- 命中检测 ---------- */
  function pick(x, y){
    var best = null, bd = 1e9;
    for(var i=0;i<projected.length;i++){
      var p = projected[i];
      var dx = p.x - x, dy = p.y - y;
      var d = dx*dx + dy*dy;
      var rr = Math.max(13, p.radius + 7);
      if(d < rr*rr && d < bd){ bd = d; best = p; }
    }
    return best;
  }

  /* ---------- 交互（只绑定一次） ---------- */
  function bind3d(){
    if(bound || !canvas) return;
    bound = true;

    canvas.addEventListener('pointerdown', function(e){
      drag = { x:e.clientX, y:e.clientY, sx:e.clientX, sy:e.clientY, moved:false };
      st.vy = 0; st.vp = 0;
      if(canvas.setPointerCapture){ try{ canvas.setPointerCapture(e.pointerId); }catch(err){} }
    });
    canvas.addEventListener('pointermove', function(e){
      if(!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.x = e.clientX; drag.y = e.clientY;
      if(Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) > 4) drag.moved = true;
      st.yaw += dx * .006;
      st.pitch = clamp(st.pitch + dy * .006, -1.35, 1.35);
      st.vy = dx * .006;
      st.vp = dy * .006;
      st.targetYaw = null;
    });
    function endDrag(e){
      if(!drag) return;
      var moved = drag.moved;
      drag = null;
      if(!moved && e){
        var rect = canvas.getBoundingClientRect();
        var hit = pick(e.clientX - rect.left, e.clientY - rect.top);
        if(hit) KG.goTo(hit.r.id);
      }
    }
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', function(){ drag = null; });
    canvas.addEventListener('wheel', function(e){
      e.preventDefault();
      st.zoom = clamp(st.zoom * (e.deltaY < 0 ? 1.12 : 1/1.12), .45, 3.2);
    }, { passive:false });

    var zoom3d = $('kgZoom3d');
    if(zoom3d){
      zoom3d.addEventListener('click', function(e){
        var t = e.target;
        while(t && t !== zoom3d && !t.getAttribute('data-k3')) t = t.parentNode;
        if(!t || t === zoom3d) return;
        var k = t.getAttribute('data-k3');
        if(k === 'rot') KG.toggleRot3d();
        else if(k === 'in') st.zoom = clamp(st.zoom * 1.2, .45, 3.2);
        else if(k === 'out') st.zoom = clamp(st.zoom / 1.2, .45, 3.2);
        else if(k === 'reset'){ st.yaw = 0; st.pitch = .42; st.zoom = 1; st.vy = 0; st.vp = 0; st.targetYaw = null; }
        else if(k === 'relayout'){ seed += Math.PI/6; base = buildBase(); }
      });
    }

    window.addEventListener('resize', function(){
      if(KG.mode === '3d') resize();
    });
    if(typeof ResizeObserver !== 'undefined' && $('kgStage')){
      new ResizeObserver(function(){
        if(KG.mode === '3d') resize();
      }).observe($('kgStage'));
    }
    document.addEventListener('visibilitychange', function(){
      if(document.hidden) stop();
      else start();
    });
  }

  /* ---------- 挂到 window.KG ---------- */
  KG.redraw3d = function(){
    canvas = canvas || $('kg3d');
    if(!canvas || !canvas.getContext) return;
    if(!ctx){ ctx = canvas.getContext('2d'); bind3d(); }
    if(!base) base = buildBase();
    resize();
    start();
  };
  KG.halt3d = stop;
  KG.wake3d = start;
  KG.open3d = KG.redraw3d;
  KG.close3d = stop;
  KG.zoom3d = function(f){ st.zoom = clamp(st.zoom * f, .45, 3.2); };
  KG.reset3d = function(){
    st.yaw = 0; st.pitch = .42; st.zoom = 1;
    st.vy = 0; st.vp = 0; st.targetYaw = null;
  };
  KG.relayout3d = function(){ seed += Math.PI/6; base = buildBase(); };
  KG.toggleRot3d = function(){
    st.autoRot = !st.autoRot;
    var b = $('kgZoom3d') && $('kgZoom3d').querySelector('[data-k3="rot"]');
    if(b){ b.textContent = st.autoRot ? '⏸' : '▶'; b.setAttribute('aria-label', st.autoRot ? '暂停旋转' : '继续旋转'); }
  };
  KG.focus3d = function(id){
    if(!base) return;
    for(var i=0;i<base.length;i++){
      if(base[i].r.id === id){
        st.targetYaw = base[i].th + Math.PI/2;
        st.zoom = Math.max(st.zoom, 1.15);
        st.vy = 0; st.vp = 0;
        break;
      }
    }
  };
  KG.goTo3d = function(id){
    KG.goTo(id);
  };
})();
