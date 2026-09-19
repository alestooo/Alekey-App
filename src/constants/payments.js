export const PAYMENT_METHODS = [
  "Efectivo",
  "Tarjeta",
  "Sinpe",
  "Centro Educativo",
  "Cheque",
  "DEBE",
];

export const PAYMENT_PLACEHOLDER =
  "Pago...";

export const PAYMENT_OPTIONS = [
  PAYMENT_PLACEHOLDER,
  ...PAYMENT_METHODS,
];

export const isDebtPayment = (
  value
) => {
  return (
    String(value || "")
      .trim()
      .toUpperCase() ===
    "DEBE"
  );
};