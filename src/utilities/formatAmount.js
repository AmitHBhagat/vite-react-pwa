export const formatAmount = (amount, fixed = 2) => {
  if (amount === undefined || amount === null) {
    return "";
  }

  try {
    return amount.toFixed(fixed);
  } catch (error) {
    console.error("Error formatting amount:", error);
    return amount;
  }
};
