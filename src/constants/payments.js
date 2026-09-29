export const PAYMENT_PLACEHOLDER =
  "Pago...";

export const PAYMENT_OPTIONS = [
  PAYMENT_PLACEHOLDER,
  "Efectivo",
  "Tarjeta",
  "Sinpe",
  "Centro Educativo",
  "Transferencia",
  "Cheque",
  "DEBE",
];

export function isDebtPayment(
  paymentMethod
) {
  return (
    String(
      paymentMethod || ""
    )
      .trim()
      .toUpperCase() ===
    "DEBE"
  );
}