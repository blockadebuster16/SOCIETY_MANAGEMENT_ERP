// Input validators for Chatbot requests

export const validateQueryInput = (req, res, next) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Query is required and must be a non-empty string'
    });
  }

  next();
};

export const validateTrainInput = (req, res, next) => {
  const { question, answer } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Question is required and must be a non-empty string'
    });
  }

  if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Answer is required and must be a non-empty string'
    });
  }

  next();
};
