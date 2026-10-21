"""Independent v2 oracle. Install numpy/scipy separately; no production dependency."""
from pathlib import Path
import json, subprocess, hashlib, platform
import numpy as np
import scipy
from scipy import stats
root=Path(__file__).resolve().parents[1]
d=json.loads(subprocess.check_output(['node',str(root/'validation/audit-v2.cjs')],cwd=root))
errors={k:[] for k in d}
def check(group,a,b,atol=2e-6,rtol=2e-8):
    e=abs(a-b);errors[group].append(e)
    assert e<=atol+rtol*abs(b),(group,a,b,e)
for r in d['student']:
    check('student',r['value']['t'],stats.t.ppf(1-r['alpha']/2,r['df']))
    check('student',r['value']['z'],stats.norm.ppf(1-r['alpha']/2))
for r in d['proportion']:
    n,k,c=r['n'],r['k'],r['c'];p=k/n;z=stats.norm.ppf((1+c)/2)
    ctr=(k+z*z/2)/(n+z*z);half=z*np.sqrt(k*(1-p)+z*z/4)/(n+z*z)
    for key,value in [('lo',max(0,ctr-half)),('hi',min(1,ctr+half)),('waldLo',p-z*np.sqrt(p*(1-p)/n)),('waldHi',p+z*np.sqrt(p*(1-p)/n))]:check('proportion',r['value'][key],value,1e-12,1e-12)
for r in d['power']:
    l=r['d']*np.sqrt(r['n'])/r['s'];z=stats.norm.ppf(1-r['a']/2)
    check('power',r['value']['power'],stats.norm.cdf(-z-l)+stats.norm.sf(z-l),1e-12,1e-12)
for r in d['multiple']:
    check('multiple',r['value']['unadjusted'],1-(1-r['a'])**r['m'],1e-12,1e-12)
    check('multiple',r['value']['bonferroni'],1-(1-r['a']/r['m'])**r['m'],1e-12,1e-12)
for r in d['mean']:
    x=np.array(r['data']);margin=stats.t.ppf((1+r['c'])/2,len(x)-1)*stats.sem(x)
    check('mean',r['value']['lo'],np.mean(x)-margin);check('mean',r['value']['hi'],np.mean(x)+margin)
for r in d['bootstrap']:
    state=r['seed'];means=[];x=r['data']
    for _ in range(r['B']):
        sample=[]
        for _ in x:
            state=(1664525*state+1013904223)%2**32
            sample.append(x[int(((state+.5)/2**32)*len(x))])
        means.append(sum(sample)/len(sample))
    for a,b in zip(r['value']['means'],means):check('bootstrap',a,b,1e-12,1e-12)
    check('bootstrap',r['value']['se'],np.std(means,ddof=1))
    lo,hi=np.quantile(means,[(1-r['c'])/2,(1+r['c'])/2],method='linear')
    check('bootstrap',r['value']['lo'],lo);check('bootstrap',r['value']['hi'],hi)
for r in d['groups']:
    for points,key in [('a','ra'),('b','rb'),('all','pooled')]:
        x=np.array(r[points]);check('groups',r[key],np.corrcoef(x.T)[0,1],1e-12,1e-12)
    x=np.array(r['all']);fit=stats.linregress(x[:,0],x[:,1]);check('groups',r['fit']['m'],fit.slope,1e-12,1e-12)
for r in d['residuals']:
    xy=np.array(r['points']);x=xy[:,0];y=xy[:,1];a,b=np.linalg.lstsq(np.column_stack((np.ones(len(x)),x)),y,rcond=None)[0]
    check('residuals',r['value']['sse'],np.sum((y-.7-.3*x)**2));check('residuals',r['value']['minSSE'],np.sum((y-a-b*x)**2));check('residuals',r['value']['slope'],b);check('residuals',r['value']['intercept'],a)
result={'status':'passed','date':'2026-10-21','oracle':{'python':platform.python_version(),'scipy':scipy.__version__},'source_sha256':hashlib.sha256((root/'dist/stats-extra.js').read_bytes()).hexdigest(),'checks':{k:{'comparisons':len(v),'maximum_absolute_error':max(v)}for k,v in errors.items()},'scope':'Finite cases over documented boundaries. Bootstrap reuses the declared LCG but independent sampling, quantiles and SD in Python; no claim of universal or clinical validity.'}
(root/'validation/reference-v2-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,ensure_ascii=False))
