// Input validators for Property Management requests

export const validatePropertyStatusInput = (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!id || !uuidRegex.test(id)) {
    return res.status(400).json({ success: false, message: 'Invalid or missing property ID parameter' });
  }

  const validStatuses = ['Active', 'Under Maintenance', 'Inactive'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  next();
};
