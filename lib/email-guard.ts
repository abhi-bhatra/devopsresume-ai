// eslint-disable-next-line @typescript-eslint/no-require-imports
const disposableDomains: string[] = require("disposable-email-domains");

const blocklist = new Set(disposableDomains);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return true;
  return blocklist.has(domain);
}
