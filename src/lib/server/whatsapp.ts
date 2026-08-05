const WHATSAPP_MIN_DIGITS = 8;
const WHATSAPP_MAX_DIGITS = 15;

export function normalizeWhatsApp(value: string): string | undefined {
  const candidate = value.trim();
  if (!candidate || !/^\+[0-9\s()-]+$/.test(candidate)) {
    return undefined;
  }

  const normalized = candidate.replace(/[\s()-]/g, "");
  const pattern = new RegExp(
    `^\\+[1-9]\\d{${WHATSAPP_MIN_DIGITS - 1},${WHATSAPP_MAX_DIGITS - 1}}$`,
  );
  return pattern.test(normalized) ? normalized : undefined;
}

export function whatsappUrl(value: string): string | undefined {
  const normalized = normalizeWhatsApp(value);
  return normalized ? `https://wa.me/${normalized.slice(1)}` : undefined;
}
