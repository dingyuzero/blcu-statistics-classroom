"use strict";
const chapterModules = {
  descriptive: [
    ["main", "直方图与异常值", "一组数据，可以有几种概括方式？"],
    ["boxplot", "箱线图与四分位数", "箱体、须与异常点分别告诉我们什么？", boxplotLab],
    ["zscore", "标准分与单位变换", "换一个单位，会改变一个人的相对位置吗？", zscoreLab],
  ],
  distribution: [
    ["main", "正态与二项分布", "曲线的高度为什么不等于概率？"],
    ["student", "t 分布与尾部", "自由度变大，t 分布会怎样变化？", studentLab],
    ["bayes", "贝叶斯与基础率", "一次“有信号”的判断，有多少可能真的存在信号？", bayesLab],
  ],
  sampling: [
    ["main", "抽样分布与 CLT", "总体偏斜，样本均值的分布也一定偏斜吗？"],
    ["se", "标准误与样本量", "样本量增加四倍，均值的波动缩小多少？", seLab],
    ["bootstrap", "Bootstrap 重抽样", "只有一份样本，怎样近似均值的不确定性？", bootstrapLab],
  ],
  confidence: [
    ["main", "区间的长期覆盖率", "95% 置信，究竟在描述什么？"],
    ["mean", "单样本均值区间", "用一组观测值，为总体均值构造区间。", meanIntervalLab],
    ["proportion", "比例区间：Wilson 与 Wald", "全对或全错，真的意味着没有不确定性吗？", proportionLab],
  ],
  hypothesis: [
    ["main", "两组比较：Welch t", "同样的均值差，为什么得到不同的 p 值？"],
    ["power", "检验功效与两类错误", "在研究开始前，估计发现预设效应的机会。", powerLab],
    ["multiple", "多重比较", "做的检验越多，偶然出现显著的机会有多大？", multipleLab],
  ],
  regression: [
    ["main", "相关、回归与异常点", "一个异常点会怎样改变相关与回归？"],
    ["residuals", "残差与最小二乘", "亲手调一条线，怎样才能更贴近数据？", residualsLab],
    ["groups", "分组与汇总相关", "每个组内都是正相关，合起来也一定如此吗？", groupsLab],
  ],
};
function moduleInfo() { return chapterModules[current]?.find(m => m[0] === currentModule); }
function activeTitle() { return moduleInfo()?.[1] || topics.find(t=>t.id===current)?.title || "统计课堂"; }
function stateKey() { return current + (currentModule === "main" ? "" : ":" + currentModule); }
function chapterNav() {
  return `<nav class="chapter-tabs" aria-label="本章演示">${chapterModules[current].map((m,i)=>`<a href="#${current}${m[0]==="main"?"":"/"+m[0]}" ${m[0]===currentModule?'aria-current="page" class="active"':""}><span>0${i+1}</span>${m[1]}</a>`).join("")}</nav>`;
}
function dataField() {
  return '<label class="field"><span class="field-top">输入数据</span><textarea id="data" aria-label="输入数据">42, 45, 46, 48, 49, 50, 51, 53, 55, 61</textarea><small>2–200 个数，−10000 至 10000；逗号、空格或换行分隔。</small></label><button class="button primary full" id="apply-data">应用数据</button>';
}
function confidenceField() { return select("level","置信水平",[["0.95","95%"],["0.9","90%"],["0.99","99%"]]); }
function alphaField() { return select("alpha","显著性水平 α",[["0.05","0.05"],["0.01","0.01"],["0.1","0.10"]]); }
function spanFor(data, extra=[]) {
  const all=[...data,...extra],lo=Math.min(...all),hi=Math.max(...all),pad=Math.max((hi-lo)*.15,.5);
  return [lo-pad,hi+pad];
}
function textAt(x,y,s) { scene.text(x,y,s); }
function reseed(update) { $("#resample")?.addEventListener("click",()=>{$("#seed").value=String((num("seed")+1)%2147483648);update();}); }
function boxplotLab() {
  scaffold(dataField(),["绿色：Q1–Q3 箱体", "紫色：中位数", "红色：1.5×IQR 规则标记点"],
    ["查看数值表中的排序和四分位数。","把最后一个数改成 120，再应用。","比较箱体位置和上须是否与最大值重合。"],
    "箱线图上的异常点一定是错误数据吗？","不是。1.5×IQR 是描述性标记规则，不是自动删除标准。四分位数采用线性插值（type 7）；不同软件的默认算法可能不同。");
  bind(()=>{
    const data=Stats.parseData($("#data").value),d=StatsExtra.boxplot(data),[lo,hi]=spanFor(data);
    init([lo,2.4,hi,-.45]);
    segment([d.whiskerLow,1.2],[d.whiskerHigh,1.2],teal);
    line([d.q1,d.q1,d.q3,d.q3,d.q1],[.8,1.6,1.6,.8,.8],teal,2,0,teal);
    for(const x of [d.whiskerLow,d.whiskerHigh]) segment([x,.96],[x,1.44],teal);
    segment([d.median,.8],[d.median,1.6],purple,3);
    [...data].sort((a,b)=>a-b).forEach((x,i)=>dot(x,.25+(i%3)*.1,x<d.low||x>d.high?red:teal,2.4));
    d.outliers.forEach(x=>dot(x,1.2,red,3));
    values(`IQR = ${fmt(d.iqr)}`,`下围栏 ${fmt(d.low)}；上围栏 ${fmt(d.high)}；标记 ${d.outliers.length} 个观测。`);
    smallMetrics([[fmt(d.q1),"第一四分位 Q1"],[fmt(d.median),"中位数 Q2"],[fmt(d.q3),"第三四分位 Q3"]]);
    setMath(`IQR = Q3 − Q1 = ${fmt(d.iqr)}`,"须延伸到围栏内最远的观测值。围栏是判断阈值，不一定等于须端点。",'\\mathrm{IQR}=Q_3-Q_1');
    $("#plot-caption").textContent="横轴：观测数值；纵向位置仅用于排列箱体和数据点。";
    table(["序号（排序后）","观测值","IQR 规则标记"],[...data].sort((a,b)=>a-b).map((x,i)=>[i+1,x,x<d.low||x>d.high?"围栏外":"围栏内"]));
  });
}
function zscoreLab() {
  scaffold(dataField()+range("scale","缩放倍数 b",1,.1,5,.1)+range("shift","平移量 a",0,-100,100,1),
    ["绿色：原始值", "橙色：a + b×x（与原始值共用横轴）"],
    ["将 b 调到 2，比较均值和标准差。","平移 a，观察标准差是否变化。","展开数值表，比较变换前后的 z 分数。"],
    "换单位后，谁高于平均数的结论会改变吗？","这里 b > 0，z 分数不随平移和正比例缩放而改变；负比例会翻转方向。本演示使用样本标准差，标准分并不保证数据变成正态分布。");
  bind(()=>{
    const data=Stats.parseData($("#data").value),r=StatsExtra.standardize(data,num("shift"),num("scale")),[lo,hi]=spanFor(data,r.transformed);
    init([lo,2.9,hi,-.4]);
    data.forEach((x,i)=>{dot(x,1+(i%3)*.08);dot(r.transformed[i],2+(i%3)*.08,orange);});
    segment([r.original.mean,.7],[r.original.mean,1.45],teal,2);segment([r.mean,1.7],[r.mean,2.45],orange,2);
    values(`s → ${fmt(r.sd)}`,`原始均值 ${fmt(r.original.mean)} → ${fmt(r.mean)}；原始 s = ${fmt(r.original.sd)}。`);
    smallMetrics([[data.length,"观测数"],["0","z 分数均值（理论）"],["1","z 分数样本标准差（理论）"]]);
    setMath('z = (x − x̄) / s；正比例变换后 z 保持不变',"所有值相同时标准差为零，不能计算 z 分数。",'z_i=\\frac{x_i-\\bar{x}}s,\\quad y_i=a+bx_i\\;(b>0)');
    $("#plot-caption").textContent="横轴：观测数值；下排为原始值，上排为变换值。纵轴位置只用于分组展示。";
    table(["序号","原始值","变换值","原始 z","变换后 z"],data.map((x,i)=>[i+1,x,r.transformed[i],r.z[i],(r.transformed[i]-r.mean)/r.sd]));
  });
}
function studentLab() {
  scaffold(range("df","自由度 df",5,1,200)+alphaField(),["绿色：t 密度", "紫色虚线：标准正态密度", "阴影：t 分布双侧尾部"],
    ["从 df=1 开始，观察低峰和厚尾。","逐步增大 df，比较两条密度曲线。","比较 t 与 z 的双侧临界值。"],
    "自由度小，为什么相同尾部概率需要更大的临界值？","t 分布反映用样本估计标准差带来的额外不确定性。自由度越小，尾部越厚。df=1 的均值不存在，df≤2 没有有限方差，不能简单把它称为方差更大的正态分布。");
  bind(()=>{
    const df=num("df"),alpha=num("alpha"),r=StatsExtra.tReference(df,alpha),limit=6;
    init([-limit,.48,limit,-.065]);
    const tf=x=>Stats.tPDF(x,df);
    area(tf,-limit,-Math.min(r.t,limit));area(tf,Math.min(r.t,limit),limit);
    curve(tf,-limit,limit);const xs=Array.from({length:401},(_,i)=>-6+i*.03);line(xs,xs.map(x=>Stats.normalPDF(x,0,1)),purple,2,2);
    if(r.t<limit) for(const x of [-r.t,r.t]) segment([x,0],[x,tf(x)],orange,2,2);
    values(`t* = ${fmt(r.t)}`,`双侧 α=${alpha}；标准正态 z*=${fmt(r.z)}。${r.t>=limit?"t 临界值在当前横轴范围外。":""}`);
    smallMetrics([[df,"自由度"],[fmt(r.t-r.z),"t* − z*"],[fmt(alpha),"总尾部概率"]]);
    setMath(`P(|T| > ${fmt(r.t)}) = ${alpha}`,"横轴固定在 −6 至 6；阴影只显示可见尾部，标注的概率包括画布外区域。",'P(|T_\\nu|>t_{1-\\alpha/2,\\nu})=\\alpha');
    $("#plot-caption").textContent="横轴：标准化统计量；纵轴：概率密度。固定坐标便于比较；画布不包含整个无限尾部。";
    table(["x","t 密度","标准正态密度"],xs.map(x=>[x,tf(x),Stats.normalPDF(x,0,1)]));
  });
}
function bayesLab() {
  scaffold(range("base","信号存在率（%）",10,0,100)+range("hit","有信号时判断为有（%）",90,0,100)+range("false","无信号时判断为有（%）",10,0,100),
    ["绿色：真实有信号", "橙色：真实无信号", "四根柱：1000 次判断的期望次数"],
    ["保持命中率 90%、虚报率 10%。","把信号存在率从 50% 改到 1%。","观察所有“判断为有”中，有多少来自真实信号。"],
    "命中率 90%，就意味着判断为有时有 90% 是真信号吗？","不能互换条件概率。P(判断为有|有信号) 与 P(有信号|判断为有) 不同；后者还取决于基础率和虚报率。这里采用抽象信号判断情境，不是诊断工具。");
  bind(()=>{
    const r=StatsExtra.bayes(num("base")/100,num("hit")/100,num("false")/100),rows=[["真有／判断有",r.yesSignal],["真无／判断有",r.yesNoise],["真有／判断无",r.noSignal],["真无／判断无",r.noNoise]];
    init([-.2,1150,4.8,-180]);
    rows.forEach(([name,p],i)=>{const x=i+.5,c=i%2?orange:teal;line([x-.3,x-.3,x+.3,x+.3,x-.3],[0,1000*p,1000*p,0,0],c,1,0,c);textAt(x-.35,-65,name.slice(0,2));textAt(x-.35,-120,name.slice(3));});
    values(r.posterior===null?"条件事件不发生":`${fmt(100*r.posterior,2)}%`,r.posterior===null?"判断为有的概率为 0，该条件概率未定义。":"在所有判断为有的情形中，真实有信号的比例。");
    smallMetrics([[fmt(1000*r.yesSignal,1),"真有且判断有"],[fmt(1000*r.yesNoise,1),"真无但判断有"],[fmt(1000*r.yes,1),"判断为有合计"]]);
    setMath('后验概率 = 真有且判断有 / 所有判断为有',"柱高是 1000 次试验的期望次数，可以是小数；并非一次随机模拟的实际人数。",'P(S\\mid +)=\\frac{P(+\\mid S)P(S)}{P(+\\mid S)P(S)+P(+\\mid \\neg S)P(\\neg S)}');
    $("#plot-caption").textContent="纵轴：每 1000 次判断的期望次数。S 表示存在信号，+ 表示判断为有。";
    table(["情形","联合概率","每1000次的期望次数"],rows.map(([name,p])=>[name,p,1000*p]));
  });
}
function seLab() {
  scaffold(range("n","样本量 n",25,1,500)+range("sigma","总体标准差 σ",10,1,30),["绿色：个体分布", "橙色：样本均值分布", "总体均值固定为 50"],
    ["从 n=1 开始，观察两条曲线重合。","比较 n=25 和 n=100。","保持 n，增加总体标准差，观察两条分布。"],
    "更多被试会让个体差异本身变小吗？","不会。总体标准差描述个体变异，标准误描述估计量的重复抽样波动。此处假设独立同分布的正态总体，因此均值分布是精确正态；并非对任何小样本都适用。");
  bind(()=>{
    const n=num("n"),sigma=num("sigma"),se=StatsExtra.standardError(n,sigma),lo=50-4*sigma,hi=50+4*sigma,top=Stats.normalPDF(50,50,se)*1.2;
    init([lo,top,hi,-top*.15]);curve(x=>Stats.normalPDF(x,50,sigma),lo,hi);curve(x=>Stats.normalPDF(x,50,se),50-4*se,50+4*se,orange);
    values(`SE = ${fmt(se)}`,`σ=${sigma} 保持个体分布宽度；n=${n} 时均值波动为个体波动的 1/√n。`);
    smallMetrics([[sigma,"个体标准差 σ"],[fmt(se),"均值标准误"],[fmt(Math.sqrt(n)),"精度倍率 √n"]]);
    setMath(`SE = ${sigma} / √${n} = ${fmt(se)}`,"横轴跨度随 σ 变化；纵轴随均值密度峰值缩放。两条曲线的总面积各为 1。",'\\bar{X}\\sim N(50,\\sigma^2/n),\\quad SE=\\sigma/\\sqrt{n}');
    $("#plot-caption").textContent="横轴：个体值或样本均值；纵轴：密度。橙色曲线越窄、峰值越高，面积仍为 1。";
    table(["样本量 n","总体标准差","均值标准误"],[1,5,10,25,50,100,200,500].map(k=>[k,sigma,StatsExtra.standardError(k,sigma)]).concat([[n,sigma,se]]));
  });
}
function bootstrapLab() {
  scaffold(dataField()+range("repetitions","重抽样次数 B",500,100,2000,100)+confidenceField()+seedField()+'<button class="button full" id="resample">换一轮随机种子</button>',
    ["绿色：Bootstrap 均值的频数", "橙色：原始样本均值", "紫色虚线：百分位区间端点"],
    ["从原始样本有放回地抽取同样数量的观测，重复 B 次。","对比 B=100 和 2000，注意 Monte Carlo 波动。","换种子，再比较区间端点。"],
    "重抽样 2000 次，等于新增了 2000 个真实样本吗？","不是。Bootstrap 近似经验分布下的抽样过程，并未增加原始样本的信息。百分位区间是近似方法，小样本、偏倚、重尾或依赖数据可能覆盖不足；它不能补救有偏抽样。");
  const update=bind(()=>{
    const data=Stats.parseData($("#data").value),r=StatsExtra.bootstrap(data,num("repetitions"),num("level"),num("seed")),bins=Stats.histogram(r.means,20),[lo,hi]=spanFor(r.means),top=Math.max(...bins.map(b=>b.count))*1.2;
    init([lo,top,hi,-top*.15]);bars(bins);segment([r.mean,0],[r.mean,top*.9],orange,2);for(const x of [r.lo,r.hi])segment([x,0],[x,top*.85],purple,2,2);
    values(`[${fmt(r.lo)}, ${fmt(r.hi)}]`,`${num("level")*100}% 百分位区间（近似）；B=${r.means.length}，种子=${num("seed")}。`);
    smallMetrics([[data.length,"原始样本量"],[fmt(r.mean),"样本均值"],[fmt(r.se),"Bootstrap 标准误"]]);
    setMath('百分位区间 = Bootstrap 均值分布的两端分位数',"分位数采用 type 7；重复次数影响模拟精度，不会扩大原始样本量。CSV 同时保留原始观测和重抽样均值。",'[q^*_{\\alpha/2},q^*_{1-\\alpha/2}]');
    $("#plot-caption").textContent="横轴：重抽样均值；纵轴：频数。每次重抽样有放回，样本量与原始样本一致。";
    table(["记录类型","序号","数值"],data.map((x,i)=>["原始观测",i+1,x]).concat(r.means.map((x,i)=>["重抽样均值",i+1,x])));
  });reseed(update);
}
function meanIntervalLab() {
  scaffold(dataField()+confidenceField(),["绿色：输入观测", "橙色：样本均值", "紫色：均值的 t 区间"],
    ["输入一组独立观测值，再应用。","固定数据，比较 90%、95% 和 99% 区间。","加入一个极端观测，比较均值、标准差与宽度。"],
    "这个区间是否包含 95% 的个体观测？","不是。这里估计总体均值，不是个体值的预测区间。精确 t 区间要求独立同分布的正态观测；大样本下可作近似，明显偏态、离群点或依赖性需要另外判断。");
  bind(()=>{
    const data=Stats.parseData($("#data").value),r=StatsExtra.meanInterval(data,num("level")),[lo,hi]=spanFor(data,[r.lo,r.hi]);
    init([lo,2.5,hi,-.4]);data.forEach((x,i)=>dot(x,.5+(i%3)*.1));segment([r.lo,1.6],[r.hi,1.6],purple,4);for(const x of [r.lo,r.hi])segment([x,1.4],[x,1.8],purple);dot(r.mean,1.6,orange,5);
    values(`[${fmt(r.lo)}, ${fmt(r.hi)}]`,`${num("level")*100}% 置信区间；自由度 ${r.n-1}；临界值 ${fmt(r.critical)}。`);
    smallMetrics([[r.n,"样本量"],[fmt(r.mean),"样本均值"],[fmt(r.se),"估计标准误 s/√n"]]);
    setMath(`${fmt(r.mean)} ± ${fmt(r.critical*r.se)}`,"置信水平描述重复抽样构造区间的长期覆盖率；不能解释为这个固定总体均值有某概率落入已得到的区间。",'\\bar{x}\\pm t_{1-\\alpha/2,n-1}\\frac{s}{\\sqrt{n}}');
    $("#plot-caption").textContent="横轴：观测/均值的数值；下排为原始观测，上方为总体均值的置信区间。纵轴只用于排列。";
    table(["序号","观测值","离均差"],data.map((x,i)=>[i+1,x,x-r.mean]));
  });
}
function proportionLab() {
  scaffold(number("n","独立试验次数 n",20,1,1000,1)+number("success","成功次数 k",2,0,1000,1)+confidenceField(),["绿色：Wilson 区间", "橙色：Wald 区间（不截断）", "紫色虚线：0 与 1 边界"],
    ["设置 k=0、n=20，比较两种区间。","令 k 接近 n/2，再观察差异。","增大 n，比较区间宽度。"],
    "一次都没有成功，就能断言真实成功率是零吗？","不能。Wald 区间在样本比例为 0 或 1 时退化，并可能超出 [0,1]。Wilson 区间通过反演得分检验构造，通常更稳健，但仍是近似区间；这里假设独立、同成功率的 Bernoulli 试验。");
  bind(()=>{
    const r=StatsExtra.proportion(num("success"),num("n"),num("level")),lo=Math.min(-.15,r.waldLo-.1),hi=Math.max(1.15,r.waldHi+.1);
    init([lo,2.8,hi,-.4]);for(const x of [0,1])segment([x,0],[x,2.5],purple,1,2);
    [[r.lo,r.hi,2,teal],[r.waldLo,r.waldHi,1,orange]].forEach(([a,b,y,c])=>{segment([a,y],[b,y],c,4);segment([a,y-.15],[a,y+.15],c);segment([b,y-.15],[b,y+.15],c);dot(r.p,y,c,4);});
    values(`Wilson [${fmt(r.lo)}, ${fmt(r.hi)}]`,`样本比例 ${fmt(r.p)}；Wald [${fmt(r.waldLo)}, ${fmt(r.waldHi)}]。`);
    smallMetrics([[num("n"),"试验次数"],[fmt(r.hi-r.lo),"Wilson 宽度"],[fmt(r.waldHi-r.waldLo),"Wald 宽度"]]);
    setMath('Wilson：中心和宽度都经过 z²/n 修正',"Wald 端点未人为截断，便于展示越界和退化问题。绘图中的点是样本比例，不一定处于 Wilson 区间的正中间。",'\\frac{\\hat{p}+z^2/(2n)\\;\\pm\\;z\\sqrt{\\hat{p}(1-\\hat{p})/n+z^2/(4n^2)}}{1+z^2/n}');
    $("#plot-caption").textContent="横轴：比例（0 至 1 为可能参数范围）；上排为 Wilson，下排为 Wald。";
    table(["方法","样本比例","下限","上限","宽度"],[["Wilson",r.p,r.lo,r.hi,r.hi-r.lo],["Wald",r.p,r.waldLo,r.waldHi,r.waldHi-r.waldLo]]);
  });
}
function powerLab() {
  scaffold(range("n","样本量 n",30,2,500)+range("delta","预设总体均值差 δ",5,-20,20,.5)+range("sigma","已知总体标准差 σ",10,1,30)+alphaField(),
    ["绿色：H₀ 下均值差的密度", "橙色：预设 H₁ 下密度", "绿色尾部：α；橙色尾部：功效"],
    ["保持 δ=5、σ=10，逐步增大 n。","比较 α=.01 与 .05 的代价。","令 δ=0，验证拒绝概率等于 α。"],
    "功效高就意味着任何一个显著结果都是真的？","不是。功效是给定总体效应、模型和检验规则时的拒绝概率，不是结果为真的后验概率。本页是已知 σ 的单样本双侧 z 检验，用预设效应规划样本；不同于本章 Welch t 检验，也不是事后功效。");
  bind(()=>{
    const delta=num("delta"),r=StatsExtra.power(num("n"),delta,num("sigma"),num("alpha")),lo=Math.min(0,delta)-4*r.se,hi=Math.max(0,delta)+4*r.se,top=Stats.normalPDF(0,0,r.se)*1.2;
    init([lo,top,hi,-top*.15]);
    const f0=x=>Stats.normalPDF(x,0,r.se),f1=x=>Stats.normalPDF(x,delta,r.se);
    // Sample each density on its own scale so narrow separated peaks stay resolved.
    for (const [f,mu,c] of [[f0,0,teal],[f1,delta,orange]]) {
      const a=Math.max(lo,mu-5*r.se),b=Math.min(hi,mu+5*r.se);
      area(f,a,Math.min(b,-r.critical),c);
      area(f,Math.max(a,r.critical),b,c);
      curve(f,a,b,c);
    }
    for(const x of [-r.critical,r.critical])segment([x,0],[x,top*.9],purple,1.5,2);
    values(`${delta===0?"拒绝概率":"功效"} = ${fmt(100*r.power,2)}%`,`${delta===0?"δ=0，H₀ 为真；1−拒绝概率":"β"}=${fmt(r.beta)}；拒绝域：均值差 < −${fmt(r.critical)} 或 > ${fmt(r.critical)}。`);
    smallMetrics([[fmt(num("alpha")),"I 类错误 α"],[fmt(r.beta),delta===0?"1−拒绝概率（δ=0）":"II 类错误 β（给定 δ）"],[fmt(r.se),"标准误"]]);
    setMath('功效 = Pδ(拒绝 H₀)；β = 1 − 功效',"假设独立正态观测且总体 σ 已知，H₀: μ=0。δ=0 时曲线重合、拒绝概率为 α，β 此时不称为 II 类错误。",'\\mathrm{Power}=\\Phi(-z_{1-\\alpha/2}-\\delta/SE)+\\Phi(\\delta/SE-z_{1-\\alpha/2})');
    $("#plot-caption").textContent="横轴：样本均值相对零假设均值的差；纵轴：密度。虚线是固定拒绝界限，阴影只显示画布内尾部。";
    table(["n","预设δ","已知σ","α","功效","1−功效","SE"],[[num("n"),delta,num("sigma"),num("alpha"),r.power,r.beta,r.se]]);
  });
}
function multipleLab() {
  scaffold(range("m","同时进行的检验数 m",20,1,100)+alphaField(),["橙色：每项均用 α", "绿色：Bonferroni 每项用 α/m", "紫色虚线：目标 α"],
    ["从 m=1 开始，逐渐增加检验数量。","比较单项错误概率与至少一次错误的概率。","讨论为什么不能只报告显著的那一项。"],
    "20 次独立检验，每次 α=.05，至少一次误报的概率是多少？","约 64.2%。图中假设全部零假设为真且检验相互独立。Bonferroni 的整体错误率上界不超过 α 不要求独立；但这里绘制的精确曲线采用独立性假设，并不等于 FDR。");
  bind(()=>{
    const m=num("m"),alpha=num("alpha"),r=StatsExtra.multiplicity(m,alpha),xs=Array.from({length:100},(_,i)=>i+1),rows=xs.map(k=>StatsExtra.multiplicity(k,alpha));
    init([0,1.1,104,-.15]);line(xs,rows.map(x=>x.unadjusted),orange);line(xs,rows.map(x=>x.bonferroni));segment([1,alpha],[100,alpha],purple,1,2);dot(m,r.unadjusted,orange,5);dot(m,r.bonferroni,teal,5);
    values(`${fmt(100*r.unadjusted,2)}% → ${fmt(100*r.bonferroni,2)}%`,`m=${m}；校正后每项阈值 α/m=${fmt(r.perTest,6)}。`);
    smallMetrics([[m,"检验数量"],[fmt(r.unadjusted),"未校正 FWER"],[fmt(r.bonferroni),"校正 FWER（独立）"]]);
    setMath('独立且全为真零假设时：FWER = 1 − (1 − α)^m',"FWER 表示至少一次 I 类错误的概率。Bonferroni 保证 FWER≤α，但校正会降低单项功效，须预先定义检验家族。",'\\mathrm{FWER}=1-(1-\\alpha)^m,\\quad \\alpha_{\\mathrm{Bonf}}=\\alpha/m');
    $("#plot-caption").textContent="横轴：检验数 m；纵轴：至少一次误报的概率（0–1）。圆点标出当前 m。";
    table(["检验数量","未校正 FWER","Bonferroni 单项阈值","校正 FWER（独立）"],xs.map((x,i)=>[x,rows[i].unadjusted,rows[i].perTest,rows[i].bonferroni]));
  });
}
const residualPoints=[[-3,-1.4],[-2.5,-2.2],[-2,-.6],[-1.5,-.8],[-1,.5],[-.5,-.4],[0,1.5],[.5,.8],[1,2.2],[1.5,1.8],[2,3.5],[2.5,2.6],[3,4.1]];
function residualsLab() {
  scaffold(number("slope","直线斜率 b",.3,-2,2)+number("intercept","直线截距 a",0,-3,3)+'<button class="button primary full" id="fit">设为最小二乘解</button>',
    ["绿色：合成观测", "橙色：当前直线", "紫色线段：竖直残差"],
    ["先手动调整斜率和截距，让残差平方和尽量小。","点击“设为最小二乘解”，比较 SSE。","观察正负残差为什么都要平方。"],
    "最小二乘最小化的是点到直线的最短距离吗？","这里最小化的是竖直方向的残差平方和，不是几何垂距。含截距的 OLS 在解处残差和为零；最小 SSE 不代表因果关系，也不保证预测有效。");
  bind(()=>{
    const a=num("intercept"),b=num("slope"),r=StatsExtra.residuals(residualPoints,b,a),ys=r.rows.flatMap(x=>[x.y,x.predicted]),[lo,hi]=spanFor(ys);
    init([-4,hi,4,lo]);r.rows.forEach(p=>{segment([p.x,p.y],[p.x,p.predicted],purple,1.5);dot(p.x,p.y);});segment([-3.5,a-3.5*b],[3.5,a+3.5*b],orange,2.5);
    values(`SSE = ${fmt(r.sse)}`,`最小 SSE=${fmt(r.minSSE)}；最优斜率 ${fmt(r.slope)}，截距 ${fmt(r.intercept)}。`);
    smallMetrics([[residualPoints.length,"观测数"],[fmt(r.sse-r.minSSE),"距离最小 SSE"],[fmt(r.rows.reduce((s,x)=>s+x.residual,0)),"残差和"]]);
    setMath(`ŷ = ${fmt(a)} + ${fmt(b)}x`,"数据为固定合成示例。可输入小数调整斜率和截距；最小二乘按钮使用完整计算精度。",'\\mathrm{SSE}=\\sum_i(y_i-a-bx_i)^2');
    $("#plot-caption").textContent="横轴：预测变量 x；纵轴：结果变量 y。竖线从观测点连到当前回归线，不是垂线距离。";
    table(["x","y","预测值","残差","残差平方"],r.rows.map(p=>[p.x,p.y,p.predicted,p.residual,p.residual*p.residual]));
  });
  $("#fit").onclick=()=>{
    const r=StatsExtra.residuals(residualPoints,0,0);
    for(const [id,value] of [["slope",r.slope],["intercept",r.intercept]]) {
      $("#"+id).value=String(value);
    }
    $("#slope").dispatchEvent(new Event("input",{bubbles:true}));
  };
}
function groupsLab() {
  scaffold(range("offset","组间反向位移",3,0,6,.1)+range("slope","组内趋势斜率",.8,.2,1.5,.1)+seedField(),
    ["绿色：A 组及组内回归线", "紫色：B 组及组内回归线", "橙色虚线：汇总回归线"],
    ["先看每个组内的趋势，再看汇总趋势。","把组间位移从 0 增大到 6。","比较组内 r 与汇总 r，并讨论分组变量的含义。"],
    "汇总后的相关方向为什么会反转？","组间均值的关系可能盖过组内关系，这是一种 Simpson 悖论式的汇总现象。是否应分组或控制变量取决于设计和因果结构；不能仅根据图形决定调整方案，也不能把任一相关直接解释为因果。");
  bind(()=>{
    const r=StatsExtra.grouped(num("offset"),num("slope"),num("seed")),[lo,hi]=spanFor(r.all.map(p=>p[1]));
    init([-6,hi,6,lo]);r.a.forEach(p=>dot(...p,teal));r.b.forEach(p=>dot(...p,purple));
    [[r.fitA,-5,-1,teal],[r.fitB,1,5,purple],[r.fit,-5,5,orange]].forEach(([f,a,b,c])=>segment([a,f.b+f.m*a],[b,f.b+f.m*b],c,2,c===orange?2:0));
    values(`汇总 r = ${fmt(r.pooled)}`,`A 组 r=${fmt(r.ra)}；B 组 r=${fmt(r.rb)}。两组各 24 个合成观测。`);
    smallMetrics([[fmt(r.ra),"A 组相关"],[fmt(r.rb),"B 组相关"],[fmt(r.pooled),"汇总相关"]]);
    setMath('组内趋势 ≠ 组间趋势；汇总可能改变方向',"此示例两组复用同一组噪声以突出组间位移，因此组内相关相同；不是独立抽样的研究数据。",'\\operatorname{Cov}(X,Y)=E[\\operatorname{Cov}(X,Y\\mid G)]+\\operatorname{Cov}(E[X\\mid G],E[Y\\mid G])');
    $("#plot-caption").textContent="横轴：合成变量 x；纵轴：合成变量 y。分组由已知生成机制设定，观察相关不等于识别因果。";
    table(["组别","x","y"],r.a.map(p=>["A",...p]).concat(r.b.map(p=>["B",...p])));
  });
}

function demoDirectory() {
  return `<section class="demo-directory"><div class="section-heading"><div><h2>18 个演示，按章节展开</h2><p>选一个问题开始；每个演示都可导出图形和数值表。</p></div></div><div class="demo-directory-grid">${topics.filter(t=>!t.advanced).map(t=>`<div><h3>${t.title}</h3>${chapterModules[t.id].map((m,i)=>`<a href="#${t.id}${m[0]==="main"?"":"/"+m[0]}"><span>0${i+1}</span>${m[1]} ↗</a>`).join("")}</div>`).join("")}</div></section>`;
}
