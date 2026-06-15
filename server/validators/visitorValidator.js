const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const phoneRegex = /^[0-9+\-\s]{8,20}$/;

export const validatePreApprovalInput = (req, res, next) => {
  const { propertyId, visitorName, visitorPhone, visitorType, validFrom, validTo } = req.body;

  if (!propertyId || !uuidRegex.test(propertyId)) {
    return res.status(400).json({ success: false, message: 'Property ID is required and must be a valid UUID' });
  }

  if (!visitorName || typeof visitorName !== 'string' || visitorName.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Visitor name is required and must be at least 2 characters long' });
  }

  if (!visitorPhone || !phoneRegex.test(visitorPhone)) {
    return res.status(400).json({ success: false, message: 'Visitor phone is required and must be a valid phone number' });
  }

  const allowedTypes = ['Guest', 'Delivery', 'Staff', 'Other'];
  if (visitorType && !allowedTypes.includes(visitorType)) {
    return res.status(400).json({ success: false, message: `Visitor type must be one of: ${allowedTypes.join(', ')}` });
  }

  if (!validFrom || isNaN(Date.parse(validFrom))) {
    return res.status(400).json({ success: false, message: 'Valid from date is required and must be a valid ISO date' });
  }

  if (!validTo || isNaN(Date.parse(validTo))) {
    return res.status(400).json({ success: false, message: 'Valid to date is required and must be a valid ISO date' });
  }

  if (new Date(validTo) <= new Date(validFrom)) {
    return res.status(400).json({ success: false, message: 'Valid to date must be chronologically after valid from date' });
  }

  next();
};

export const validateCheckInInput = (req, res, next) => {
  const { passCode, propertyId, visitorName, visitorPhone, visitorType } = req.body;

  if (passCode) {
    if (typeof passCode !== 'string' || passCode.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Pass code must be a valid string' });
    }
  } else {
    if (!propertyId || !uuidRegex.test(propertyId)) {
      return res.status(400).json({ success: false, message: 'Property ID is required and must be a valid UUID for ad-hoc entry' });
    }

    if (!visitorName || typeof visitorName !== 'string' || visitorName.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Visitor name is required and must be at least 2 characters long for ad-hoc entry' });
    }

    if (!visitorPhone || !phoneRegex.test(visitorPhone)) {
      return res.status(400).json({ success: false, message: 'Visitor phone is required and must be a valid phone number for ad-hoc entry' });
    }

    const allowedTypes = ['Guest', 'Delivery', 'Staff', 'Other'];
    if (visitorType && !allowedTypes.includes(visitorType)) {
      return res.status(400).json({ success: false, message: `Visitor type must be one of: ${allowedTypes.join(', ')}` });
    }
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

export const validateSecurityLogInput = (req, res, next) => {
  const { logText, category, severity } = req.body;

  if (!logText || typeof logText !== 'string' || logText.trim().length < 3) {
    return res.status(400).json({ success: false, message: 'Log text is required and must be at least 3 characters long' });
  }

  const allowedCategories = ['General', 'Incident', 'Shift-Change', 'Gate-Status', 'Emergency'];
  if (category && !allowedCategories.includes(category)) {
    return res.status(400).json({ success: false, message: `Category must be one of: ${allowedCategories.join(', ')}` });
  }

  const allowedSeverities = ['Info', 'Warning', 'Critical'];
  if (severity && !allowedSeverities.includes(severity)) {
    return res.status(400).json({ success: false, message: `Severity must be one of: ${allowedSeverities.join(', ')}` });
  }

  next();
};
