export const SITE_ORIGIN = "https://etfsp.com";

export function absoluteSiteUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).href;
}
