export const validateName = (value) => {
  const words = (value || "")
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  const hasNumbers = /\d/.test(value || "");

  return (
    words.length >= 3 &&
    !hasNumbers
  );
};