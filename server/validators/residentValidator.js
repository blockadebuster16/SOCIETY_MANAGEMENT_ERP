// Input validators for Resident Management requests

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9\s\-]{10,15}$/;

export const validateCreateResidentInput = (req, res, next) => {
  const { email, firstName, lastName, phone, role, status } = req.body;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid or missing email address' });
  }

  if (!firstName || firstName.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'First name is required' });
  }

  if (!lastName || lastName.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Last name is required' });
  }

  if (phone && !phoneRegex.test(phone)) {
    return res.status(400).json({ success: false, message: 'Invalid phone number format' });
  }

  const validRoles = ['public', 'resident', 'tenant', 'shop_owner', 'committee_member', 'society_manager', 'super_admin'];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: `Role must be one of: ${validRoles.join(', ')}` });
  }

  const validStatuses = ['Pending', 'Active', 'Suspended'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  next();
};

export const validateUpdateResidentInput = (req, res, next) => {
  const { id } = req.params;
  const { email, phone, role, status } = req.body;

  if (!id || !uuidRegex.test(id)) {
    return res.status(400).json({ success: false, message: 'Invalid resident ID parameter' });
  }

  if (email && !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address format' });
  }

  if (phone && !phoneRegex.test(phone)) {
    return res.status(400).json({ success: false, message: 'Invalid phone number format' });
  }

  const validRoles = ['public', 'resident', 'tenant', 'shop_owner', 'committee_member', 'society_manager', 'super_admin'];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: `Role must be one of: ${validRoles.join(', ')}` });
  }

  const validStatuses = ['Pending', 'Active', 'Suspended'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  next();
};

export const validateAssignPropertyInput = (req, res, next) => {
  const { userId, propertyId, type } = req.body;

  if (!userId || !uuidRegex.test(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid or missing user ID' });
  }

  if (!propertyId || !uuidRegex.test(propertyId)) {
    return res.status(400).json({ success: false, message: 'Invalid or missing property ID' });
  }

  const validTypes = ['owner', 'tenant', 'family_member'];
  if (!type || !validTypes.includes(type)) {
    return res.status(400).json({ success: false, message: `Assignment type must be one of: ${validTypes.join(', ')}` });
  }

  if (type === 'owner') {
    const { ownershipPercentage } = req.body;
    if (ownershipPercentage !== undefined && (isNaN(ownershipPercentage) || ownershipPercentage < 0 || ownershipPercentage > 100)) {
      return res.status(400).json({ success: false, message: 'Ownership percentage must be a number between 0 and 100' });
    }
  }

  if (type === 'tenant') {
    const { leaseStart, leaseEnd } = req.body;
    if (!leaseStart || isNaN(Date.parse(leaseStart))) {
      return res.status(400).json({ success: false, message: 'Valid lease start date is required for tenants' });
    }
    if (!leaseEnd || isNaN(Date.parse(leaseEnd))) {
      return res.status(400).json({ success: false, message: 'Valid lease end date is required for tenants' });
    }
    if (new Date(leaseEnd) <= new Date(leaseStart)) {
      return res.status(400).json({ success: false, message: 'Lease end date must be after lease start date' });
    }
  }

  if (type === 'family_member') {
    const { name, relation, phone } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Name is required for family members' });
    }
    if (!relation || relation.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Relation is required for family members' });
    }
    if (phone && !phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid family member phone number format' });
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
