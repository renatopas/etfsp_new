import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";

export async function validateRequest(
  formData: FormData,
  headers: Headers,
): Promise<boolean> {
  const token = formData.get("cf-turnstile-response");
  const ip = headers.get("CF-Connecting-IP");

  if (!token || !ip) {
    return false;
  }

  let data = new FormData();

  if (dev) {
    env.CF_TURNSTILE_SECRET = "1x0000000000000000000000000000000AA";
  }
  if (!env.CF_TURNSTILE_SECRET) {
    throw new ReferenceError("CF_TURNSTILE_SECRET must be set");
  }

  data.append("secret", env.CF_TURNSTILE_SECRET);
  data.append("response", token);
  data.append("remoteip", ip);

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      body: data,
      method: "POST",
    },
  );
  const outcome = await response.json();
  if (!outcome.success) {
    return false;
  }
  return true;
}
