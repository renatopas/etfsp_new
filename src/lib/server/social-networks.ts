export const SOCIAL_NETWORK_MAX_LENGTH = 500;

export const SOCIAL_NETWORKS = {
  Instagram: {
    label: "Instagram",
    domain: "instagram.com",
  },
  Facebook: {
    label: "Facebook",
    domain: "facebook.com",
  },
  LinkedIn: {
    label: "LinkedIn",
    domain: "linkedin.com",
  },
} as const;

export type SocialNetworkField = keyof typeof SOCIAL_NETWORKS;

export function normalizeSocialNetworkUrl(
  value: string,
  field: SocialNetworkField,
): string | undefined {
  const candidate = value.trim();
  if (!candidate || candidate.length > SOCIAL_NETWORK_MAX_LENGTH) {
    return undefined;
  }

  try {
    const url = new URL(candidate);
    const authority = candidate
      .slice(candidate.indexOf("//") + 2)
      .split(/[/?#]/, 1)[0];
    const expectedDomain = SOCIAL_NETWORKS[field].domain;
    const hostname = url.hostname.toLowerCase();
    const isOfficialDomain =
      hostname === expectedDomain || hostname.endsWith(`.${expectedDomain}`);

    if (
      url.protocol !== "https:" ||
      !isOfficialDomain ||
      url.username ||
      url.password ||
      url.port ||
      authority.includes(":")
    ) {
      return undefined;
    }

    url.hash = "";
    const normalized = url.toString();
    return normalized.length <= SOCIAL_NETWORK_MAX_LENGTH
      ? normalized
      : undefined;
  } catch {
    return undefined;
  }
}
