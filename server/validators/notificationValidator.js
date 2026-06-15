// Input validators for Notification requests

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const validateEmergencyAlertInput = (req, res, next) => {
  const { title, message } = req.body;

  if (!title || title.trim().length < 3 || title.length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Alert title is required and must be between 3 and 200 characters long'
    });
  }

  if (!message || message.trim().length < 5) {
    return res.status(400).json({
      success: false,
      message: 'Alert message is required and must be at least 5 characters long'
    });
  }

  next();
};

export const validateUuidParam = (req, res, next) => {
  const { id } = req.params;
  if (!id || !uuidRegex.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID parameter'
    });
  }
  next();
};
