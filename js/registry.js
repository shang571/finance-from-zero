/* ============================================================
   唯一权威章表 REG
   - id 为语义 slug，终身不变；插章、改章不影响任何分发逻辑
   - n 仅用于显示序号，禁止作为任何查找键
   - d = 完(完整课文) / 骨(骨架，由 boot.js 自动生成)
   - k 为骨架章节要点；完整课文的要点写在 chapters/volN.js 里
   ============================================================ */
(function(){
  function E(id,n,t,v,l,a,d,p,k){ return {id:id,n:n,t:t,v:v,l:l,a:a,d:d,p:p||[],k:k||[]}; }

  window.VOLS = [
    '金钱常识','看懂财报','分析与估值','投资学','基金与配置','公司金融',
    '宏观经济','微观经济','交易实操','衍生品','行为金融','量化入门'
  ];
  window.LEVEL_NAME = { '入':'入门', '进':'进阶', '高':'高阶' };
  window.AU_NAME = { '零':'零基础', '学':'学生', '实':'实操' };

  window.REG = [
    /* 卷一 · 金钱常识 —— 批1完整 */
    E('time-value',1,'钱的时间价值',1,'入','零','完',[],['今天的钱比明天的钱值钱','利率是把不同时点的钱放到同一天平上的尺']),
    E('inflation',2,'通胀与购买力',1,'入','零','完',[],['物价上涨意味着同样的钱能买到的东西变少','名义收益与实际收益不是一回事']),
    E('cashflow-budget',3,'收入支出储蓄',1,'入','零','完',[],['现金流比账面数字更接近生活','先支付给自己：储蓄是预算的第一顺位']),
    E('personal-balance',4,'个人资产负债表',1,'入','零','完',[],['资产减负债等于净资产','流动性资产与长期资产要分开看']),
    E('compound-rule72',5,'复利与72法则',1,'入','零','完',['time-value'],[]),
    E('risk-return-101',6,'风险与收益第一课',1,'入','零','完',['time-value'],[]),
    E('real-return',7,'真实收益率',1,'入','零学','完',['time-value','inflation'],[]),
    E('life-goals',8,'目标与生命周期',1,'入','零','完',['cashflow-budget','personal-balance'],[]),

    /* 卷二 · 看懂财报 —— 批1完整 09-13 */
    E('statements-overview',9,'三大报表全景',2,'入','零学','完',[],[]),
    E('accounting-equation',10,'会计等式与复式记账',2,'入','学','完',['statements-overview'],[]),
    E('balance-sheet',11,'资产负债表拆解',2,'入','零学','完',['statements-overview'],[]),
    E('income-statement',12,'利润表到净利润',2,'入','零学','完',['statements-overview'],[]),
    E('cashflow-statement',13,'现金流量表三活动',2,'入','零学','完',['statements-overview'],[]),
    E('accrual-vs-cash',14,'权责发生制vs收付实现制',2,'入','学','完',['income-statement','cashflow-statement'],['本章将解释「权责发生制vs收付实现制」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('depreciation-capitalization',15,'折旧摊销与资本化',2,'进','学','完',['income-statement'],['本章将解释「折旧摊销与资本化」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('receivables-inventory',16,'应收与存货的水分',2,'进','学实','完',['income-statement'],['本章将解释「应收与存货的水分」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('goodwill-offbalance',17,'商誉减值与表外',2,'高','学实','骨',['depreciation-capitalization'],['商誉是并购溢价留下的账目','表外负债不会出现在资产负债表上，但要读附注']),
    E('footnotes-related-party',18,'附注与关联交易',2,'高','学实','骨',['balance-sheet'],['附注是财报不可分割的一部分','关联方交易的价格需要单独审视']),

    /* 卷三 · 分析与估值 —— 批2/3 */
    E('ratio-overview',19,'比率分析全景',3,'进','学实','完',['balance-sheet','income-statement'],['本章将解释「比率分析全景」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('dupont-roe',20,'杜邦分析ROE',3,'进','学实','完',['ratio-overview'],['本章将解释「杜邦分析ROE」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('working-capital-cycle',21,'营运资本与现金周期',3,'进','学实','完',['ratio-overview'],['本章将解释「营运资本与现金周期」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('annuity-tvm',22,'年金与现值终值',3,'进','学','完',['time-value'],['本章将解释「年金与现值终值」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('bond-pricing-duration',23,'债券定价与久期',3,'进','学实','骨',['annuity-tvm'],['本章将解释「债券定价与久期」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('dcf-ddm',24,'股利折现与DCF',3,'进','学实','完',['annuity-tvm','bond-pricing-duration'],['本章将解释「股利折现与DCF」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('relative-valuation',25,'相对估值PEPBPS',3,'进','实','完',['dcf-ddm'],['本章将解释「相对估值PEPBPS」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('valuation-traps',26,'估值陷阱与安全边际',3,'高','实','完',['dcf-ddm','relative-valuation'],['本章将解释「估值陷阱与安全边际」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('restated-financials',27,'财报重述与调整',3,'高','实','骨',['receivables-inventory'],['一次性损益会扭曲同比口径','重述后要重建可比基数']),

    /* 卷四 · 投资学 */
    E('risk-return-var',28,'风险收益方差协方差',4,'进','学','完',['risk-return-101','annuity-tvm'],['本章将解释「风险收益方差协方差」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('portfolio-diversification',29,'组合理论与分散化',4,'进','学实','完',['risk-return-var'],['本章将解释「组合理论与分散化」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('capm-sml',30,'CAPM与SML',4,'进','学','完',['portfolio-diversification'],['本章将解释「CAPM与SML」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('apt-factors',31,'套利定价与因子',4,'高','学','骨',['capm-sml'],['APT不要求市场组合可观测','因子暴露决定预期收益']),
    E('efficient-market',32,'有效市场与异象',4,'进','学实','骨',['risk-return-var'],['本章将解释「有效市场与异象」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('bond-portfolio',33,'债券组合与利率风险',4,'进','实','骨',['bond-pricing-duration'],['久期匹配是利率风险管理的核心','凸性修正大幅波动下的线性误差']),
    E('market-microstructure',34,'市场微观结构',4,'高','实','骨',['efficient-market'],['买卖价差是流动性的直接价格','订单簿决定短时价格形成']),
    E('performance-attribution',35,'业绩归因与基准',4,'高','实','骨',['portfolio-diversification'],['选股与择时贡献要分开','基准选错，归因全是噪声']),
    E('survivorship-bias',36,'幸存者偏差',4,'进','零实','骨',['efficient-market'],['本章将解释「幸存者偏差」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('longterm-expectations',37,'长期投资数学期望',4,'进','实','骨',['risk-return-var'],['本章将解释「长期投资数学期望」的核心含义与分析口径','学完应能说清它与前置章节的关系']),

    /* 卷五 · 基金与配置 */
    E('active-passive-funds',38,'基金主动与被动',5,'入','零','完',['risk-return-101'],['本章将解释「基金主动与被动」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('index-etf',39,'指数基金与ETF',5,'入','零','完',['active-passive-funds'],['本章将解释「指数基金与ETF」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('fees-navigation',40,'净值与费率陷阱',5,'入','零','完',['active-passive-funds'],['本章将解释「净值与费率陷阱」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('stock-bond-allocation',41,'股债平衡配置',5,'进','零实','完',['portfolio-diversification'],['本章将解释「股债平衡配置」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('portfolio-building',42,'组合实用构建',5,'进','实','完',['portfolio-diversification','stock-bond-allocation'],['本章将解释「组合实用构建」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('rebalancing',43,'再平衡与纪律',5,'进','实','骨',['stock-bond-allocation'],['本章将解释「再平衡与纪律」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('lifecycle-funds',44,'生命周期与目标日期',5,'进','零实','骨',['life-goals','stock-bond-allocation'],['年龄不是唯一的风险承受度变量','目标日期基金自动下滑权益比例']),
    E('alternatives',45,'另类资产黄金REITs',5,'高','实','骨',['stock-bond-allocation'],['另类资产与股债相关性较低','流动性差、费率高的代价要对冲']),
    E('allocation-profiles',46,'三种配置画像',5,'进','实','骨',['stock-bond-allocation'],['本章将解释「三种配置画像」的核心含义与分析口径','学完应能说清它与前置章节的关系']),

    /* 卷六 · 公司金融 */
    E('corporate-finance-value',47,'公司金融创造价值',6,'进','学','完',[],['本章将解释「公司金融创造价值」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('capital-budgeting-npv',48,'资本预算与NPV',6,'进','学','完',['annuity-tvm'],['本章将解释「资本预算与NPV」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('project-cashflow',49,'项目现金流预测',6,'进','学','完',['capital-budgeting-npv'],['本章将解释「项目现金流预测」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('wacc',50,'资本成本WACC',6,'进','学','完',['capital-budgeting-npv'],['本章将解释「资本成本WACC」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('leverage-mm',51,'杠杆与MM理论',6,'进','学','骨',['wacc'],['本章将解释「杠杆与MM理论」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('operating-financial-leverage',52,'经营与财务杠杆',6,'进','学','骨',['leverage-mm'],['本章将解释「经营与财务杠杆」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('dividend-buyback',53,'股利政策与回购',6,'进','学实','骨',['leverage-mm'],['本章将解释「股利政策与回购」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('ipo-refinancing',54,'IPO与再融资',6,'进','学实','骨',['leverage-mm'],['IPO定价涉及信息不对称','再融资会稀释原有股东权益']),
    E('debt-rating',55,'债务融资与评级',6,'进','学','骨',['wacc'],['评级衡量违约概率与回收率','契约条款保护债权人']),
    E('governance-agency',56,'公司治理与代理',6,'进','学实','骨',['corporate-finance-value'],['本章将解释「公司治理与代理」的核心含义与分析口径','学完应能说清它与前置章节的关系']),

    /* 卷七 · 宏观经济 */
    E('gdp-national-income',57,'GDP与国民收入',7,'进','学','骨',[],['本章将解释「GDP与国民收入」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('inflation-phillips',58,'通胀失业菲利普斯',7,'进','学','骨',['gdp-national-income','inflation'],['本章将解释「通胀失业菲利普斯」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('money-banking-rates',59,'货币银行与利率',7,'进','学','骨',['gdp-national-income'],['本章将解释「货币银行与利率」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('central-bank-policy',60,'央行与货币政策',7,'进','学','完',['money-banking-rates'],['本章将解释「央行与货币政策」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('fiscal-debt',61,'财政政策与债务',7,'进','学','骨',['gdp-national-income'],['本章将解释「财政政策与债务」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('business-cycles',62,'经济周期与衰退信号',7,'进','学实','骨',['gdp-national-income','inflation-phillips'],['本章将解释「经济周期与衰退信号」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('fx-bop',63,'汇率与国际收支',7,'进','学','骨',['money-banking-rates'],['汇率由相对价格与资本流动共同决定','国际收支是理解汇率压力的背景']),
    E('macro-transmission',64,'宏观传导到市场',7,'进','实','完',['central-bank-policy','business-cycles'],['本章将解释「宏观传导到市场」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('rates-valuation',65,'利率与估值分母端',7,'高','实','骨',['central-bank-policy','dcf-ddm'],['本章将解释「利率与估值分母端」的核心含义与分析口径','学完应能说清它与前置章节的关系']),

    /* 卷八 · 微观经济 */
    E('supply-demand-elasticity',66,'供需价格弹性',8,'进','学','骨',[],['本章将解释「供需价格弹性」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('consumer-choice',67,'消费者选择与效用',8,'进','学','骨',['supply-demand-elasticity'],['本章将解释「消费者选择与效用」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('production-costs',68,'生产成本规模经济',8,'进','学','骨',['supply-demand-elasticity'],['本章将解释「生产成本规模经济」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('market-structures',69,'市场结构竞争垄断',8,'进','学','完',['production-costs'],['本章将解释「市场结构竞争垄断」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('game-theory',70,'博弈论入门',8,'高','学','骨',['market-structures'],['策略互动决定均衡结果','纳什均衡不等于集体最优']),
    E('asymmetric-info',71,'信息不对称',8,'高','学实','骨',['market-structures'],['逆向选择发生在交易前','道德风险发生在交易后']),
    E('externalities',72,'外部性与公共品',8,'进','学','骨',['market-structures'],['外部性让私人成本偏离社会成本','公共品面临搭便车问题']),
    E('moat-micro',73,'护城河的微观视角',8,'进','实','骨',['market-structures'],['本章将解释「护城河的微观视角」的核心含义与分析口径','学完应能说清它与前置章节的关系']),

    /* 卷九 · 交易实操 */
    E('order-types',74,'订单类型与机制',9,'进','实','骨',['market-microstructure'],['本章将解释「订单类型与机制」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('trading-costs',75,'佣金滑点冲击成本',9,'进','实','骨',['order-types'],['本章将解释「佣金滑点冲击成本」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('candlestick-trend',76,'K线与趋势地基',9,'进','实','骨',['order-types'],['本章将解释「K线与趋势地基」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('indicators',77,'均线MACD RSI',9,'进','实','骨',['candlestick-trend'],['本章将解释「均线MACD RSI」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('volume-price',78,'量价背离',9,'高','实','骨',['indicators'],['成交量确认价格趋势的可信度','背离只是提示，不是信号本身']),
    E('position-stop',79,'仓位与止损',9,'进','实','完',['risk-return-101','portfolio-diversification'],['本章将解释「仓位与止损」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('backtesting',80,'回测基本方法',9,'高','实','骨',['candlestick-trend'],['样本内表现不能代表未来','交易成本必须计入回测']),
    E('trading-plan',81,'交易计划与复盘',9,'进','实','骨',['position-stop'],['本章将解释「交易计划与复盘」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('leverage-short',82,'杠杆做空爆仓',9,'高','实','骨',['position-stop'],['杠杆放大收益也放大回撤','做空的损失理论上没有上限']),

    /* 卷十 · 衍生品（全部骨架） */
    E('derivatives-overview',83,'衍生品全景',10,'高','学实','骨',['bond-pricing-duration'],['衍生品价值来自标的资产','对冲与投机使用同一套工具']),
    E('futures-margin',84,'期货定价保证金',10,'高','实','骨',['derivatives-overview'],['保证金制度控制违约风险','持有成本决定期货理论价格']),
    E('options-basics',85,'期权看涨看跌',10,'高','实','骨',['derivatives-overview'],['买方权利、卖方义务','收益结构天生不对称']),
    E('bs-pricing',86,'BS定价概览',10,'高','学','骨',['options-basics'],['期权价格由五个变量决定','模型假设与真实市场存在差距']),
    E('greeks',87,'希腊字母',10,'高','实','骨',['bs-pricing'],['Delta是一阶敏感度','Theta是时间的损耗']),
    E('hedging',88,'对冲套保实务',10,'高','实','骨',['futures-margin','options-basics'],['套保目标不是赚钱，而是锁定风险','基差风险无法完全消除']),
    E('implied-vol',89,'隐含波动率',10,'高','实','骨',['bs-pricing'],['隐含波动率由市场价格反推','波动率微笑反映市场的尾部定价']),
    E('structured-products',90,'结构性产品',10,'高','实','骨',['options-basics'],['收益结构由内嵌期权决定','阅读产品说明书比看宣传材料重要']),

    /* 卷十一 · 行为金融 */
    E('behavioral-why',91,'行为金融为何重要',11,'进','实','骨',['efficient-market'],['本章将解释「行为金融为何重要」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('cognitive-biases',92,'认知偏差清单',11,'进','实','完',['behavioral-why'],['本章将解释「认知偏差清单」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('prospect-theory',93,'损失厌恶前景理论',11,'进','学实','骨',['cognitive-biases'],['本章将解释「损失厌恶前景理论」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('overconfidence',94,'过度自信与频繁交易',11,'进','实','骨',['cognitive-biases'],['本章将解释「过度自信与频繁交易」的核心含义与分析口径','学完应能说清它与前置章节的关系']),
    E('herding-bubbles',95,'羊群效应与泡沫',11,'进','学实','骨',['cognitive-biases'],['群体行为会放大价格偏离','泡沫破裂前人人觉得合理']),
    E('mental-accounting',96,'心理账户',11,'进','零','骨',['cognitive-biases'],['同样的钱在不同账户里被区别对待','整体视角能减少决策偏差']),
    E('discipline-checklist',97,'投资纪律检查表',11,'进','实','骨',['cognitive-biases'],['本章将解释「投资纪律检查表」的核心含义与分析口径','学完应能说清它与前置章节的关系']),

    /* 卷十二 · 量化入门（全部骨架） */
    E('quant-process',98,'量化研究流程',12,'高','实','骨',['backtesting'],['假设→数据→回测→样本外验证','研究流程比模型复杂度更重要']),
    E('factors',99,'价值动量质量因子',12,'高','学实','骨',['apt-factors','quant-process'],['因子是横截面收益的共同驱动','拥挤度会侵蚀因子收益']),
    E('overfitting',100,'过拟合与样本外',12,'高','实','骨',['quant-process'],['参数越多越容易拟合噪声','样本外测试是最后一道闸门'])
  ];

  var byId = {}, byNum = {};
  window.REG.forEach(function(r,i){
    byId[r.id] = r;
    byNum[r.n] = r;
    r.i = i;
    r.rel = [];
  });
  window.REG.forEach(function(r){
    r.p.forEach(function(id){
      var pre = byId[id];
      if(pre) pre.rel.push(r.id);
    });
  });
  window.regById = function(id){ return byId[id] || null; };
  window.regByNum = function(n){ return byNum[n] || null; };
  window.regVolName = function(v){ return window.VOLS[v-1] || ''; };
  window.regLevelName = function(l){ return window.LEVEL_NAME[l] || l; };
  window.regAudienceName = function(a){
    return (a||'').split('').map(function(c){ return window.AU_NAME[c] || c; }).join(' / ');
  };
})();
