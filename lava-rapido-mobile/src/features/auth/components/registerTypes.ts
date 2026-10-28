export type DocumentType = 'CC' | 'TI' | 'CE';

export const isTenDigitDocumentType = (documentType: DocumentType) =>
  documentType === 'CC' || documentType === 'TI';

export const normalizeDocumentNumber = (value: string, documentType: DocumentType) => {
  const digitsOnly = value.replace(/\D/g, '');
  return isTenDigitDocumentType(documentType) ? digitsOnly.slice(0, 10) : digitsOnly;
};
