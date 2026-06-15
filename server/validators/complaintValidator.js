// Input validators for Complaint Management requests

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const validCategories = [
  'Electrical', 
  'Plumbing', 
  'Lift', 
  'Security', 
  'Parking', 
  'Housekeeping', 
  'Water Supply', 
  'Garden', 
  'Fire Safety', 
  'Common Area', 
  'Commercial Shop', 
  'Other'
];

const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
const validStatuses = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected', 'Reopened'];

export const validateCreateComplaintInput = (req, res, next) => {
  const { propertyId, category, priority, subject, description } = req.body;

  if (!propertyId || !uuidRegex.test(propertyId)) {
    return res.status(400).json({ success: false, message: 'Valid property ID is required' });
  }

  if (!category || !validCategories.includes(category)) {
    return res.status(400).json({ success: false, message: `Category must be one of: ${validCategories.join(', ')}` });
  }

  if (!priority || !validPriorities.includes(priority)) {
    return res.status(400).json({ success: false, message: `Priority must be one of: ${validPriorities.join(', ')}` });
  }

  if (!subject || subject.trim().length < 5 || subject.length > 200) {
    return res.status(400).json({ success: false, message: 'Subject must be between 5 and 200 characters long' });
  }

  if (!description || description.trim().length < 10) {
    return res.status(400).json({ success: false, message: 'Description must be at least 10 characters long' });
  }

  next();
};

export const validateUpdateComplaintInput = (req, res, next) => {
  const { id } = req.params;
  const { category, priority, subject, description } = req.body;

  if (!id || !uuidRegex.test(id)) {
    return res.status(400).json({ success: false, message: 'Invalid complaint ID parameter' });
  }

  if (category !== undefined && !validCategories.includes(category)) {
    return res.status(400).json({ success: false, message: `Category must be one of: ${validCategories.join(', ')}` });
  }

  if (priority !== undefined && !validPriorities.includes(priority)) {
    return res.status(400).json({ success: false, message: `Priority must be one of: ${validPriorities.join(', ')}` });
  }

  if (subject !== undefined && (subject.trim().length < 5 || subject.length > 200)) {
    return res.status(400).json({ success: false, message: 'Subject must be between 5 and 200 characters long' });
  }

  if (description !== undefined && description.trim().length < 10) {
    return res.status(400).json({ success: false, message: 'Description must be at least 10 characters long' });
  }

  next();
};

export const validateStatusUpdateInput = (req, res, next) => {
  const { id } = req.params;
  const { status, resolutionNotes } = req.body;

  if (!id || !uuidRegex.test(id)) {
    return res.status(400).json({ success: false, message: 'Invalid complaint ID parameter' });
  }

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  if (resolutionNotes !== undefined && resolutionNotes.trim().length > 1000) {
    return res.status(400).json({ success: false, message: 'Resolution notes cannot exceed 1000 characters' });
  }

  next();
};

export const validateAssignComplaintInput = (req, res, next) => {
  const { id } = req.params;
  const { assignedTo } = req.body;

  if (!id || !uuidRegex.test(id)) {
    return res.status(400).json({ success: false, message: 'Invalid complaint ID parameter' });
  }

  if (!assignedTo || !uuidRegex.test(assignedTo)) {
    return res.status(400).json({ success: false, message: 'Valid assignedTo user ID is required' });
  }

  next();
};

export const validateCloseComplaintInput = (req, res, next) => {
  const { id } = req.params;
  const { resolutionNotes } = req.body;

  if (!id || !uuidRegex.test(id)) {
    return res.status(400).json({ success: false, message: 'Invalid complaint ID parameter' });
  }

  if (!resolutionNotes || resolutionNotes.trim().length < 5) {
    return res.status(400).json({ success: false, message: 'Resolution notes of at least 5 characters are required to close complaints' });
  }

  next();
};

export const validateCommentInput = (req, res, next) => {
  const { id } = req.params;
  const { comment } = req.body;

  if (!id || !uuidRegex.test(id)) {
    return res.status(400).json({ success: false, message: 'Invalid complaint ID parameter' });
  }

  if (!comment || comment.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Comment text is required' });
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
