/* ============================================================
 图表：canvas 尺寸表 + 各章绘图函数
   依赖：无（仅 DOM）
   被 nav.js 的 go() 调用
   ============================================================ */

/* ============================================================
   Canvas 图表：固定逻辑坐标 800×H，按容器宽度等比缩放
   ============================================================ */
var CH = {
  /* 复用旧站 */
  flowChart:[800,200], eqBal:[800,260], subjTree:[780,220], voucherTree:[780,250],
  cycleRing:[780,300], costFlow:[800,230], bsChart:[800,280], compCurve:[800,260],
  smlChart:[800,270], npvCurve:[800,270], waccCurve:[800,260], dupontTree:[800,300],
  /* 金融站新增 */
  inflaErode:[800,260], compoundCurve:[800,280], cashflow3:[800,280], homeCurve:[800,240],
  ratioRadar:[800,300], annuityTL:[800,240], bondYield:[800,270], dcfSens:[800,280],
  peBand:[800,270], diversify:[800,270], frontCap:[800,280], allocRing:[800,280],
  rebalBand:[800,270], gdpCycle:[800,280], sdShift:[800,280], optPayoff:[800,280],
  prospect:[800,280]
};
function prep(c){
  if(!c) return null;
  var m = CH[c.id]; if(!m) return null;
  var LW = m[0], H = m[1];
  /* 宽度必须取父容器的可用宽度，不能取 canvas 自身：
     canvas 一旦被写入 style.width，就会把父容器撑开，clientWidth 随之变大，形成自锁。
     因此测量前先把 canvas 的 CSS 宽度归零，让父容器回到真实可用宽度。 */
  var host = c.parentNode;
  c.style.width = '0px';
  var w = 0;
  if(host){
    /* clientWidth 含 padding，必须扣掉左右内边距，否则画布比内容区宽，会被 max-width 二次压缩 */
    var hs = getComputedStyle(host);
    w = host.clientWidth - (parseFloat(hs.paddingLeft) || 0) - (parseFloat(hs.paddingRight) || 0);
  }
  if(!w || w < 60) w = LW;
  /* 图表按 800 逻辑宽绘制，字号在里面。若压缩到手机宽度，字会小到看不清，
     因此设下限，宁可让 .chart-box 横向滑动，也要保住可读字号。 */
  var MINW = 620;
  if(w < MINW) w = Math.min(MINW, LW);
  if(c._w === w){
    /* 尺寸没变，恢复原宽度即可，无需重绘 */
    c.style.width = w + 'px';
    return null;
  }
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var scale = w / LW;
  c.width = Math.round(w * dpr);
  c.height = Math.round(H * scale * dpr);
  /* 位图按 dpr 放大保证清晰，CSS 尺寸锁定到 w */
  c.style.width = w + 'px';
  c.style.height = (H * scale) + 'px';
  /* 允许比容器宽：超出部分由 .chart-box 横向滚动承接，不能用 max-width 压回去 */
  c.style.maxWidth = 'none';
  var ctx = c.getContext('2d');
  ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  ctx.clearRect(0, 0, LW, H);
  c._w = w;
  /* 内容比容器宽时，按构图决定初始滚动位置：
     环形/曲线/树状图是居中构图，居中显示才不空半边；
     从左到右的流程图则保持左起，避免切掉起点。 */
  if(host && host.scrollWidth > host.clientWidth + 1){
    var CENTERED = {
      eqBal:1, subjTree:1, cycleRing:1, bsChart:1, compCurve:1,
      smlChart:1, npvCurve:1, waccCurve:1, dupontTree:1
    };
    host.scrollLeft = CENTERED[c.id] ? Math.round((host.scrollWidth - host.clientWidth) / 2) : 0;
  }
  return {ctx:ctx, W:LW, H:H};
}
function rrect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}
function box(ctx,x,y,w,h,title,sub,fill,stroke,tc){
  ctx.fillStyle = fill || '#fbfdff';
  ctx.strokeStyle = stroke || '#cfe0ee';
  ctx.lineWidth = 1;
  rrect(ctx,x,y,w,h,1); ctx.fill(); ctx.stroke();
  ctx.textAlign='center';
  ctx.fillStyle = tc || '#1c2a33';
  ctx.font = '600 13px "Source Han Serif SC","Songti SC",serif';
  ctx.fillText(title, x+w/2, y+(sub?h/2-3:h/2+5));
  if(sub){
    ctx.font = '11px "Microsoft YaHei",sans-serif';
    ctx.fillStyle = tc ? 'rgba(255,255,255,.74)' : '#7e96a6';
    ctx.fillText(sub, x+w/2, y+h/2+14);
  }
}
function arrow(ctx,x1,y1,x2,y2,color){
  ctx.strokeStyle = color || '#5a97b8';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  var ang = Math.atan2(y2-y1, x2-x1);
  ctx.beginPath();
  ctx.moveTo(x2,y2);
  ctx.lineTo(x2-6*Math.cos(ang-0.4), y2-6*Math.sin(ang-0.4));
  ctx.lineTo(x2-6*Math.cos(ang+0.4), y2-6*Math.sin(ang+0.4));
  ctx.closePath(); ctx.fillStyle=color||'#5a97b8'; ctx.fill();
}

function drawFlow(){
  var p=prep(document.getElementById('flowChart')); if(!p) return;
  var ctx=p.ctx, W=p.W, H=p.H;
  var boxes=[{t:'经济业务',s:'交易发生'},{t:'原始凭证',s:'发票/收据'},{t:'记账凭证',s:'会计分录'},{t:'账簿',s:'总账/明细账'},{t:'财务报表',s:'三张表'}];
  var bw=118, gap=(W-40-bw*5)/4, y=70, bh=64;
  boxes.forEach(function(b,i){
    var x = 20 + i*(bw+gap);
    ctx.fillStyle = i===4 ? '#336f92' : '#fbfdff';
    ctx.strokeStyle = i===4 ? '#336f92' : '#cfe0ee';
    ctx.lineWidth = 1;
    rrect(ctx,x,y,bw,bh,1); ctx.fill(); ctx.stroke();
    ctx.fillStyle = i===4 ? '#fbfdff' : '#1c2a33';
    ctx.font = '600 14px "Source Han Serif SC","Songti SC",serif';
    ctx.textAlign = 'center';
    ctx.fillText(b.t, x+bw/2, y+27);
    ctx.font = '11px "Microsoft YaHei",sans-serif';
    ctx.fillStyle = i===4 ? 'rgba(255,255,255,.76)' : '#7e96a6';
    ctx.fillText(b.s, x+bw/2, y+47);
    if(i<4){
      var ax = x+bw+8, ay = y+bh/2;
      ctx.strokeStyle='#5a97b8'; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(ax+gap-16,ay); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax+gap-16,ay); ctx.lineTo(ax+gap-21,ay-4); ctx.lineTo(ax+gap-21,ay+4); ctx.closePath();
      ctx.fillStyle='#5a97b8'; ctx.fill();
    }
  });
  ctx.fillStyle='#7e96a6'; ctx.font='11.5px "Microsoft YaHei",sans-serif';
  ctx.fillText('核对', 20+bw+gap/2-10, y+bh+22);
  ctx.fillText('核对', 20+2*(bw+gap)+(bw+gap)/2-10, y+bh+22);
}

