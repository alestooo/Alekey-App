export const currency = (value) => {
  return `C ${(value || 0).toLocaleString()}`;
};

export const formatPhone = (value) => {
  const digits = (value || "")
    .replace(/\D/g, "")
    .substring(0, 8);

  return digits.length > 4
    ? `${digits.slice(0, 4)}-${digits.slice(4)}`
    : digits;
};

export const capitalize = (value) => {
  const clean = (value || "").replace(/\d/g, "");

  return clean
    .toLowerCase()
    .split(" ")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
};

export const generateId = () => {
  const random = crypto
    .randomUUID()
    .split("-")[0]
    .toUpperCase();

  return `ALK-${Date.now()
    .toString()
    .slice(-5)}-${random}`;
};

export const getThemeColorClass = (tema) => {
  if (tema === "LAMINADO...") {
    return "bg-blue-50 border-blue-200 text-blue-600";
  }

  if (tema === "ENVIO...") {
    return "bg-green-50 border-green-200 text-green-600";
  }

  if (tema === "FALTA...") {
    return "bg-red-50 border-red-200 text-red-600";
  }

  if (tema === "OTROS...") {
    return "bg-purple-50 border-purple-200 text-purple-600";
  }

  return "bg-white border-slate-100 focus:border-[#8ED4BE]";
};