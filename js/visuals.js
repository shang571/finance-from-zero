/* ============================================================
   视觉系统：12 卷几何徽记 + 知识星图 + 章头印记
   全部内联 SVG，零依赖，跟随 currentColor 与 CSS 变量
   ============================================================ */
(function(){
  /* 12 卷徽记：从器物与工具中抽象出的几何线条，viewBox 0 0 40 40 */
  var GLYPHS = [
    /* 1 金钱常识 · 外圆内方（铜钱） */
    '<circle cx="20" cy="20" r="13"/><rect x="15" y="15" width="10" height="10"/><path d="M20 4v3M20 33v3M4 20h3M33 20h3"/>',
    /* 2 看懂财报 · 账册 */
    '<path d="M9 8h18l4 4v20H9z"/><path d="M27 8v5h4"/><path d="M13 17h14M13 22h14M13 27h9"/>',
    /* 3 分析与估值 · 天平 */
    '<path d="M20 8v24M12 32h16M9 15h22"/><path d="M9 15l-5 8h10zM31 15l-5 8h10z"/><circle cx="20" cy="12" r="2.4"/>',
    /* 4 投资学 · 曲线与轴 */
    '<path d="M7 33h27M7 33V7"/><path d="M9 27l7-6 5 3 11-13"/><path d="M28 11h4v4"/>',
    /* 5 基金与配置 · 圆环分段 */
    '<circle cx="20" cy="20" r="12"/><path d="M20 8a12 12 0 0 1 10.4 18L20 20z"/><circle cx="20" cy="20" r="4"/>',
    /* 6 公司金融 · 器械齿轮 */
    '<circle cx="20" cy="20" r="6"/><path d="M20 5v5M20 30v5M5 20h5M30 20h5M9.4 9.4l3.5 3.5M27.1 27.1l3.5 3.5M30.6 9.4l-3.5 3.5M12.9 27.1l-3.5 3.5"/>',
    /* 7 宏观经济 · 江河流线 */
    '<path d="M5 13c6-5 11 5 17 0s9-4 13-1M5 21c6-5 11 5 17 0s9-4 13-1M5 29c6-5 11 5 17 0s9-4 13-1"/>',
    /* 8 微观经济 · 供需交叉 */
    '<path d="M8 32h25M8 32V7"/><path d="M10 9l18 21M28 10L11 30"/><circle cx="19.5" cy="19.5" r="2.2"/>',
    /* 9 交易实操 · 烛台 */
    '<path d="M11 9v22M11 14h5v10h-5zM21 7v24M21 12h5v12h-5zM31 11v20M31 16h5v9h-5z"/>',
    /* 10 衍生品 · 分叉树 */
    '<circle cx="20" cy="7" r="2.4"/><path d="M20 10v7M20 17L11 25M20 17l9 8"/><circle cx="11" cy="28" r="2.4"/><circle cx="29" cy="28" r="2.4"/><path d="M11 31v4M29 31v4"/>',
    /* 11 行为金融 · 镜与影 */
    '<path d="M7 8v24M33 8v24"/><path d="M12 12c5-3 11-3 16 0M12 20c5-3 11-3 16 0M12 28c5-3 11-3 16 0"/><path d="M20 5v30" stroke-dasharray="2 3"/>',
    /* 12 量化入门 · 筹策格 */
    '<rect x="7" y="7" width="26" height="26"/><path d="M15.7 7v26M24.3 7v26M7 15.7h26M7 24.3h26"/><circle cx="11.3" cy="11.3" r="1.5" fill="currentColor" stroke="none"/><circle cx="28.7" cy="28.7" r="1.5" fill="currentColor" stroke="none"/>'
  ];

  function glyph(v, size){
    var g=GLYPHS[(v-1)%12]||GLYPHS[0];
    var s=size||24;
    return '<svg class="vol-glyph" viewBox="0 0 40 40" width="'+s+'" height="'+s+'" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+g+'</svg>';
  }

  /* 章头印记：卷徽记水印 + 朱印序号 */
  function chapterMark(r){
    var seal='<span class="ch-seal" aria-hidden="true">'+String(r.n<10?'0'+r.n:r.n)+'</span>';
    return '<div class="ch-mark" aria-hidden="true">'+glyph(r.v,168)+'</div>'+seal;
  }

  /* 首页知识星图：12 卷环列，按难度着色，卷间以连线串成路径 */
  function starMap(){
    var W=620,H=380,cx=W/2,cy=H/2+6,R=142;
    var out='<svg class="star-map" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="十二卷知识地图">';
    out+='<defs><pattern id="starGrid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#cfe0ee" stroke-width=".4" opacity=".55"/></pattern></defs>';
    out+='<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="url(#starGrid)" opacity=".5"/>';
    /* 三道同心环，对应三个难度层级 */
    [R,R*0.72,R*0.44].forEach(function(rr,i){
      out+='<circle cx="'+cx+'" cy="'+cy+'" r="'+rr+'" fill="none" stroke="#cfe0ee" stroke-width="'+(i===0?1:0.6)+'" stroke-dasharray="'+(i===0?'':'3 5')+'"/>';
    });
    var pts=[];
    for(var i=0;i<12;i++){
      var a=-Math.PI/2+i*Math.PI/6;
      pts.push([cx+R*Math.cos(a),cy+R*Math.sin(a)]);
    }
    out+='<path d="M'+pts.map(function(p){return p[0].toFixed(1)+' '+p[1].toFixed(1);}).join(' L')+' Z" fill="none" stroke="#cfe0ee" stroke-width="1"/>';
    /* 卷节点 */
    for(var v=1;v<=12;v++){
      var p=pts[v-1];
      var color=v<=4?'#336f92':(v<=9?'#3a7076':'#b04a33');
      var label=window.VOLS?window.VOLS[v-1]:('卷'+v);
      out+='<g class="star-node" data-v="'+v+'">';
      out+='<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="23" fill="#fbfdff" stroke="'+color+'" stroke-width="1.2"/>';
      out+='<g transform="translate('+(p[0]-13).toFixed(1)+','+(p[1]-13).toFixed(1)+') scale(.65)" color="'+color+'">'+glyph(v,40)+'</g>';
      var anchor=p[0]<cx-24?'end':(p[0]>cx+24?'start':'middle');
      var tx=p[0]+(p[0]<cx-24?-30:(p[0]>cx+24?30:0));
      out+='<text x="'+tx.toFixed(1)+'" y="'+(p[1]+5).toFixed(1)+'" text-anchor="'+anchor+'" font-size="13" font-family="Songti SC,SimSun,serif" fill="#41545f">'+label+'</text>';
      out+='</g>';
    }
    out+='<circle cx="'+cx+'" cy="'+cy+'" r="34" fill="#b04a33"/>';
    out+='<text x="'+cx+'" y="'+(cy+7)+'" text-anchor="middle" font-size="22" font-family="Songti SC,SimSun,serif" fill="#fbfdff" letter-spacing="2">金融</text>';
    out+='<text x="'+cx+'" y="'+(cy+58)+'" text-anchor="middle" font-size="11" font-family="Microsoft YaHei,sans-serif" fill="#7e96a6" letter-spacing="3">从简到难 · 十二卷</text>';
    out+='</svg>';
    return out;
  }

  /* 首页难度阶梯：三级书阶，高度递增，朱印标级 */
  function ladderMap(){
    var steps=[
      {x:24,  top:120, w:262, lv:'入门', en:'LEVEL 01', n:17, seal:'壹', color:'#336f92', fill:'#e3eef8', vols:'卷一 金钱常识 · 卷二 看懂财报'},
      {x:318, top:70,  w:262, lv:'进阶', en:'LEVEL 02', n:58, seal:'贰', color:'#3a7076', fill:'#e3efef', vols:'卷三 分析与估值 · 卷六 公司金融'},
      {x:612, top:20,  w:262, lv:'高阶', en:'LEVEL 03', n:25, seal:'叁', color:'#b04a33', fill:'#f8eae5', vols:'卷十 衍生品 · 卷十二 量化入门'}
    ];
    var out='<svg class="ladder-svg" viewBox="0 0 900 258" role="img" aria-label="入门、进阶、高阶三级难度阶梯">';
    out+='<defs><pattern id="ladderHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
       + '<path d="M0 0V8" stroke="#cfe0ee" stroke-width=".5" opacity=".5"/></pattern></defs>';
    out+='<rect x="0" y="232" width="900" height="1" fill="#cfe0ee"/>';
    /* 上升引导线 */
    out+='<path d="M286 120 L318 70 L612 20" fill="none" stroke="#b04a33" stroke-width="1.1" stroke-dasharray="5 4"/>';
    out+='<path d="M604 16 L612 20 L606 27" fill="none" stroke="#b04a33" stroke-width="1.1"/>';
    steps.forEach(function(s){
      var h=232-s.top;
      out+='<g class="ladder-step">';
      out+='<rect x="'+s.x+'" y="'+s.top+'" width="'+s.w+'" height="'+h+'" fill="'+s.fill+'" stroke="'+s.color+'" stroke-width="1"/>';
      out+='<rect x="'+(s.x+6)+'" y="'+(s.top+6)+'" width="'+(s.w-12)+'" height="'+(h-12)+'" fill="url(#ladderHatch)" opacity=".5"/>';
      /* 朱印 */
      out+='<rect x="'+(s.x+s.w-34)+'" y="'+(s.top+9)+'" width="24" height="24" fill="'+s.color+'"/>';
      out+='<text x="'+(s.x+s.w-22)+'" y="'+(s.top+26)+'" text-anchor="middle" font-size="14" font-family="Songti SC,SimSun,serif" fill="#fbfdff">'+s.seal+'</text>';
      out+='<text x="'+(s.x+18)+'" y="'+(s.top+21)+'" font-size="9.5" letter-spacing="2" font-family="Microsoft YaHei,sans-serif" fill="'+s.color+'">'+s.en+'</text>';
      out+='<text x="'+(s.x+18)+'" y="'+(s.top+54)+'" font-size="27" font-family="Songti SC,SimSun,serif" fill="#1c2a33" letter-spacing="3">'+s.lv+'</text>';
      out+='<text x="'+(s.x+18)+'" y="'+(s.top+74)+'" font-size="11.5" font-family="Microsoft YaHei,sans-serif" fill="#41545f">'+s.n+' 个节点</text>';
      out+='<path d="M'+(s.x+18)+' '+(s.top+85)+' h'+(s.w-36)+'" stroke="'+s.color+'" stroke-width=".6" opacity=".5"/>';
      out+='<text x="'+(s.x+18)+'" y="'+(s.top+101)+'" font-size="10.5" font-family="Songti SC,SimSun,serif" fill="#7e96a6">'+s.vols+'</text>';
      out+='</g>';
    });
    out+='</svg>';
    return out;
  }

  function pathStrip(){
    return '<svg class="path-glyph" viewBox="0 0 320 40" aria-hidden="true"><path d="M4 30h60c18 0 18-20 36-20h50c18 0 18 18 36 18h50c16 0 20-16 40-16h40" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="64" cy="30" r="3.4" fill="currentColor"/><circle cx="150" cy="10" r="3.4" fill="currentColor"/><circle cx="236" cy="28" r="3.4" fill="currentColor"/><circle cx="316" cy="12" r="3.4" fill="currentColor"/></svg>';
  }

  window.VISUALS = {
    glyph:glyph,
    chapterMark:chapterMark,
    starMap:starMap,
    ladderMap:ladderMap,
    pathStrip:pathStrip,
    GLYPHS:GLYPHS
  };
})();
