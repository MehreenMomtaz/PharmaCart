import { validateSignupData } from "../lib/validateUserSchema.js";

export const validate = (req, res, next) => {
  const result = validateSignupData(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Please correct the signup information",
      errors: result.errors,
    });
  }

  req.userData = result.data;
  next();
};
