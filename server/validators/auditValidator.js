const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const validateAuditQueryInput = (req, res, next) => {
  const { userId, startDate, endDate, page, limit } = req.query;

  if (userId && !uuidRegex.test(userId)) {
    return res.status(400).json({ success: false, message: 'User ID filter must be a valid UUID' });
  }

  if (startDate && isNaN(Date.parse(startDate))) {
    return res.status(400).json({ success: false, message: 'Start date filter must be a valid ISO date' });
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    return res.status(400).json({ success: false, message: 'End date filter must be a valid ISO date' });
  }

  if (page && (isNaN(parseInt(page, 10)) || parseInt(page, 10) < 1)) {
    return res.status(400).json({ success: false, message: 'Page parameter must be a positive integer' });
  }

  if (limit && (isNaN(parseInt(limit, 10)) || parseInt(limit, 10) < 1)) {
    return res.status(400).json({ success: false, message: 'Limit parameter must be a positive integer' });
  }

  next();
};
