(function (root, factory) {
  if (typeof module === 'object' && module.exports)
    module.exports = factory(require('./stats-core.js'), require('jstat').jStat, require('simple-statistics'));
  else root.StatsExtra = factory(root.Stats, root.jStat, root.ss);
})(typeof window === 'undefined' ? globalThis : window, function (S, j, ss) {
  'use strict';
  const bound = S.bounded, integer = S.integer;
  function quantile(data, p) {
    bound(p, 0, 1, '分位点');
    if (!data.length || data.some(x => !Number.isFinite(x))) throw Error('分位数需要有限数值。');
    const x = [...data].sort((a,b) => a-b), h = (x.length-1)*p, i = Math.floor(h);
    return x[i] + (h-i)*((x[i+1] ?? x[i])-x[i]);
  }
  function boxplot(data) {
    const d = S.describe(data), low = d.q1-1.5*d.iqr, high = d.q3+1.5*d.iqr;
    const inside = data.filter(x => x >= low && x <= high);
    return {...d, low, high, whiskerLow:Math.min(...inside), whiskerHigh:Math.max(...inside), outliers:data.filter(x=>x<low || x>high)};
  }
  function standardize(data, shift, scale) {
    bound(shift,-1000,1000,'平移量'); bound(scale,0.1,5,'缩放倍数');
    const d = S.describe(data);
    if (d.sd === 0) throw Error('所有观测相同，样本标准差为 0，不能计算 z 分数。');
    const transformed = data.map(x => shift+scale*x), z = data.map(x => (x-d.mean)/d.sd);
    return {original:d, transformed, z, mean:shift+scale*d.mean, sd:scale*d.sd};
  }
  function tReference(df, alpha) {
    integer(df,1,200,'自由度'); bound(alpha,0.001,0.2,'尾部概率');
    return {t:j.studentt.inv(1-alpha/2,df), z:j.normal.inv(1-alpha/2,0,1)};
  }
  function bayes(base, hit, falseAlarm) {
    [base,hit,falseAlarm].forEach(x=>bound(x,0,1,'概率'));
    const yesSignal=base*hit, yesNoise=(1-base)*falseAlarm, yes=yesSignal+yesNoise;
    return {yesSignal, yesNoise, noSignal:base*(1-hit), noNoise:(1-base)*(1-falseAlarm), yes, posterior:yes===0?null:yesSignal/yes};
  }
  function standardError(n, sigma) {
    integer(n,1,500,'样本量'); bound(sigma,0.1,100,'总体标准差');
    return sigma/Math.sqrt(n);
  }
  function bootstrap(data, repetitions, confidence, seed) {
    const d = S.describe(data); integer(repetitions,100,2000,'重抽样次数'); bound(confidence,0.8,0.99,'置信水平');
    if (d.sd===0) throw Error('所有观测相同，经验分布没有变异，Bootstrap 不能据此估计有意义的区间。');
    const rand=S.rng(seed), means=Array.from({length:repetitions},()=>{
      let sum=0; for(let i=0;i<data.length;i++) sum+=data[Math.floor(rand()*data.length)];
      return sum/data.length;
    });
    return {means,mean:d.mean,se:ss.sampleStandardDeviation(means),lo:quantile(means,(1-confidence)/2),hi:quantile(means,(1+confidence)/2)};
  }
  function meanInterval(data, confidence) {
    const d=S.describe(data); bound(confidence,0.8,0.999,'置信水平');
    if(d.sd===0) throw Error('样本标准差为 0，不能用这个样本估计有意义的 t 区间。');
    const se=d.sd/Math.sqrt(d.n), critical=j.studentt.inv((1+confidence)/2,d.n-1);
    return {...d,se,critical,lo:d.mean-critical*se,hi:d.mean+critical*se};
  }
  function proportion(successes,n,confidence) {
    integer(n,1,1000,'试验次数'); integer(successes,0,n,'成功次数'); bound(confidence,0.8,0.999,'置信水平');
    const p=successes/n,z=j.normal.inv((1+confidence)/2,0,1),a=z*z/n,center=(p+a/2)/(1+a),half=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/(1+a),wald=z*Math.sqrt(p*(1-p)/n);
    return {p,z,lo:Math.max(0,center-half),hi:Math.min(1,center+half),waldLo:p-wald,waldHi:p+wald};
  }
  function power(n,delta,sigma,alpha) {
    integer(n,2,500,'样本量'); bound(delta,-20,20,'预设总体均值差'); bound(sigma,0.1,100,'已知总体标准差'); bound(alpha,0.001,0.2,'显著性水平');
    const se=sigma/Math.sqrt(n),z=j.normal.inv(1-alpha/2,0,1),critical=z*se;
    const power=Math.max(0,Math.min(1,j.normal.cdf((-critical-delta)/se,0,1)+j.normal.cdf((delta-critical)/se,0,1)));
    return {se,z,critical,power,beta:1-power};
  }
  function multiplicity(m,alpha) {
    integer(m,1,100,'检验数量'); bound(alpha,0.001,0.2,'显著性水平');
    return {unadjusted:-Math.expm1(m*Math.log1p(-alpha)),perTest:alpha/m,bonferroni:-Math.expm1(m*Math.log1p(-alpha/m))};
  }
  function residuals(points,slope,intercept) {
    bound(slope,-5,5,'斜率'); bound(intercept,-10,10,'截距');
    if(points.length<3 || points.some(p=>p.length!==2 || p.some(x=>!Number.isFinite(x)))) throw Error('需要至少三组有限坐标。');
    if(new Set(points.map(p=>p[0])).size<2) throw Error('自变量必须有变异。');
    const fit=ss.linearRegression(points), rows=points.map(([x,y])=>({x,y,predicted:intercept+slope*x,residual:y-intercept-slope*x}));
    return {rows,sse:ss.sum(rows.map(r=>r.residual*r.residual)),slope:fit.m,intercept:fit.b,minSSE:ss.sum(points.map(([x,y])=>(y-fit.b-fit.m*x)**2))};
  }
  function grouped(offset,slope,seed) {
    bound(offset,0,6,'组间位移'); bound(slope,0.2,1.5,'组内斜率');
    const rand=S.rng(seed), a=[], b=[];
    for(let i=0;i<24;i++) {
      const x=-2+4*i/23, noise=(rand()-.5)*1.2;
      a.push([x-3,slope*x+offset+noise]);
      b.push([x+3,slope*x-offset+noise]);
    }
    const corr=p=>ss.sampleCorrelation(p.map(x=>x[0]),p.map(x=>x[1]));
    return {a,b,all:[...a,...b],ra:corr(a),rb:corr(b),pooled:corr([...a,...b]),fitA:ss.linearRegression(a),fitB:ss.linearRegression(b),fit:ss.linearRegression([...a,...b])};
  }
  return {quantile,boxplot,standardize,tReference,bayes,standardError,bootstrap,meanInterval,proportion,power,multiplicity,residuals,grouped};
});
