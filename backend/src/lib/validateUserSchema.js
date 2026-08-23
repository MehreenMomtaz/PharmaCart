const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateSignupData = (input = {}) => {
  const fullName = String(input.fullName || "").trim();
  const email = String(input.email || "").trim().toLowerCase();
  const password = String(input.password || "");
  const errors = {};

  if (!fullName) errors.fullName = "Name required";
  if (!emailPattern.test(email)) errors.email = "Invalid email";
  if (password.length < 6) errors.password = "Minimum password length is 6";

  return {
    success: Object.keys(errors).length === 0,
    errors,
    data: { fullName, email, password },
  };
};
