const RESET_PATH = '/reset-password';

export type PasswordResetLinkResult =
  | { valid: true; token: string }
  | { valid: false };

/**
 * Reads reset URLs only from the configured web origin. This keeps unrelated
 * URLs from navigating into the password-reset flow.
 */
export function extractPasswordResetToken(
  incomingUrl: string,
  configuredResetUrl: string | undefined,
): PasswordResetLinkResult {
  if (!configuredResetUrl) return { valid: false };

  try {
    const allowed = new URL(configuredResetUrl);
    const incoming = new URL(incomingUrl);

    if (
      allowed.protocol !== 'https:' ||
      allowed.pathname !== RESET_PATH ||
      incoming.protocol !== 'https:' ||
      allowed.origin !== incoming.origin ||
      incoming.pathname !== RESET_PATH
    ) {
      return { valid: false };
    }

    const token = incoming.searchParams.get('token')?.trim();
    return token ? { valid: true, token } : { valid: false };
  } catch {
    return { valid: false };
  }
}
