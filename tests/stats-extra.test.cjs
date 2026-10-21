const {test}=require('node:test'),assert=require('node:assert/strict'),S=require('../dist/stats-core.js'),E=require('../dist/stats-extra.js');
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol,`${a} != ${b}`);
test('type 7 quartiles and IQR whiskers use actual observations without modifying data',()=>{
  const data=[20,5,4,3,2,1],before=[...data],r=E.boxplot(data);
  close(r.q1,2.25);close(r.q3,4.75);close(r.low,-1.5);close(r.high,8.5);
  assert.equal(r.whiskerLow,1);assert.equal(r.whiskerHigh,5);assert.deepEqual(r.outliers,[20]);assert.deepEqual(data,before);
  assert.equal(E.quantile([1,2,3],1),3);assert.equal(E.boxplot([4,4]).iqr,0);
});
test('standardization has zero mean and sample variance one, invariant under positive affine transform',()=>{
  const r=E.standardize([1,2,3,4,5],100,2);close(S.describe(r.z).mean,0);close(S.describe(r.z).sd,1);
  r.z.forEach((z,i)=>close(z,(r.transformed[i]-r.mean)/r.sd));assert.throws(()=>E.standardize([4,4],0,1));
});
test('t critical values match independent reference including Cauchy df 1',()=>{
  for(const [df,c]of [[1,12.706204736175],[9,2.262157162798],[30,2.042272456301]])close(E.tReference(df,.05).t,c,1e-6);
});
test('Bayes reverses conditioning with base rate, handles null condition and sums to one',()=>{
  const r=E.bayes(.01,.9,.05);close(r.posterior,.153846153846);close(r.yesSignal+r.yesNoise+r.noSignal+r.noNoise,1);
  assert.equal(E.bayes(0,1,0).posterior,null);assert.equal(E.bayes(1,1,0).posterior,1);assert.equal(E.bayes(0,0,1).posterior,0);
});
test('SE decreases by two for fourfold sample size, not four',()=>{close(E.standardError(5,10),4.472135955);close(E.standardError(20,10),E.standardError(5,10)/2);});
test('bootstrap resamples with replacement, seed reproducibility, prefix and confidence use same draws',()=>{
  const a=E.bootstrap([1,2,3],1000,.95,2026),b=E.bootstrap([1,2,3],2000,.99,2026);
  assert.deepEqual(a.means,b.means.slice(0,1000));assert.deepEqual(a,E.bootstrap([1,2,3],1000,.95,2026));
  const c=E.bootstrap([1,2,3],1000,.99,2026);assert.deepEqual(a.means,c.means);assert.ok(c.lo<=a.lo && c.hi>=a.hi);
  assert.ok(new Set(a.means).size>1);assert.ok(a.means.every(x=>x>=1&&x<=3));assert.ok(Math.abs(a.se-Math.sqrt(2/9))<.04);
  assert.throws(()=>E.bootstrap([4,4],100,.95,1));
});
test('single-sample t interval agrees with independent integration reference',()=>{
  const r=E.meanInterval([1,2,3,4,5],.95);close(r.lo,1.036756838522,1e-6);close(r.hi,4.963243161478,1e-6);
  assert.throws(()=>E.meanInterval([2,2],.95));
});
test('Wilson NIST example, endpoint symmetry and raw Wald out-of-bounds',()=>{
  const r=E.proportion(8,30,.95);close(r.lo,.141826633196);close(r.hi,.444479616952);
  const a=E.proportion(0,10,.95),b=E.proportion(10,10,.95);close(a.hi,.277532799863);close(a.lo,0);close(b.lo,1-a.hi);close(b.hi,1);
  assert.equal(a.waldHi,0);assert.ok(E.proportion(1,10,.95).waldLo<0);
});
test('power matches independent normal reference, sign symmetry and null rejection alpha',()=>{
  close(E.power(25,5,10,.05).power,.705418001114);close(E.power(100,5,10,.05).power,.998817250704);
  for(const n of [2,25,500])for(const alpha of [.01,.05,.1]){close(E.power(n,0,10,alpha).power,alpha);close(E.power(n,5,10,alpha).power,E.power(n,-5,10,alpha).power);}
});
test('multiplicity FWER and Bonferroni control hold over entire UI range',()=>{
  const r=E.multiplicity(20,.05);close(r.unadjusted,.641514077591);close(r.bonferroni,.048830124747);close(r.perTest,.0025);
  for(let m=1;m<=100;m++)for(const a of [.01,.05,.1])assert.ok(E.multiplicity(m,a).bonferroni<=a+1e-14);
});
test('manual residuals vs OLS optimum, normal equations and undefined predictor variance',()=>{
  const p=[[1,1],[2,2],[3,2]],r=E.residuals(p,1,0);close(r.sse,1);close(r.minSSE,1/6);close(r.slope,.5);close(r.intercept,2/3);
  const fit=E.residuals(p,r.slope,r.intercept);close(fit.sse,r.minSSE);close(fit.rows.reduce((s,x)=>s+x.residual,0),0);
  assert.throws(()=>E.residuals([[1,1],[1,2],[1,3]],0,0));
});
test('default grouped synthetic data exhibit reversal while group fits remain positive',()=>{
  const r=E.grouped(3,.8,2026);assert.ok(r.ra>.9 && r.rb>.9 && r.pooled<-.5);assert.ok(r.fitA.m>0 && r.fitB.m>0 && r.fit.m<0);
  assert.deepEqual(r,E.grouped(3,.8,2026));assert.equal(r.all.length,48);
});
test('new statistical methods reject invalid boundaries and nonfinite values',()=>{
  for(const f of [()=>E.quantile([],0),()=>E.quantile([1,2],NaN),()=>E.tReference(0,.05),()=>E.bayes(.1,2,.1),()=>E.standardError(1.5,10),()=>E.bootstrap([1,2],100.5,.95,1),()=>E.proportion(21,20,.95),()=>E.proportion(1,0,.95),()=>E.power(10,1,0,.05),()=>E.multiplicity(0,.05),()=>E.grouped(7,1,1)])assert.throws(f);
});
