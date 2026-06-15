// Validation schema placeholders (to be compiled with Zod, Yup, or React Hook Form rules)
export const loginSchema = {
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address'
    }
  },
  password: {
    required: 'Password is required',
    minLength: {
      value: 6,
      message: 'Password must be at least 6 characters'
    }
  }
};

export const complaintSchema = {
  title: {
    required: 'Title is required',
    minLength: {
      value: 5,
      message: 'Title must be at least 5 characters'
    }
  },
  description: {
    required: 'Description is required',
    minLength: {
      value: 15,
      message: 'Description must be at least 15 characters'
    }
  }
};
