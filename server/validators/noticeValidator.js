// Input validators for Notice Management requests

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const validCategories = [
  'General', 
  'Maintenance', 
  'Emergency', 
  'AGM', 
  'SGM', 
  'Festival', 
  'Security', 
  'Parking', 
  'Water Supply', 
  'Lift Maintenance'
];

const validStatuses = ['Draft', 'Published', 'Archived', 'Scheduled'];

export const validateCreateNoticeInput = (req, res, next) => {
  const { title, content, category, status } = req.body;

  if (!title || title.trim().length < 5 || title.length > 200) {
    return res.status(400).json({ success: false, message: 'Notice title must be between 5 and 200 characters long' });
  }

  if (!content || content.trim().length < 10) {
    return res.status(400).json({ success: false, message: 'Notice content must be at least 10 characters long' });
  }

  if (!category || !validCategories.includes(category)) {
    return res.status(400).json({ success: false, message: `Category must be one of: ${validCategories.join(', ')}` });
  }

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  next();
};

export const validateUpdateNoticeInput = (req, res, next) => {
  const { id } = req.params;
  const { title, content, category, status } = req.body;

  if (!id || !uuidRegex.test(id)) {
    return res.status(400).json({ success: false, message: 'Invalid notice ID parameter' });
  }

  if (title !== undefined && (title.trim().length < 5 || title.length > 200)) {
    return res.status(400).json({ success: false, message: 'Notice title must be between 5 and 200 characters long' });
  }

  if (content !== undefined && content.trim().length < 10) {
    return res.status(400).json({ success: false, message: 'Notice content must be at least 10 characters long' });
  }

  if (category !== undefined && !validCategories.includes(category)) {
    return res.status(400).json({ success: false, message: `Category must be one of: ${validCategories.join(', ')}` });
  }

  if (status !== undefined && !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  next();
};

export const validateUuidParam = (req, res, next) => {
  const { id } = req.params;
  if (!id || !uuidRegex.test(id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID parameter' });
  }
  next();
};
