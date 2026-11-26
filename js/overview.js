/* ============================================================
   学习总览：三泳道（入门 / 进阶 / 高阶）+ 章内「在全书中的位置」
   数据源：js/registry.js 的 REG，不在别处重复维护章目
   ============================================================ */
(function(){
  var REG = window.REG;
  var byId = {};
  REG.forEach(function(r){ byId[r.id] = r; });
  var overlay=document.getElementById('ovOverlay');
  var body=document.getElementById('ovBody');
  var btn=document.getElementById('ovBtn');
  var closeBtn=document.getElementById('ovClose');
  function pad2(n){ n=String(n); return n.length<2?'0'+n:n; }

  function link(id, cls){
    var r=byId[id];
    var a=document.createElement('a');
    a.setAttribute('data-id',id);
    if(cls) a.className=cls;
    a.innerHTML='<i>'+pad2(r?r.n:0)+'</i>'+(r?r.t:id);
    a.addEventListener('click', function(){
      close();
      if(typeof window.go==='function') window.go(id);
    });
    return a;
  }

  function buildLanes(){
    if(!body) return;
    var html='';
    ['入','进','高'].forEach(function(lv){
      var items=REG.filter(function(r){ return r.l===lv; });
      var links=items.map(function(r){
        return '<a data-id="'+r.id+'" class="'+(r.d==='骨'?'bone':'')+'"><i>'+pad2(r.n)+'</i>'+r.t+'</a>';
      }).join('');
      html+='<div class="ov-lane lv-'+lv+'"><h5>'+window.regLevelName(lv)+'　'+items.length+' 节点</h5>'+links+'</div>';
    });
    html+='<div class="ov-lane"><h5>按卷浏览</h5>';
    window.VOLS.forEach(function(name,i){
      var v=i+1, count=REG.filter(function(r){ return r.v===v; }).length;
      html+='<div class="ov-vol"><b>卷'+['一','二','三','四','五','六','七','八','九','十','十一','十二'][i]+' · '+name+'</b>　'+count+' 节</div>';
    });
    html+='</div>';
    body.innerHTML='<div class="ov-lanes">'+html+'</div>'
      +'<div class="ov-footnote">实心章为完整课文，标注「骨架」的章已列出要点与前置关系，后续批次逐步展开。箭头关系可在知识图谱中查看。</div>';
    Array.prototype.forEach.call(body.querySelectorAll('a[data-id]'), function(a){
      a.addEventListener('click', function(){
        close();
        if(typeof window.go==='function') window.go(a.getAttribute('data-id'));
      });
    });
  }

  function cardFor(r){
    if(!r) return null;
    var card=document.createElement('div');
    card.className='poscard';
    var h=document.createElement('div'); h.className='pos-h'; h.textContent='在全书中的位置'; card.appendChild(h);
    var where=document.createElement('div'); where.className='pos-where';
    where.innerHTML='卷'+['一','二','三','四','五','六','七','八','九','十','十一','十二'][r.v-1]+' · '+window.regVolName(r.v)
      +'　<b>第 '+pad2(r.n)+' / 100 章</b>　<span class="lv '+r.l+'">'+window.regLevelName(r.l)+'</span>'
      +'<span class="au">'+window.regAudienceName(r.a)+'</span>';
    card.appendChild(where);
    var row=document.createElement('div'); row.className='pos-links';
    if(r.p.length){
      var s1=document.createElement('span'); s1.textContent='前置'; row.appendChild(s1);
      r.p.forEach(function(id){ row.appendChild(link(id)); });
    }
    if(r.rel.length){
      var s2=document.createElement('span'); s2.textContent='延伸'; row.appendChild(s2);
      r.rel.forEach(function(id){ row.appendChild(link(id)); });
    }
    if(row.childNodes.length) card.appendChild(row);
    return card;
  }

  REG.forEach(function(r){
    var sec=document.querySelector('.chapter[data-id="'+r.id+'"]');
    if(!sec) return;
    var card=cardFor(r);
    if(card) sec.appendChild(card);
  });

  window.updatePoscard=function(id){ /* 位置卡随章节静态生成，切换章节时无需重建 */ };

  function open(){ if(overlay) overlay.classList.add('open'); }
  function close(){ if(overlay) overlay.classList.remove('open'); }
  window.ovOpen=open; window.ovClose=close;
  if(btn) btn.addEventListener('click', open);
  if(closeBtn) closeBtn.addEventListener('click', close);
  if(overlay) overlay.addEventListener('click', function(e){ if(e.target===overlay) close(); });
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape' && overlay && overlay.classList.contains('open')) close();
  });

  buildLanes();
})();
