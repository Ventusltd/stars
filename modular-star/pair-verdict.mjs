// Thresholds apply to actual red observations, never to 1 minus a smoothed green probability.
export function pairVerdict({ green, red, total }) {
  if (!Number.isInteger(total) || total < 0 || !Number.isInteger(green) || green < 0 || !Number.isInteger(red) || red < 0 || green + red > total) throw new Error('Invalid composition-test counts');
  if (!total) return 'untested';
  if (total >= 3 && red / total >= 0.9) return 'unstable';
  if (total >= 3 && green === total) return 'proven';
  return 'mixed evidence';
}