function drawEqBal(){
  var p=prep(document.getElementById('eqBal')); if(!p) return;
  var ctx=p.ctx, W=p.W, H=p.H;
  var data=[{label:'初始',a:500,l:200,e:300},{label:'借款+100',a:600,l:300,e:300},{label:'还债-50',a:550,l:250,e:300},{label:'盈利+50',a:600,l:250,e:350}];
  var base=H-46, maxV=700, sc=(H-96)/maxV;
  var bw=34, groupW=150;
  data.forEach(function(d,i){
    var x0 = 60 + i*groupW;
    ctx.fillStyle='#336f92'; ctx.fillRect(x0, base-d.a*sc, bw, d.a*sc);
    ctx.fillStyle='#fff'; ctx.font='11px "Microsoft YaHei",sans-serif'; ctx.textAlign='center';
    ctx.fillText(d.a, x0+bw/2, base-d.a*sc+15);
    ctx.fillStyle='#7ba3bb'; ctx.fillRect(x0+bw+5, base-d.l*sc, bw, d.l*sc);
    ctx.fillStyle='#fff'; ctx.fillText(d.l, x0+bw+5+bw/2, base-d.l*sc+15);
    ctx.fillStyle='#3a7076'; ctx.fillRect(x0+2*bw+10, base-d.e*sc, bw, d.e*sc);
    ctx.fillStyle='#fff'; ctx.fillText(d.e, x0+2*bw+10+bw/2, base-d.e*sc+15);
    ctx.fillStyle='#7e96a6'; ctx.font='12px "Source Han Serif SC","Songti SC",serif';
    ctx.fillText(d.label, x0+bw+7, base+22);
  });
  ctx.textAlign='left'; ctx.font='11.5px "Microsoft YaHei",sans-serif';
  ctx.fillStyle='#336f92'; ctx.fillRect(20,14,11,11); ctx.fillStyle='#41545f'; ctx.fillText('资产',36,24);
  ctx.fillStyle='#7ba3bb'; ctx.fillRect(92,14,11,11); ctx.fillStyle='#41545f'; ctx.fillText('负债',108,24);
  ctx.fillStyle='#3a7076'; ctx.fillRect(162,14,11,11); ctx.fillStyle='#41545f'; ctx.fillText('所有者权益',178,24);
}

function drawSubjTree(){
  var p=prep(document.getElementById('subjTree')); if(!p) return;
  var ctx=p.ctx;
  box(ctx,20,80,140,52,'原材料','一级科目（总账科目）','#336f92','#336f92','#fff');
  box(ctx,220,40,160,46,'原料及主要材料','二级科目（子目）');
  box(ctx,220,110,160,46,'辅助材料','二级科目（子目）');
  box(ctx,440,26,110,40,'甲材料','明细科目');
  box(ctx,440,78,110,40,'乙材料','明细科目');
  box(ctx,440,124,110,40,'丙材料','明细科目');
  arrow(ctx,160,96,220,63); arrow(ctx,160,116,220,133);
  arrow(ctx,380,55,440,46); arrow(ctx,380,63,440,98); arrow(ctx,380,133,440,144);
  ctx.fillStyle='#7e96a6'; ctx.font='11.5px "Microsoft YaHei",sans-serif'; ctx.textAlign='left';
  ctx.fillText('财政部统一规定', 20, 152);
  ctx.fillText('企业自行设置 →', 226, 178);
}

function drawVoucherTree(){
  var p=prep(document.getElementById('voucherTree')); if(!p) return;
  var ctx=p.ctx;
  box(ctx,330,10,140,44,'会计凭证','','#336f92','#336f92','#fff');
  box(ctx,150,90,150,44,'原始凭证',''); box(ctx,500,90,150,44,'记账凭证','');
  arrow(ctx,380,54,225,90); arrow(ctx,420,54,575,90);
  box(ctx,40,175,140,40,'外来原始凭证','发票/银行回单');
  box(ctx,200,175,140,40,'自制原始凭证','领料单/入库单');
  box(ctx,410,175,90,40,'收款凭证',''); box(ctx,510,175,90,40,'付款凭证',''); box(ctx,610,175,90,40,'转账凭证','');
  arrow(ctx,195,134,110,175); arrow(ctx,255,134,270,175);
  arrow(ctx,540,134,455,175); arrow(ctx,565,134,555,175); arrow(ctx,590,134,655,175);
}

function drawCycleRing(){
  var p=prep(document.getElementById('cycleRing')); if(!p) return;
  var ctx=p.ctx, W=p.W, H=p.H;
  var cx=W/2, cy=H/2, R=104;
  var items=['① 经济业务\n取得原始凭证','② 编制\n记账凭证','③ 登记\n账簿','④ 期末\n调整分录','⑤ 试算\n平衡','⑥ 编制\n财务报表'];
  ctx.strokeStyle='#dceaf4'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.stroke();
  for(var k=0;k<6;k++){
    var a1=-Math.PI/2+k*Math.PI/3+0.42, a2=-Math.PI/2+(k+1)*Math.PI/3-0.42;
    ctx.strokeStyle='#5a97b8'; ctx.lineWidth=1.3;
    ctx.beginPath(); ctx.arc(cx,cy,R,a1,a2); ctx.stroke();
    var ea=a2;
    ctx.beginPath();
    ctx.moveTo(cx+R*Math.cos(ea), cy+R*Math.sin(ea));
    ctx.lineTo(cx+(R-6)*Math.cos(ea-0.1), cy+(R-6)*Math.sin(ea-0.1));
    ctx.lineTo(cx+(R+6)*Math.cos(ea-0.1), cy+(R+6)*Math.sin(ea-0.1));
    ctx.closePath(); ctx.fillStyle='#5a97b8'; ctx.fill();
  }
  items.forEach(function(t,i){
    var a=-Math.PI/2+i*Math.PI/3;
    var x=cx+R*Math.cos(a), y=cy+R*Math.sin(a);
    ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2);
    ctx.fillStyle='#fbfdff'; ctx.fill();
    ctx.strokeStyle='#336f92'; ctx.lineWidth=1.5; ctx.stroke();
    var lines=t.split('\n');
    ctx.textAlign='center'; ctx.font='600 12px "Source Han Serif SC","Songti SC",serif'; ctx.fillStyle='#1c2a33';
    var lx=x+Math.cos(a)*32, ly=y+Math.sin(a)*26;
    lines.forEach(function(L,li){ ctx.fillText(L, lx, ly+li*15); });
  });
  ctx.textAlign='center'; ctx.font='600 15px "Source Han Serif SC","Songti SC",serif'; ctx.fillStyle='#336f92';
  ctx.fillText('会计循环', cx, cy-4);
  ctx.font='11px "Microsoft YaHei",sans-serif'; ctx.fillStyle='#7e96a6';
  ctx.fillText('每个会计期间重复一次', cx, cy+16);
}

function drawCostFlow(){
  var p=prep(document.getElementById('costFlow')); if(!p) return;
  var ctx=p.ctx;
  box(ctx,20,26,116,40,'直接材料','','#e3eef8','#cfe2ee');
  box(ctx,20,84,116,40,'直接人工','','#e3eef8','#cfe2ee');
  box(ctx,20,142,116,40,'制造费用','','#e3eef8','#cfe2ee');
  box(ctx,220,84,130,50,'生产成本','三项归集','#336f92','#336f92','#fff');
  box(ctx,420,84,120,50,'库存商品','完工入库');
  box(ctx,600,84,150,50,'主营业务成本','销售结转');
  arrow(ctx,136,46,220,96); arrow(ctx,136,104,220,109); arrow(ctx,136,162,220,124);
  arrow(ctx,350,109,420,109); arrow(ctx,540,109,600,109);
  ctx.fillStyle='#5a97b8'; ctx.font='11px "Microsoft YaHei",sans-serif'; ctx.textAlign='center';
  ctx.fillText('期末分配', 385, 132); ctx.fillText('出售时', 570, 132);
  ctx.fillStyle='#7e96a6';
  ctx.fillText('借：生产成本 / 贷：原材料', 278, 62);
  ctx.fillText('借：库存商品 / 贷：生产成本', 480, 62);
}

