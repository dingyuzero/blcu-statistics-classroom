"""Independent numerical oracle: run from any directory, requires NumPy/SciPy."""
import subprocess,json,hashlib,platform
from pathlib import Path
import numpy as np
import scipy
from scipy import stats
root=Path(__file__).resolve().parents[1]
data=json.loads(subprocess.check_output(['node',str(root/'validation/audit.cjs')],cwd=root))
errors={k:[] for k in data}
for r in data['normal']:
 a,b,mu,sd=r['args']; reference=stats.norm.sf(a)-stats.norm.sf(b) if a>=0 else stats.norm.cdf(b)-stats.norm.cdf(a)
 error=abs(r['actual']-reference);errors['normal'].append(error)
 assert error<=max(3e-14,abs(reference)*3e-10),(r,reference)
for r in data['binomial']:
 n,p,k=r['args']; ref=stats.binom.cdf(k,n,p);error=abs(r['actual']-ref);errors['binomial'].append(error);assert error<1e-10
for r in data['welch']:
 n1,m1,s1,n2,m2,s2,alpha=r['args'];v=r['actual'];t,p=stats.ttest_ind_from_stats(m2,s2,n2,m1,s1,n1,equal_var=False)
 se=np.sqrt(s1*s1/n1+s2*s2/n2);crit=stats.t.ppf(1-alpha/2,v['df'])
 for key,ref in [('t',t),('p',p),('lo',m2-m1-crit*se),('hi',m2-m1+crit*se),('critical',crit)]:
  error=abs(v[key]-ref);errors['welch'].append(error);assert error<2e-6,(key,v[key],ref)
for case in data['intervals']:
 crit=stats.t.ppf((1+case['level'])/2,case['n']-1)
 for r in case['rows']:
  margin=crit*r['sd']/np.sqrt(case['n']);error=max(abs(r['lo']-(r['mean']-margin)),abs(r['hi']-(r['mean']+margin)));errors['intervals'].append(error);assert error<2e-6
for r in data['regression']:
 xy=np.array(r['points']);fit=stats.linregress(xy[:,0],xy[:,1]);error=max(abs(r['slope']-fit.slope),abs(r['intercept']-fit.intercept),abs(r['r']-fit.rvalue));errors['regression'].append(error);assert error<1e-12
result={'status':'passed','core_sha256':hashlib.sha256((root/'dist/stats-core.js').read_bytes()).hexdigest(),'oracle':{'python':platform.python_version(),'scipy':scipy.__version__},'seed':20261020,'checks':{k:{'comparisons':len(v),'maximum_absolute_error':max(v)}for k,v in errors.items()},'scope':'Finite seeded cases over UI input range; no claim of universal accuracy. CI oracle checks endpoints from simulated sample summaries; regression from generated paired points.'}
(root/'validation/reference-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False))
