"""Independent NumPy/SciPy numerical oracle for advanced teaching models."""
import json, subprocess
from pathlib import Path
import numpy as np
from scipy import stats
root=Path(__file__).resolve().parents[1]
d=json.loads(subprocess.check_output(['node',str(root/'validation/audit-v3.cjs')],cwd=root,text=True,encoding='utf-8'))
checks=0; worst=0.
def check(a,b):
 global checks,worst
 a,b=np.asarray(a,dtype=float),np.asarray(b,dtype=float)
 np.testing.assert_allclose(a,b,rtol=2e-7,atol=1e-10)
 checks+=a.size;worst=max(worst,float(np.max(np.abs(a-b))))
for x in d['hotelling']:
 dx,dy,r,n1,n2=x['args']; v=x['value'];delta=np.array([dx,dy]);S=np.array([[1,r],[r,1]])
 t2=n1*n2/(n1+n2)*(delta@np.linalg.solve(S,delta));f=(n1+n2-3)*t2/(2*(n1+n2-2))
 check([v['T2'],v['F'],v['p']],[t2,f,stats.f.sf(f,2,n1+n2-3)])
for x in d['multiple']:
 v=x['value'];X=np.array([[1,r['x'],r['z']] for r in v['rows']]);y=np.array([r['y'] for r in v['rows']]);b=np.linalg.lstsq(X,y,rcond=None)[0];res=y-X@b;se=np.sqrt(np.diag(np.linalg.inv(X.T@X))*np.sum(res**2)/(len(y)-3))
 check(v['fit']['beta'],b);check(v['fit']['se'],se);check(v['fit']['res'],res)
for x in d['eigen']:check(x['values'],np.linalg.eigvalsh(x['matrix'])[::-1])
for x in d['nested']:
 r,n=x['args'];chi=-(n-1)*np.log1p(-r*r);check(x['value']['chi'],chi);check(x['value']['p'],stats.chi2.sf(chi,1))
v=d['mediation'];data=v['data'];X=np.array([r['x'] for r in data]);M=np.array([r['m'] for r in data]);Y=np.array([r['y'] for r in data]);one=np.ones(len(X))
def product(idx):return np.linalg.lstsq(np.array([one[idx],X[idx]]).T,M[idx],rcond=None)[0][1]*np.linalg.lstsq(np.array([one[idx],X[idx],M[idx]]).T,Y[idx],rcond=None)[0][2]
check(v['estimate'],product(np.arange(len(X))))
state=2026+81
def uniform():
 global state
 state=(1664525*state+1013904223)&0xffffffff
 return (state+.5)/2**32
boot=sorted(product(np.array([int(uniform()*len(X)) for _ in range(len(X))])) for _ in range(400))
check(v['boot'],boot);check([v['lo'],v['hi']],np.quantile(boot,[.025,.975],method='linear'))
out={'oracle':'NumPy/SciPy','scalar_comparisons':checks,'max_absolute_error':worst,'passed':True,'scope':['Hotelling F tails','OLS coefficients and standard errors','symmetric eigenvalues','normal-theory nested covariance models','paired mediation bootstrap and type 7 intervals']}
(root/'validation/reference-v3-results.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out))