function drawBS(){
  var p=prep(document.getElementById('bsChart')); if(!p) return;
  var ctx=p.ctx;
  ctx.fillStyle='#336f92'; ctx.fillRect(50,20,320,34);
  ctx.fillStyle='#3a7076'; ctx.fillRect(420,20,330,34);
  ctx.fillStyle='#fff'; ctx.font='600 14px "Source Han Serif SC","Songti SC",serif'; ctx.textAlign='center';
  ctx.fillText('资产', 210, 43); ctx.fillText('负债及所有者权益', 585, 43);
  ctx.fillStyle='#f2f8fc'; ctx.fillRect(50,54,320,64); ctx.strokeStyle='#cfe0ee'; ctx.strokeRect(50,54,320,64);
  ctx.fillStyle='#1c2a33'; ctx.font='13px "Source Han Serif SC","Songti SC",serif'; ctx.fillText('流动资产', 210, 80);
  ctx.font='11px "Microsoft YaHei",sans-serif'; ctx.fillStyle='#7e96a6'; ctx.fillText('货币资金 / 应收账款 / 存货 …', 210, 100);
  ctx.fillStyle='#f2f8fc'; ctx.fillRect(50,118,320,86); ctx.strokeStyle='#cfe0ee'; ctx.strokeRect(50,118,320,86);
  ctx.fillStyle='#1c2a33'; ctx.font='13px "Source Han Serif SC","Songti SC",serif'; ctx.fillText('非流动资产', 210, 150);
  ctx.font='11px "Microsoft YaHei",sans-serif'; ctx.fillStyle='#7e96a6'; ctx.fillText('固定资产 / 无形资产 / 长期投资 …', 210, 172);
  ctx.fillStyle='#f0f7fb'; ctx.fillRect(420,54,330,64); ctx.strokeStyle='#cfe0ee'; ctx.strokeRect(420,54,330,64);
  ctx.fillStyle='#1c2a33'; ctx.font='13px "Source Han Serif SC","Songti SC",serif'; ctx.fillText('负债', 585, 80);
  ctx.font='11px "Microsoft YaHei",sans-serif'; ctx.fillStyle='#7e96a6'; ctx.fillText('流动负债 / 非流动负债', 585, 100);
  ctx.fillStyle='#f0f7fb'; ctx.fillRect(420,118,330,86); ctx.strokeStyle='#cfe0ee'; ctx.strokeRect(420,118,330,86);
  ctx.fillStyle='#1c2a33'; ctx.font='13px "Source Han Serif SC","Songti SC",serif'; ctx.fillText('所有者权益', 585, 150);
  ctx.font='11px "Microsoft YaHei",sans-serif'; ctx.fillStyle='#7e96a6'; ctx.fillText('实收资本 / 资本公积 / 盈余公积 / 未分配利润', 585, 172);
  ctx.fillStyle='#b04a33'; ctx.font='700 28px serif'; ctx.fillText('=', 385, 140);
  ctx.fillStyle='#e3edf5'; ctx.fillRect(50,208,320,30); ctx.fillRect(420,208,330,30);
  ctx.fillStyle='#336f92'; ctx.font='600 13px "Source Han Serif SC","Songti SC",serif';
  ctx.fillText('资产总计', 210, 228); ctx.fillText('负债和所有者权益总计', 585, 228);
}

function drawComp(){
  var p=prep(document.getElementById('compCurve')); if(!p) return;
  var ctx=p.ctx, W=p.W, H=p.H;
  var pl=58, pb=42, pt=24, pr=24;
  var pw=W-pl-pr, ph=H-pt-pb;
  var P=10000, r=0.08, NY=30;
  var maxV=P*Math.pow(1+r,NY);
  ctx.strokeStyle='#e3edf5'; ctx.lineWidth=1;
  for(var g=0;g<=4;g++){ var yy=pt+ph*g/4; ctx.beginPath(); ctx.moveTo(pl,yy); ctx.lineTo(W-pr,yy); ctx.stroke(); }
  ctx.strokeStyle='#a9c2d4'; ctx.setLineDash([4,4]); ctx.lineWidth=1.2; ctx.beginPath();
  for(var y=0;y<=NY;y++){
    var v=P*(1+r*y), x=pl+pw*y/NY, Y=pt+ph-ph*Math.min(v,maxV)/maxV;
    y===0?ctx.moveTo(x,Y):ctx.lineTo(x,Y);
  }
  ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle='#336f92'; ctx.lineWidth=2; ctx.beginPath();
  for(var y2=0;y2<=NY;y2++){
    var v2=P*Math.pow(1+r,y2), x2=pl+pw*y2/NY, Y2=pt+ph-ph*v2/maxV;
    y2===0?ctx.moveTo(x2,Y2):ctx.lineTo(x2,Y2);
  }
  ctx.stroke();
  ctx.lineTo(pl+pw,pt+ph); ctx.lineTo(pl,pt+ph); ctx.closePath();
  ctx.fillStyle='rgba(51,111,146,.07)'; ctx.fill();
  ctx.strokeStyle='#cfe0ee'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(pl,pt); ctx.lineTo(pl,pt+ph); ctx.lineTo(W-pr,pt+ph); ctx.stroke();
  ctx.fillStyle='#7e96a6'; ctx.font='11px "Microsoft YaHei",sans-serif'; ctx.textAlign='center';
  for(var k=0;k<=NY;k+=5) ctx.fillText(k+'年', pl+pw*k/NY, pt+ph+18);
  ctx.textAlign='right';
  ctx.fillText('¥'+Math.round(maxV/10000)+'万', pl-8, pt+10);
  ctx.fillText('¥1万', pl-8, pt+ph+4);
  ctx.textAlign='left';
  ctx.strokeStyle='#336f92'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W-200,pt+6); ctx.lineTo(W-176,pt+6); ctx.stroke();
  ctx.fillStyle='#41545f'; ctx.font='11px "Microsoft YaHei",sans-serif'; ctx.fillText('复利', W-170, pt+10);
  ctx.strokeStyle='#a9c2d4'; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(W-120,pt+6); ctx.lineTo(W-96,pt+6); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='#41545f'; ctx.fillText('单利', W-90, pt+10);
  ctx.fillStyle='#b04a33'; ctx.beginPath(); ctx.arc(pl+pw, pt+ph-ph*maxV/maxV, 3.5,0,7); ctx.fill();
  ctx.textAlign='right'; ctx.fillStyle='#336f92'; ctx.font='600 12px "Source Han Serif SC","Songti SC",serif';
  ctx.fillText('30年 ¥'+Math.round(maxV).toLocaleString(), pl+pw-8, pt+ph-ph*maxV/maxV-10);
}

