export function generateSixDigitCode(expiryMinutes = 10) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + expiryMinutes * 60 * 1000);
  return { code, expiry };
}
