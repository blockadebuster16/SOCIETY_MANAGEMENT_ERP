// Input validators for Document Repository requests

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const validStatuses = ['Draft', 'Published', 'Archived'];

export const validateCreateDocumentInput = (req, res, next) => {
  const { title, description, categoryId, status } = req.body;

  if (!title || title.trim().length < 3 || title.length > 200) {
    return res.status(400).json({ success: false, message: 'Document title must be between 3 and 200 characters long' });
  }

  if (description !== undefined && description.trim().length > 1000) {
    return res.status(400).json({ success: false, message: 'Description cannot exceed 1000 characters' });
  }

  if (!categoryId || !uuidRegex.test(categoryId)) {
    return res.status(400).json({ success: false, message: 'Valid category ID is required' });
  }

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  next();
};

export const validateUpdateDocumentInput = (req, res, next) => {
  const { id } = req.params;
  const { title, description, categoryId, status } = req.body;

  if (!id || !uuidRegex.test(id)) {
    return res.status(400).json({ success: false, message: 'Invalid document ID parameter' });
  }

  if (title !== undefined && (title.trim().length < 3 || title.length > 200)) {
    return res.status(400).json({ success: false, message: 'Document title must be between 3 and 200 characters long' });
  }

  if (description !== undefined && description.trim().length > 1000) {
    return res.status(400).json({ success: false, message: 'Description cannot exceed 1000 characters' });
  }

  if (categoryId !== undefined && !uuidRegex.test(categoryId)) {
    return res.status(400).json({ success: false, message: 'Valid category ID is required' });
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

export const validateCategoryUuidParam = (req, res, next) => {
  const { categoryId } = req.params;
  if (!categoryId || !uuidRegex.test(categoryId)) {
    return res.status(400).json({ success: false, message: 'Invalid Category ID parameter' });
  }
  next();
};