function drawSML(){
  var p=prep(document.getElementById('smlChart')); if(!p) return;
  var ctx=p.ctx, W=p.W, H=p.H;
  var pl=62, pb=44, pt=26, pr=30;
  var pw=W-pl-pr, ph=H-pt-pb;
  var rf=3, rm=10, maxB=2.0, maxR=20;
  function X(b){ return pl+pw*b/maxB; }
  function Y(r){ return pt+ph-ph*r/maxR; }
  ctx.strokeStyle='#e3edf5';
  for(var g=0;g<=4;g++){ var yy=pt+ph*g/4; ctx.beginPath(); ctx.moveTo(pl,yy); ctx.lineTo(W-pr,yy); ctx.stroke(); }
  ctx.strokeStyle='#cfe0ee'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(pl,pt); ctx.lineTo(pl,pt+ph); ctx.lineTo(W-pr,pt+ph); ctx.stroke();
  ctx.strokeStyle='#3a7076'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(X(0),Y(rf)); ctx.lineTo(X(maxB),Y(rf+maxB*(rm-rf))); ctx.stroke();
  ctx.fillStyle='#b04a33'; ctx.beginPath(); ctx.arc(X(0),Y(rf),4,0,7); ctx.fill();
  ctx.fillStyle='#336f92'; ctx.beginPath(); ctx.arc(X(1),Y(rm),4,0,7); ctx.fill();
  ctx.fillStyle='#41545f'; ctx.font='11.5px "Microsoft YaHei",sans-serif'; ctx.textAlign='left';
  ctx.fillText('Rf='+rf+'%', X(0)+8, Y(rf)-8);
  ctx.fillText('市场组合 β=1, Rm='+rm+'%', X(1)+8, Y(rm)-8);
  var br=1.2, rr=rf+br*(rm-rf);
  ctx.strokeStyle='#b04a33'; ctx.setLineDash([3,3]); ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(X(br),pt+ph); ctx.lineTo(X(br),Y(rr)); ctx.lineTo(pl,Y(rr)); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='#b04a33'; ctx.beginPath(); ctx.arc(X(br),Y(rr),3.5,0,7); ctx.fill();
  ctx.font='600 11.5px "Microsoft YaHei",sans-serif';
  ctx.fillText('β=1.2 → '+rr.toFixed(1)+'%', X(br)+8, Y(rr)+16);
  ctx.fillStyle='#7e96a6'; ctx.font='11.5px "Microsoft YaHei",sans-serif'; ctx.textAlign='center';
  [0,0.5,1,1.5,2].forEach(function(b){ ctx.fillText('β='+b, X(b), pt+ph+18); });
  ctx.fillText('系统性风险 β', W/2, H-8);
  ctx.save(); ctx.translate(16,H/2); ctx.rotate(-Math.PI/2);
  ctx.fillText('预期收益率 E(R)', 0, 0); ctx.restore();
}

