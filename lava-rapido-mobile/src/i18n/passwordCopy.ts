export const passwordCopy = {
  es: {
    accessibility: { passwordRequirements: 'Mínimo 8 caracteres.' },
    register: {
      passwordRequirements: 'Mínimo 8 caracteres.',
      maxUtf8Bytes: 'La contraseña es demasiado larga. Prueba con una más corta.',
      minLength: 'Mínimo 8 caracteres.',
      invalidPassword: 'La contraseña debe tener mínimo 8 caracteres.',
      passwordTooLong: 'La contraseña es demasiado larga. Prueba con una más corta.',
    },
    changePassword: { invalidPassword: 'La contraseña debe tener mínimo 8 caracteres.' },
    resetPassword: {
      passwordRequirements: 'Mínimo 8 caracteres.',
      passwordTooLong: 'La contraseña es demasiado larga. Prueba con una más corta.',
    },
  },
  en: {
    accessibility: { passwordRequirements: 'Minimum 8 characters.' },
    register: {
      passwordRequirements: 'Minimum 8 characters.',
      maxUtf8Bytes: 'The password is too long. Try a shorter one.',
      minLength: 'Minimum 8 characters.',
      invalidPassword: 'The password must have at least 8 characters.',
      passwordTooLong: 'The password is too long. Try a shorter one.',
    },
    changePassword: { invalidPassword: 'The password must have at least 8 characters.' },
    resetPassword: {
      passwordRequirements: 'Minimum 8 characters.',
      passwordTooLong: 'The password is too long. Try a shorter one.',
    },
  },
  pt: {
    accessibility: { passwordRequirements: 'Mínimo de 8 caracteres.' },
    register: {
      passwordRequirements: 'Mínimo de 8 caracteres.',
      maxUtf8Bytes: 'A senha é muito longa. Tente uma mais curta.',
      minLength: 'Mínimo de 8 caracteres.',
      invalidPassword: 'A senha deve ter no mínimo 8 caracteres.',
      passwordTooLong: 'A senha é muito longa. Tente uma mais curta.',
    },
    changePassword: { invalidPassword: 'A senha deve ter no mínimo 8 caracteres.' },
    resetPassword: {
      passwordRequirements: 'Mínimo de 8 caracteres.',
      passwordTooLong: 'A senha é muito longa. Tente uma mais curta.',
    },
  },
  fr: {
    accessibility: { passwordRequirements: 'Au moins 8 caractères.' },
    register: {
      passwordRequirements: 'Au moins 8 caractères.',
      maxUtf8Bytes: 'Le mot de passe est trop long. Essayez-en un plus court.',
      minLength: 'Au moins 8 caractères.',
      invalidPassword: 'Le mot de passe doit comporter au moins 8 caractères.',
      passwordTooLong: 'Le mot de passe est trop long. Essayez-en un plus court.',
    },
    changePassword: { invalidPassword: 'Le mot de passe doit comporter au moins 8 caractères.' },
    resetPassword: {
      passwordRequirements: 'Au moins 8 caractères.',
      passwordTooLong: 'Le mot de passe est trop long. Essayez-en un plus court.',
    },
  },
} as const;
