export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_UTF8_BYTES = 72;

export function getPasswordUtf8ByteLength(password: string): number {
  let byteLength = 0;

  for (let index = 0; index < password.length; index += 1) {
    const codeUnit = password.charCodeAt(index);

    if (codeUnit <= 0x7f) {
      byteLength += 1;
    } else if (codeUnit <= 0x7ff) {
      byteLength += 2;
    } else if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const nextCodeUnit = password.charCodeAt(index + 1);
      if (nextCodeUnit >= 0xdc00 && nextCodeUnit <= 0xdfff) {
        byteLength += 4;
        index += 1;
      } else {
        // Java String.getBytes(UTF_8) replaces malformed input with one '?'.
        byteLength += 1;
      }
    } else {
      // Match Java's one-byte replacement for a standalone low surrogate.
      byteLength += 1;
    }
  }

  return byteLength;
}

export function isValidPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH
    && getPasswordUtf8ByteLength(password) <= MAX_PASSWORD_UTF8_BYTES;
}

export function passwordsMatch(password: string, confirmation: string): boolean {
  return confirmation.length > 0 && password === confirmation;
}
