export const generateOTP = (length = 5): string => {
  return Math.random()
    .toString()
    .slice(2, 2 + length);
};
