// Error function approximation
function erf(x: number): number {
  // Abramowitz and Stegun formula 7.1.26
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

// Utility: Normal CDF using error function approximation
export function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

// Compute z-score
export function computeZ(raw: number, mu: number, sigma: number): number {
  if (sigma === 0) return 0;
  return (raw - mu) / sigma;
}

// Normalize percentile to 00.000–99.999
export function normalizeScore(percentile: number): number {
  return Math.round(percentile * 99.999 * 1000) / 1000;
}