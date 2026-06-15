// Simple input validators for Authentication requests

export const validateRegisterInput = (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Invalid or missing email address' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }
  if (!firstName || !lastName) {
    return res.status(400).json({ success: false, message: 'First name and last name are required' });
  }

  next();
};

export const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  next();
};
