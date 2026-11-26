/* ============================================================
   启动：REG 一致性自检 + 骨架章节自动生成 + 首页初始化
   ============================================================ */
(function(){
  var REG = window.REG;
  if(!REG || !REG.length){ warn('章表未加载'); return; }
  function warn(msg){
    var w=document.getElementById('bootWarn');
    if(w){ w.style.display='block'; w.textContent='页面自检未通过：'+msg; }
  }

  /* ---------- 一致性自检 ---------- */
  function check(){
    var ids={}, errs=[];
    REG.forEach(function(r){
      if(ids[r.id]) errs.push('重复 id：'+r.id);
      ids[r.id]=r;
      if(!window.VOLS[r.v-1]) errs.push('未知卷号：'+r.id);
      if(['入','进','高'].indexOf(r.l)<0) errs.push('未知难度：'+r.id);
      if(['完','骨'].indexOf(r.d)<0) errs.push('未知深度：'+r.id);
    });
    REG.forEach(function(r){
      r.p.forEach(function(id){ if(!ids[id]) errs.push('前置不存在：'+r.id+' ← '+id); });
      r.rel.forEach(function(id){ if(!ids[id]) errs.push('延伸不存在：'+r.id+' → '+id); });
    });
    /* 环检测 */
    var color={};
    function dfs(id, stack){
      if(color[id]===1){ errs.push('前置关系成环：'+stack.concat(id).join(' → ')); return; }
      if(color[id]===2) return;
      color[id]=1;
      var r=ids[id];
      if(r) r.p.forEach(function(p){ dfs(p, stack.concat(id)); });
      color[id]=2;
    }
    REG.forEach(function(r){ dfs(r.id, []); });
    return errs;
  }
  var errs=check();
  if(errs.length){ warn(errs.slice(0,5).join('；')); }

  /* ---------- 骨架章自动生成 ---------- */
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function pad2(n){ n=String(n); return n.length<2?'0'+n:n; }
  function skeletons(){
    var frag=document.createDocumentFragment();
    var made=0;
    REG.forEach(function(r){
      if(r.d!=='骨') return;
      if(document.querySelector('.chapter[data-id="'+r.id+'"]')) return;
      var volName=window.regVolName(r.v);
      var pre=r.p.map(function(id){ var x=window.regById(id); return x?pad2(x.n)+' '+x.t:null; }).filter(Boolean).join('、')||'无';
      var rel=r.rel.map(function(id){ var x=window.regById(id); return x?pad2(x.n)+' '+x.t:null; }).filter(Boolean).join('、')||'待补充';
      var notes = (window.SKELETON_NOTES && window.SKELETON_NOTES[r.id]) || r.k;
      var pts = notes && notes.length ? notes.map(function(k){ return '<li>'+esc(k)+'</li>'; }).join('') : '<li>本章要点将在后续批次展开。</li>';
      var sec=document.createElement('section');
      sec.className='chapter';
      sec.setAttribute('data-id',r.id);
      sec.innerHTML=
        '<div class="chead"><span class="chnum">'+pad2(r.n)+'</span><div class="chead-body">'
        +'<div class="kicker">卷'+['一','二','三','四','五','六','七','八','九','十','十一','十二'][r.v-1]+' · '+esc(volName)+'　'+window.regLevelName(r.l)+' · '+window.regAudienceName(r.a)+'</div>'
        +'<h2>'+esc(r.t)+'</h2><div class="desc">骨架节点：已建立与全书的位置关系，正文在后续批次展开</div></div></div>'
        +'<div class="path-strip">前置：'+esc(pre)+'　|　当前：<b>'+esc(r.t)+'</b>　|　延伸：'+esc(rel)+'</div>'
        +'<h3>先记住这几件事</h3><ul class="bone-list">'+pts+'</ul>'
        +'<div class="bone-note">这是骨架章：概念、公式与例题将在后续批次补入，当前可先通过前置与延伸节点理解它在全书中的位置。此处内容仅作教学说明。</div>';
      frag.appendChild(sec);
      made++;
    });
    var main=document.getElementById('main');
    if(main && made) main.appendChild(frag);
    return made;
  }
  window.SKELETON_COUNT=skeletons();

  /* ---------- 章头视觉印记 ---------- */
  if(window.VISUALS){
    Array.prototype.forEach.call(document.querySelectorAll('.chapter .chead'), function(head){
      if(head.querySelector('.ch-mark')) return;
      var sec=head.parentNode;
      var r=window.regById(sec && sec.getAttribute('data-id'));
      if(!r) return;
      var wrap=document.createElement('div');
      wrap.className='ch-mark-wrap';
      wrap.innerHTML=window.VISUALS.chapterMark(r);
      head.appendChild(wrap);
    });
  }

  var em=document.getElementById('kgCount');
  if(em) em.textContent=REG.length+' 个知识点';

  if(typeof window.goHome==='function') window.goHome();
  if(!errs.length) window.bootOK=true;
  window.bootErrors=errs;
})();
