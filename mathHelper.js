export const calculateDiscount = (price: number, discount: number): number => {
  // Bug: Potential division by zero or negative price handling missing
  return price - (price * (discount / 100));
};

export const formatCurrency = (amount: any) => {
  // Bug: Using 'any' in TypeScript and no type checking
  return `$${amount.toFixed(2)}`;
};