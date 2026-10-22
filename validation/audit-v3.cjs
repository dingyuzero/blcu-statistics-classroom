const A = require("../dist/stats-advanced.js"),
  r = {
    hotelling: [],
    multiple: [],
    eigen: [],
    nested: [],
    mediation: A.mediation(0.5, 0.6, 0.1, 50, 2026, 400),
  };
for (const rho of [-0.9, 0, 0.6, 0.9])
  for (const n1 of [5, 30, 150])
    for (const n2 of [5, 30, 150])
      for (const d of [
        [0, 0],
        [1, -0.5],
        [2, 2],
      ])
        r.hotelling.push({
          args: [...d, rho, n1, n2],
          value: A.hotelling(...d, rho, n1, n2),
        });
for (const rho of [-0.95, -0.3, 0, 0.6, 0.95])
  r.multiple.push({ args: [rho, 0.5, 1], value: A.multiple(rho, 0.5, 1) });
for (const l of [0.1, 0.5, 0.75, 0.95])
  for (const rho of [0, 0.3, 0.9])
    r.eigen.push({
      matrix: A.factorMatrix(l, rho),
      values: A.eigenvalues(A.factorMatrix(l, rho)),
    });
for (const rho of [-0.8, -0.05, 0, 0.3, 0.8])
  for (const n of [20, 100, 500])
    r.nested.push({ args: [rho, n], value: A.nested(rho, n) });
console.log(JSON.stringify(r));