function drawNPV(){
  var p=prep(document.getElementById('npvCurve')); if(!p) return;
  var ctx=p.ctx, W=p.W, H=p.H;
  var pl=72, pb=44, pt=26, pr=30;
  var pw=W-pl-pr, ph=H-pt-pb;
  var inv=1000000, cf=280000, n=6, maxR=0.30;
  var pts=[], maxV=-1e9, minV=1e9;
  for(var rr=0; rr<=maxR+0.001; rr+=0.01){
    var pv=0; for(var t=1;t<=n;t++) pv+=cf/Math.pow(1+rr,t);
    var v=pv-inv; pts.push({r:rr,v:v});
    if(v>maxV) maxV=v; if(v<minV) minV=v;
  }
  var range=maxV-minV;
  function X(r){ return pl+pw*r/maxR; }
  function Y(v){ return pt+ph*0.1+ph*0.85*(maxV-v)/range; }
  ctx.strokeStyle='#a9c2d4'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(pl,Y(0)); ctx.lineTo(W-pr,Y(0)); ctx.stroke();
  ctx.strokeStyle='#3a7076'; ctx.lineWidth=2; ctx.beginPath();
  pts.forEach(function(p2,i){ i===0?ctx.moveTo(X(p2.r),Y(p2.v)):ctx.lineTo(X(p2.r),Y(p2.v)); });
  ctx.stroke();
  var irr=0;
  for(var i=1;i<pts.length;i++){
    if(pts[i-1].v>0 && pts[i].v<=0){ irr=pts[i-1].r+(pts[i].r-pts[i-1].r)*pts[i-1].v/(pts[i-1].v-pts[i].v); break; }
  }
  ctx.fillStyle='#b04a33'; ctx.beginPath(); ctx.arc(X(irr),Y(0),4,0,7); ctx.fill();
  ctx.fillStyle='#b04a33'; ctx.font='600 12px "Source Han Serif SC","Songti SC",serif'; ctx.textAlign='center';
  ctx.fillText('IRR ≈ '+(irr*100).toFixed(1)+'%', X(irr), Y(0)+22);
  var v10=0; for(var t2=1;t2<=n;t2++) v10+=cf/Math.pow(1.10,t2); v10-=inv;
  if(v10>0){
    ctx.strokeStyle='#336f92'; ctx.setLineDash([3,3]); ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(X(0.10),Y(0)); ctx.lineTo(X(0.10),Y(v10)); ctx.lineTo(pl,Y(v10)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='#336f92'; ctx.beginPath(); ctx.arc(X(0.10),Y(v10),3.5,0,7); ctx.fill();
    ctx.textAlign='left'; ctx.font='11.5px "Microsoft YaHei",sans-serif';
    ctx.fillText('10% 时 NPV='+Math.round(v10).toLocaleString(), X(0.10)+8, Y(v10)-6);
  }
  ctx.strokeStyle='#cfe0ee'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(pl,pt); ctx.lineTo(pl,pt+ph); ctx.lineTo(W-pr,pt+ph); ctx.stroke();
  ctx.fillStyle='#7e96a6'; ctx.font='11.5px "Microsoft YaHei",sans-serif'; ctx.textAlign='center';
  [0,0.1,0.2,0.3].forEach(function(r){ ctx.fillText((r*100)+'%', X(r), pt+ph+18); });
  ctx.fillText('折现率', W/2, H-8);
  ctx.save(); ctx.translate(18,H/2); ctx.rotate(-Math.PI/2); ctx.fillText('NPV（元）',0,0); ctx.restore();
}

function drawWACC(){
  var p=prep(document.getElementById('waccCurve')); if(!p) return;
  var ctx=p.ctx, W=p.W, H=p.H;
  var pl=64, pb=44, pt=26, pr=30;
  var pw=W-pl-pr, ph=H-pt-pb;
  var T=0.25, ke0=11.5, kd0=5.5;
  var pts=[];
  for(var wd=0; wd<=0.85; wd+=0.02){
    var kd=kd0+6*Math.pow(wd,2.4), ke=ke0+5*Math.pow(wd,2.0);
    pts.push({w:wd, v:wd*kd*(1-T)+(1-wd)*ke});
  }
  var minV=99, maxV=0, minW=0;
  pts.forEach(function(q){ if(q.v<minV){minV=q.v; minW=q.w;} if(q.v>maxV) maxV=q.v; });
  var rng=maxV-minV;
  function X(w){ return pl+pw*w/0.85; }
  function Y(v){ return pt+ph*0.08+ph*0.84*(v-minV)/rng; }
  ctx.strokeStyle='#e3edf5';
  for(var g=0;g<=4;g++){ var yy=pt+ph*g/4; ctx.beginPath(); ctx.moveTo(pl,yy); ctx.lineTo(W-pr,yy); ctx.stroke(); }
  ctx.strokeStyle='#3a7076'; ctx.lineWidth=2; ctx.beginPath();
  pts.forEach(function(q,i){ i===0?ctx.moveTo(X(q.w),Y(q.v)):ctx.lineTo(X(q.w),Y(q.v)); });
  ctx.stroke();
  ctx.strokeStyle='#b04a33'; ctx.setLineDash([3,3]); ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(X(minW),pt+ph); ctx.lineTo(X(minW),Y(minV)); ctx.lineTo(pl,Y(minV)); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='#b04a33'; ctx.beginPath(); ctx.arc(X(minW),Y(minV),4,0,7); ctx.fill();
  ctx.font='600 12px "Source Han Serif SC","Songti SC",serif'; ctx.textAlign='left';
  ctx.fillText('最优负债率 ≈ '+Math.round(minW*100)+'%　WACC ≈ '+(minV*100).toFixed(2)+'%', X(minW)+10, Y(minV)-8);
  ctx.strokeStyle='#cfe0ee'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(pl,pt); ctx.lineTo(pl,pt+ph); ctx.lineTo(W-pr,pt+ph); ctx.stroke();
  ctx.fillStyle='#7e96a6'; ctx.font='11.5px "Microsoft YaHei",sans-serif'; ctx.textAlign='center';
  [0,0.2,0.4,0.6,0.8].forEach(function(w){ ctx.fillText(Math.round(w*100)+'%', X(w), pt+ph+18); });
  ctx.fillText('负债占比 Wd', W/2, H-8);
  ctx.save(); ctx.translate(18,H/2); ctx.rotate(-Math.PI/2); ctx.fillText('WACC',0,0); ctx.restore();
}

function drawDupont(){
  var p=prep(document.getElementById('dupontTree')); if(!p) return;
  var ctx=p.ctx;
  box(ctx,320,10,160,44,'ROE 净资产收益率','最终目标','#3a7076','#3a7076','#fff');
  box(ctx,40,110,150,46,'净利率','盈利能力');
  box(ctx,250,110,140,46,'总资产周转率','营运效率');
  box(ctx,470,110,150,46,'权益乘数','财务杠杆');
  arrow(ctx,400,54,120,110,'#3a7076'); arrow(ctx,400,54,320,110,'#3a7076'); arrow(ctx,400,54,545,110,'#3a7076');
  box(ctx,20,210,100,42,'净利润','','#e3efef','#cfe0ee');
  box(ctx,130,210,100,42,'营业收入','','#e3efef','#cfe0ee');
  box(ctx,250,210,100,42,'营业收入','','#e3efef','#cfe0ee');
  box(ctx,360,210,100,42,'总资产','','#e3efef','#cfe0ee');
  box(ctx,480,210,100,42,'总资产','','#e3efef','#cfe0ee');
  box(ctx,590,210,100,42,'所有者权益','','#e3efef','#cfe0ee');
  arrow(ctx,90,156,72,210); arrow(ctx,140,156,172,210);
  arrow(ctx,300,156,300,210); arrow(ctx,340,156,400,210);
  arrow(ctx,510,156,530,210); arrow(ctx,560,156,635,210);
  ctx.fillStyle='#7e96a6'; ctx.font='11px "Microsoft YaHei",sans-serif'; ctx.textAlign='center';
  ctx.fillText('÷', 122, 200); ctx.fillText('÷', 360, 200); ctx.fillText('÷', 572, 200);
  ctx.fillStyle='#b04a33'; ctx.font='600 11.5px "Microsoft YaHei",sans-serif';
  ctx.fillText('×           ×', 400, 96);
}

/* ---------- 金融站新增图表（批1） ---------- */
function _axes(ctx, W, H, pad){
  ctx.strokeStyle='#cfe0ee'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(pad, H-pad); ctx.lineTo(W-pad+10, H-pad); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(pad, pad-10); ctx.lineTo(pad, H-pad); ctx.stroke();
  ctx.fillStyle='#7e96a6'; ctx.font='11px "Microsoft YaHei",sans-serif';
  ctx.textAlign='right'; ctx.fillText('0', pad-6, H-pad+4);
}
function drawInflaErode(){
  var p=prep(document.getElementById('inflaErode')); if(!p) return;
  var ctx=p.ctx, W=p.W, H=p.H, pad=54;
  _axes(ctx,W,H,pad);
  var years=[0,5,10,15,20,25,30], rate=0.03;
  var bw=44, gap=(W-pad*2-40-years.length*bw)/(years.length-1);
  ctx.textAlign='center';
  years.forEach(function(y,i){
    var v=100/Math.pow(1+rate,y), h=(v/100)*(H-pad*2-24);
    var x=pad+14+i*(bw+gap);
    ctx.fillStyle = i===years.length-1 ? '#b04a33' : '#5a97b8';
    ctx.fillRect(x, H-pad-h, bw, h);
    ctx.fillStyle='#41545f'; ctx.font='11px "Microsoft YaHei",sans-serif';
    ctx.fillText(Math.round(v), x+bw/2, H-pad-h-7);
    ctx.fillStyle='#7e96a6'; ctx.fillText(y+'年', x+bw/2, H-pad+18);
  });
  ctx.fillStyle='#1c2a33'; ctx.textAlign='left';
  ctx.font='600 12px "Source Han Serif SC","Songti SC",serif';
  ctx.fillText('100 元购买力（假设通胀率 3%）', pad, 24);
  ctx.fillStyle='#7e96a6'; ctx.font='11px "Microsoft YaHei",sans-serif';
  ctx.fillText('简化示意，非实际物价数据', pad, 42);
}
function drawCompoundCurve(){
  var p=prep(document.getElementById('compoundCurve')); if(!p) return;
  var ctx=p.ctx, W=p.W, H=p.H, pad=56;
  _axes(ctx,W,H,pad);
  var maxV=650, r=0.06;
  function yy(v){ return H-pad-(v/maxV)*(H-pad*2-20); }
  [[100,'#336f92','本金 100'],[10,'#b04a33','本金 10']].forEach(function(s){
    ctx.strokeStyle=s[1]; ctx.lineWidth=2; ctx.beginPath();
    for(var y=0;y<=30;y++){
      var v=s[0]*Math.pow(1+r,y), x=pad+(y/30)*(W-pad*2-20);
      if(y===0) ctx.moveTo(x,yy(v)); else ctx.lineTo(x,yy(v));
    }
    ctx.stroke();
    var ex=pad+(30/30)*(W-pad*2-20), ev=s[0]*Math.pow(1+r,30);
    ctx.fillStyle=s[1]; ctx.textAlign='right'; ctx.font='11px "Microsoft YaHei",sans-serif';
    ctx.fillText(s[2]+' → '+Math.round(ev), ex, yy(ev)-8);
  });
  ctx.textAlign='center'; ctx.fillStyle='#7e96a6'; ctx.font='11px "Microsoft YaHei",sans-serif';
  [0,10,20,30].forEach(function(y){
    var x=pad+(y/30)*(W-pad*2-20);
    ctx.fillText(y+'年', x, H-pad+18);
  });
  ctx.textAlign='left'; ctx.fillStyle='#1c2a33';
  ctx.font='600 12px "Source Han Serif SC","Songti SC",serif';
  ctx.fillText('同样的收益率，本金越大差距越大（假设年化 6%）', pad, 24);
}
function drawCashflow3(){
  var p=prep(document.getElementById('cashflow3')); if(!p) return;
  var ctx=p.ctx, W=p.W, H=p.H, pad=60;
  _axes(ctx,W,H,pad);
  var groups=[
    {n:'经营活动',inflow:120,outflow:85},
    {n:'投资活动',inflow:30,outflow:70},
    {n:'筹资活动',inflow:50,outflow:40}
  ];
  var maxV=130, sc=(H-pad*2-30)/maxV, gw=(W-pad*2-20)/3;
  ctx.textAlign='center';
  groups.forEach(function(g,i){
    var x0=pad+18+i*gw, bw=38;
    var hi=g.inflow*sc, ho=g.outflow*sc;
    ctx.fillStyle='#336f92'; ctx.fillRect(x0+gw/2-bw-4, H-pad-hi, bw, hi);
    ctx.fillStyle='#b04a33'; ctx.fillRect(x0+gw/2+4, H-pad-ho, bw, ho);
    ctx.fillStyle='#41545f'; ctx.font='12px "Source Han Serif SC","Songti SC",serif';
    ctx.fillText(g.n, x0+gw/2, H-pad+20);
    ctx.fillStyle='#7e96a6'; ctx.font='11px "Microsoft YaHei",sans-serif';
    ctx.fillText(g.inflow+' / '+g.outflow, x0+gw/2, H-pad+38);
  });
  ctx.textAlign='left'; ctx.fillStyle='#336f92'; ctx.fillRect(pad,16,11,11);
  ctx.fillStyle='#41545f'; ctx.font='11.5px "Microsoft YaHei",sans-serif'; ctx.fillText('流入',pad+17,26);
  ctx.fillStyle='#b04a33'; ctx.fillRect(pad+80,16,11,11);
  ctx.fillStyle='#41545f'; ctx.fillText('流出',pad+97,26);
}

function drawHomeCurve(){
  var p=prep(document.getElementById('homeCurve')); if(!p) return;
  var ctx=p.ctx, W=p.W, H=p.H, pad=56;
  _axes(ctx,W,H,pad);
  var maxV=650, r=0.06;
  function yy(v){ return H-pad-(v/maxV)*(H-pad*2-20); }
  [[100,'#336f92'],[10,'#b04a33']].forEach(function(s){
    ctx.strokeStyle=s[1]; ctx.lineWidth=2; ctx.beginPath();
    for(var y=0;y<=30;y++){
      var v=s[0]*Math.pow(1+r,y), x=pad+(y/30)*(W-pad*2-20);
      if(y===0) ctx.moveTo(x,yy(v)); else ctx.lineTo(x,yy(v));
    }
    ctx.stroke();
  });
  ctx.textAlign='center'; ctx.fillStyle='#7e96a6'; ctx.font='11px "Microsoft YaHei",sans-serif';
  [0,10,20,30].forEach(function(y){
    ctx.fillText(y+'年', pad+(y/30)*(W-pad*2-20), H-pad+18);
  });
}

/* ---------- 批2-4 新增图表 ---------- */
function _poly(ctx, pts, stroke, fill){
  if(!pts.length) return;
  ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]);
  for(var i=1;i<pts.length;i++) ctx.lineTo(pts[i][0],pts[i][1]);
  ctx.closePath();
  if(fill){ ctx.fillStyle=fill; ctx.fill(); }
  if(stroke){ ctx.strokeStyle=stroke; ctx.lineWidth=1.6; ctx.stroke(); }
}
function drawRatioRadar(){
  var p=prep(document.getElementById('ratioRadar')); if(!p) return;
  var ctx=p.ctx,W=p.W,H=p.H,cx=W/2,cy=H/2+6,R=100;
  var labels=['盈利','成长','营运','偿债','现金流'];
  var a=[0.75,0.55,0.80,0.65,0.70], b=[0.60,0.50,0.62,0.60,0.58];
  var n=5;
  ctx.strokeStyle='#dfeaf3';ctx.lineWidth=1;
  [0.25,0.5,0.75,1].forEach(function(t){
    ctx.beginPath();
    for(var i=0;i<n;i++){
      var ang=-Math.PI/2+i*2*Math.PI/n, x=cx+R*t*Math.cos(ang), y=cy+R*t*Math.sin(ang);
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.closePath();ctx.stroke();
  });
  for(var i=0;i<n;i++){
    var ang=-Math.PI/2+i*2*Math.PI/n;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+R*Math.cos(ang),cy+R*Math.sin(ang));ctx.stroke();
    ctx.fillStyle='#7e96a6';ctx.font='12px "Source Han Serif SC","Songti SC",serif';ctx.textAlign='center';
    ctx.fillText(labels[i],cx+(R+24)*Math.cos(ang),cy+(R+24)*Math.sin(ang)+4);
  }
  [ [b,'#7ba3bb','rgba(123,163,187,.16)'], [a,'#b04a33','rgba(176,74,51,.13)'] ].forEach(function(s){
    var pts=[];
    for(var i=0;i<n;i++){
      var ang=-Math.PI/2+i*2*Math.PI/n;
      pts.push([cx+R*s[0][i]*Math.cos(ang),cy+R*s[0][i]*Math.sin(ang)]);
    }
    _poly(ctx,pts,s[1],s[2]);
  });
  ctx.textAlign='left';ctx.fillStyle='#336f92';ctx.fillRect(28,20,11,11);
  ctx.fillStyle='#41545f';ctx.font='11px "Microsoft YaHei",sans-serif';ctx.fillText('甲公司',44,29);
  ctx.fillStyle='#7ba3bb';ctx.fillRect(112,20,11,11);
  ctx.fillStyle='#41545f';ctx.fillText('行业参照',128,29);
}
function drawAnnuityTL(){
  var p=prep(document.getElementById('annuityTL')); if(!p) return;
  var ctx=p.ctx,W=p.W,H=p.H,pad=70,y=110;
  var n=5,step=(W-pad*2-20)/n;
  ctx.strokeStyle='#cfe0ee';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(W-pad+20,y);ctx.stroke();
  for(var i=0;i<=n;i++){
    var x=pad+i*step;
    ctx.beginPath();ctx.moveTo(x,y-7);ctx.lineTo(x,y+7);ctx.stroke();
    ctx.fillStyle='#7e96a6';ctx.font='12px "Microsoft YaHei",sans-serif';ctx.textAlign='center';
    ctx.fillText('第'+i+'期末',x,y+26);
    if(i>0){ ctx.fillStyle='#336f92';ctx.font='600 14px "Source Han Serif SC","Songti SC",serif';ctx.fillText('100',x,y-14); }
  }
  ctx.strokeStyle='#b04a33';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);
  ctx.strokeRect(pad,y+46,step*n,30);ctx.setLineDash([]);
  ctx.fillStyle='#b04a33';ctx.font='12px "Microsoft YaHei",sans-serif';
  ctx.fillText('每期期末等额收付 A = 100（假设数据）',pad+step*n/2,y+66);
}
function drawDcfSens(){
  var p=prep(document.getElementById('dcfSens')); if(!p) return;
  var ctx=p.ctx,W=p.W,H=p.H,pad=90;
  var gs=[0.01,0.02,0.03], rs=[0.07,0.09,0.11];
  var cw=(W-pad*2-20)/3,ch=(H-pad-56)/3;
  ctx.textAlign='center';ctx.font='11px "Microsoft YaHei",sans-serif';ctx.fillStyle='#7e96a6';
  gs.forEach(function(g,i){ ctx.fillText('g='+(g*100).toFixed(0)+'%',pad+cw*i+cw/2,pad-14); });
  rs.forEach(function(r,i){ ctx.fillText('r='+(r*100).toFixed(0)+'%',pad-12,pad+ch*i+ch/2+4); });
  rs.forEach(function(r,i){
    gs.forEach(function(g,j){
      var v=100*(1+g)/(r-g);
      var alpha=Math.max(0.06,Math.min(0.34,(v-100)/1600));
      ctx.fillStyle='rgba(51,111,146,'+alpha.toFixed(2)+')';
      ctx.fillRect(pad+cw*j+3,pad+ch*i+3,cw-6,ch-6);
      ctx.fillStyle='#1c2a33';ctx.font='600 13px "Source Han Serif SC","Songti SC",serif';
      ctx.fillText(Math.round(v),pad+cw*j+cw/2,pad+ch*i+ch/2+5);
    });
  });
  ctx.textAlign='left';ctx.fillStyle='#7e96a6';ctx.font='11px "Microsoft YaHei",sans-serif';
  ctx.fillText('V = D1 ÷ (r − g)　单位：元，假设 D0 = 100；必须 g < r',pad,H-16);
}
function drawPeBand(){
  var p=prep(document.getElementById('peBand')); if(!p) return;
  var ctx=p.ctx,W=p.W,H=p.H,pad=58;
  _axes(ctx,W,H,pad);
  var hi=[22,24,21,26,25,28,27,30], mid=[16,17,16,18,18,19,19,20], lo=[11,12,11,12,13,13,14,14];
  function yy(v){ return H-pad-(v/34)*(H-pad*2-24); }
  function xx(i){ return pad+16+i*(W-pad*2-32)/7; }
  function line(arr,color,w){ ctx.strokeStyle=color;ctx.lineWidth=w;ctx.beginPath();arr.forEach(function(v,i){ if(i===0)ctx.moveTo(xx(i),yy(v));else ctx.lineTo(xx(i),yy(v)); });ctx.stroke(); }
  ctx.fillStyle='rgba(51,111,146,.08)';
  ctx.beginPath();
  hi.forEach(function(v,i){ if(i===0)ctx.moveTo(xx(i),yy(v));else ctx.lineTo(xx(i),yy(v)); });
  for(var i=lo.length-1;i>=0;i--) ctx.lineTo(xx(i),yy(lo[i]));
  ctx.closePath();ctx.fill();
  line(hi,'#7ba3bb',1);line(mid,'#336f92',2);line(lo,'#7ba3bb',1);
  ctx.fillStyle='#7e96a6';ctx.font='11px "Microsoft YaHei",sans-serif';ctx.textAlign='center';
  [0,3,7].forEach(function(i){ ctx.fillText('第'+(i+1)+'期',xx(i),H-pad+18); });
  ctx.textAlign='left';ctx.fillStyle='#1c2a33';ctx.font='600 12px "Source Han Serif SC","Songti SC",serif';
  ctx.fillText('相对估值带（假设市盈率高/中/低分位）',pad,24);
}
function drawDiversify(){
  var p=prep(document.getElementById('diversify')); if(!p) return;
  var ctx=p.ctx,W=p.W,H=p.H,pad=58;
  _axes(ctx,W,H,pad);
  ctx.strokeStyle='#336f92';ctx.lineWidth=2;ctx.beginPath();
  for(var n=1;n<=30;n++){
    var risk=18+22/Math.sqrt(n);
    var x=pad+(n-1)/29*(W-pad*2-20), y=H-pad-(risk/45)*(H-pad*2-20);
    if(n===1)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.stroke();
  ctx.strokeStyle='#b04a33';ctx.setLineDash([5,5]);ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(pad,H-pad-(18/45)*(H-pad*2-20));ctx.lineTo(W-pad-20,H-pad-(18/45)*(H-pad*2-20));ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#7e96a6';ctx.font='11px "Microsoft YaHei",sans-serif';ctx.textAlign='center';
  [1,5,10,20,30].forEach(function(n){ ctx.fillText(n+'只',pad+(n-1)/29*(W-pad*2-20),H-pad+18); });
  ctx.textAlign='left';ctx.fillStyle='#41545f';ctx.font='11.5px "Microsoft YaHei",sans-serif';
  ctx.fillText('虚线为不可分散的系统性风险下限',pad,24);
}
function drawFrontCap(){
  var p=prep(document.getElementById('frontCap')); if(!p) return;
  var ctx=p.ctx,W=p.W,H=p.H,pad=58;
  _axes(ctx,W,H,pad);
  function xx(s){ return pad+s/28*(W-pad*2-20); }
  function yy(r){ return H-pad-(r/20)*(H-pad*2-20); }
  ctx.strokeStyle='#336f92';ctx.lineWidth=2;ctx.beginPath();
  for(var s=2;s<=26;s++){
    var r=3+0.038*Math.pow(s-2,1.55);
    if(s===2)ctx.moveTo(xx(s),yy(r));else ctx.lineTo(xx(s),yy(r));
  }
  ctx.stroke();
  ctx.strokeStyle='#b04a33';ctx.lineWidth=1.5;ctx.beginPath();
  ctx.moveTo(pad,yy(2));ctx.lineTo(xx(26),yy(2+0.62*26));ctx.stroke();
  ctx.beginPath();ctx.arc(xx(14),yy(2+0.62*14),5,0,Math.PI*2);ctx.fillStyle='#b04a33';ctx.fill();
  ctx.fillStyle='#7e96a6';ctx.font='11px "Microsoft YaHei",sans-serif';ctx.textAlign='center';
  ctx.fillText('市场组合',xx(14),yy(2+0.62*14)-12);
  ctx.textAlign='left';ctx.fillStyle='#336f92';ctx.fillText('有效前沿',pad+40,H-pad-46);
  ctx.fillStyle='#b04a33';ctx.fillText('资本市场线 CML',pad+210,H-pad-16);
}
function drawAllocRing(){
  var p=prep(document.getElementById('allocRing')); if(!p) return;
  var ctx=p.ctx,W=p.W,H=p.H,cx=W/2,cy=H/2,R=96;
  var parts=[{v:0.6,c:'#336f92',n:'权益 60%'},{v:0.4,c:'#3a7076',n:'债券 40%'}];
  var a0=-Math.PI/2;
  parts.forEach(function(t){
    var a1=a0+t.v*Math.PI*2;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R,a0,a1);ctx.closePath();
    ctx.fillStyle=t.c;ctx.fill();a0=a1;
  });
  ctx.beginPath();ctx.arc(cx,cy,52,0,Math.PI*2);ctx.fillStyle='#fbfdff';ctx.fill();
  ctx.textAlign='center';ctx.fillStyle='#1c2a33';ctx.font='600 14px "Source Han Serif SC","Songti SC",serif';
  ctx.fillText('股债平衡',cx,cy-2);ctx.font='11px "Microsoft YaHei",sans-serif';ctx.fillStyle='#7e96a6';
  ctx.fillText('假设画像',cx,cy+16);
  ctx.fillStyle='#336f92';ctx.fillRect(30,22,11,11);ctx.fillStyle='#41545f';ctx.font='11.5px "Microsoft YaHei",sans-serif';ctx.textAlign='left';ctx.fillText('权益',46,31);
  ctx.fillStyle='#3a7076';ctx.fillRect(106,22,11,11);ctx.fillStyle='#41545f';ctx.fillText('债券',122,31);
}
function drawBondYield(){
  var p=prep(document.getElementById('bondYield')); if(!p) return;
  var ctx=p.ctx,W=p.W,H=p.H,pad=58;_axes(ctx,W,H,pad);
  function xx(y){ return pad+16+(y-0.01)/0.09*(W-pad*2-32); }
  function yy(price){ return H-pad-(price-70)/60*(H-pad*2-20); }
  ctx.strokeStyle='#336f92';ctx.lineWidth=2;ctx.beginPath();
  for(var y=0.01;y<=0.10;y+=0.001){
    var price=100*Math.pow(1.05,5)/(Math.pow(1+y,5));
    if(y<=0.0101)ctx.moveTo(xx(y),yy(price));else ctx.lineTo(xx(y),yy(price));
  }
  ctx.stroke();
  ctx.fillStyle='#7e96a6';ctx.font='11px "Microsoft YaHei",sans-serif';ctx.textAlign='center';
  [0.02,0.05,0.08,0.10].forEach(function(v){ ctx.fillText((v*100).toFixed(0)+'%',xx(v),H-pad+18); });
  ctx.textAlign='left';ctx.fillStyle='#1c2a33';ctx.font='600 12px "Source Han Serif SC","Songti SC",serif';
  ctx.fillText('债券价格与到期收益率反向变动，且曲线凸向原点',pad,24);
}
function drawRebalBand(){
  var p=prep(document.getElementById('rebalBand')); if(!p) return;
  var ctx=p.ctx,W=p.W,H=p.H,pad=64;
  var y=96, x0=pad, x1=W-pad-20;
  ctx.fillStyle='#e3eef8';ctx.fillRect(x0,y-28,x1-x0,56);
  ctx.fillStyle='#e3efef';ctx.fillRect(x0,y-16,x1-x0,32);
  ctx.strokeStyle='#b04a33';ctx.setLineDash([5,5]);ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(x0,y-28);ctx.lineTo(x1,y-28);ctx.moveTo(x0,y+28);ctx.lineTo(x1,y+28);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle='#336f92';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();
  ctx.fillStyle='#7e96a6';ctx.font='11px "Microsoft YaHei",sans-serif';ctx.textAlign='left';
  ctx.fillText('触发下沿 55%',x0,y-36);ctx.fillText('目标 60%',x0,y-6);ctx.fillText('触发上沿 65%',x0,y+46);
  ctx.fillStyle='#b04a33';ctx.beginPath();ctx.arc(x0+(x1-x0)*0.72,y+24,5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#41545f';ctx.textAlign='center';ctx.fillText('触及上沿 → 卖出部分权益',x0+(x1-x0)*0.72,y+62);
}
function drawGdpCycle(){
  var p=prep(document.getElementById('gdpCycle')); if(!p) return;
  var ctx=p.ctx,W=p.W,H=p.H,pad=58;_axes(ctx,W,H,pad);
  ctx.strokeStyle='#7ba3bb';ctx.setLineDash([5,4]);ctx.lineWidth=1;ctx.beginPath();
  ctx.moveTo(pad,H-pad-70);ctx.lineTo(W-pad-20,H-pad-70);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle='#336f92';ctx.lineWidth=2;ctx.beginPath();
  for(var i=0;i<=100;i++){
    var v=6+2.4*Math.sin(i/100*Math.PI*4);
    var x=pad+i/100*(W-pad*2-20), y=H-pad-(v/12)*(H-pad*2-20);
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.stroke();
  ctx.fillStyle='#7e96a6';ctx.font='11px "Microsoft YaHei",sans-serif';ctx.textAlign='center';
  ctx.fillText('衰退',pad+100,H-pad-92);ctx.fillText('复苏',pad+300,H-pad-52);ctx.fillText('过热',pad+520,H-pad-92);
}
function drawSdShift(){
  var p=prep(document.getElementById('sdShift')); if(!p) return;
  var ctx=p.ctx,W=p.W,H=p.H,pad=58;_axes(ctx,W,H,pad);
  function xx(q){ return pad+40+q/12*(W-pad*2-70); }
  function yy(price){ return H-pad-(price/14)*(H-pad*2-20); }
  ctx.strokeStyle='#336f92';ctx.lineWidth=2;ctx.beginPath();
  ctx.moveTo(xx(1),yy(12));ctx.lineTo(xx(11),yy(2));ctx.stroke();
  ctx.strokeStyle='#3a7076';ctx.beginPath();
  ctx.moveTo(xx(1),yy(2));ctx.lineTo(xx(11),yy(12));ctx.stroke();
  ctx.strokeStyle='#b04a33';ctx.setLineDash([5,4]);ctx.beginPath();
  ctx.moveTo(xx(3),yy(2));ctx.lineTo(xx(13),yy(12));ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#7e96a6';ctx.font='11px "Microsoft YaHei",sans-serif';ctx.textAlign='left';
  ctx.fillText('需求右移 → 价量齐升',pad+30,26);
  ctx.fillText('D',W-pad-30,yy(3));ctx.fillText('S',W-pad-30,yy(11));
}
function drawOptPayoff(){
  var p=prep(document.getElementById('optPayoff')); if(!p) return;
  var ctx=p.ctx,W=p.W,H=p.H,pad=58;_axes(ctx,W,H,pad);
  function xx(s){ return pad+30+(s+10)/40*(W-pad*2-50); }
  function yy(v){ return H-pad-(v+10)/30*(H-pad*2-20); }
  ctx.strokeStyle='#cfe0ee';ctx.setLineDash([4,4]);ctx.beginPath();
  ctx.moveTo(xx(0),pad);ctx.lineTo(xx(0),H-pad);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle='#b04a33';ctx.lineWidth=2;ctx.beginPath();
  ctx.moveTo(xx(-10),yy(-10));ctx.lineTo(xx(10),yy(-10));ctx.lineTo(xx(30),yy(10));ctx.stroke();
  ctx.fillStyle='#7e96a6';ctx.font='11px "Microsoft YaHei",sans-serif';ctx.textAlign='center';
  ctx.fillText('行权价 K',xx(10),H-pad+18);
  ctx.textAlign='left';ctx.fillStyle='#1c2a33';ctx.font='600 12px "Source Han Serif SC","Songti SC",serif';
  ctx.fillText('看涨期权到期收益：max(S − K, 0)（未扣权利金）',pad,24);
}
function drawProspect(){
  var p=prep(document.getElementById('prospect')); if(!p) return;
  var ctx=p.ctx,W=p.W,H=p.H,pad=58;_axes(ctx,W,H,pad);
  var cx=W/2, cy=H/2+10;
  ctx.strokeStyle='#cfe0ee';ctx.beginPath();ctx.moveTo(pad,cy);ctx.lineTo(W-pad-20,cy);ctx.stroke();
  ctx.strokeStyle='#336f92';ctx.lineWidth=2;ctx.beginPath();
  for(var x=-10;x<=10;x++){
    var v=x>=0 ? 12*(1-Math.exp(-x/5)) : -24*(1-Math.exp(x/4));
    var px=cx+x/10*(W/2-pad-20), py=cy-v/30*(H/2-pad-10);
    if(x===-10)ctx.moveTo(px,py);else ctx.lineTo(px,py);
  }
  ctx.stroke();
  ctx.fillStyle='#7e96a6';ctx.font='11px "Microsoft YaHei",sans-serif';ctx.textAlign='center';
  ctx.fillText('损失区（更陡）',cx-150,cy+52);ctx.fillText('收益区（更缓）',cx+150,cy-38);
  ctx.textAlign='left';ctx.fillStyle='#1c2a33';ctx.font='600 12px "Source Han Serif SC","Songti SC",serif';
  ctx.fillText('前景理论价值函数：同等金额下，损失的痛感大于收益的愉悦',pad,24);
}

/* 按 slug 分发，彻底摆脱数字下标 */
var CH_BY_ID = {
  'inflation':['inflaErode'],
  'compound-rule72':['compoundCurve'],
  'accounting-equation':['eqBal','flowChart'],
  'balance-sheet':['subjTree'],
  'cashflow-statement':['cashflow3'],
  'ratio-overview':['ratioRadar'],
  'dupont-roe':['dupontTree'],
  'annuity-tvm':['annuityTL'],
  'bond-pricing-duration':['bondYield'],
  'dcf-ddm':['dcfSens'],
  'relative-valuation':['peBand'],
  'portfolio-diversification':['diversify'],
  'capm-sml':['frontCap'],
  'stock-bond-allocation':['allocRing'],
  'rebalancing':['rebalBand'],
  'capital-budgeting-npv':['npvCurve'],
  'wacc':['waccCurve'],
  'business-cycles':['gdpCycle'],
  'supply-demand-elasticity':['sdShift'],
  'options-basics':['optPayoff'],
  'prospect-theory':['prospect']
};
var DRAWERS = {
  inflaErode:drawInflaErode, compoundCurve:drawCompoundCurve, homeCurve:drawHomeCurve,
  eqBal:drawEqBal, flowChart:drawFlow, subjTree:drawSubjTree, cashflow3:drawCashflow3,
  ratioRadar:drawRatioRadar, annuityTL:drawAnnuityTL, dcfSens:drawDcfSens,
  peBand:drawPeBand, diversify:drawDiversify, frontCap:drawFrontCap,
  allocRing:drawAllocRing, bondYield:drawBondYield, rebalBand:drawRebalBand,
  gdpCycle:drawGdpCycle, sdShift:drawSdShift, optPayoff:drawOptPayoff, prospect:drawProspect,
  dupontTree:drawDupont, npvCurve:drawNPV, waccCurve:drawWACC
};
function drawForId(id){
  var ids = CH_BY_ID[id] || [];
  ids.forEach(function(cid){
    if(document.getElementById(cid) && DRAWERS[cid]) DRAWERS[cid]();
  });
}
function drawFor(i){
  var r = window.REG && window.REG[i];
  if(r) drawForId(r.id);
}
var _rsz;
window.addEventListener('resize', function(){
  clearTimeout(_rsz);
  _rsz=setTimeout(function(){
    var c=document.querySelector('.chapter.active');
    if(!c) return;
    Array.prototype.forEach.call(c.querySelectorAll('canvas'), function(cv){ cv._w=-1; });
    drawFor(CUR);
  }, 160);
});
