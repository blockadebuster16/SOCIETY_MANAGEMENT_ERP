import {
  createResident as createResidentService,
  updateResident as updateResidentService,
  getResidentById,
  getResidentProfile,
  listResidents,
  assignProperty as assignPropertyService,
  removePropertyAssignment,
  listPropertyResidents,
  bulkImportResidents
} from '../services/residentService.js';

export const createResident = async (req, res, next) => {
  try {
    const resident = await createResidentService(req.body);
    res.status(201).json({
      success: true,
      message: 'Resident registered successfully',
      resident
    });
  } catch (error) {
    next(error);
  }
};

export const bulkImport = async (req, res, next) => {
  try {
    const residents = req.body.residents;
    if (!Array.isArray(residents)) {
      return res.status(400).json({ success: false, message: 'Invalid data format. Expected an array of residents.' });
    }

    const results = await bulkImportResidents(residents);
    res.status(200).json({
      success: true,
      message: 'Bulk import processed',
      results
    });
  } catch (error) {
    next(error);
  }
};

export const updateResident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resident = await updateResidentService(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Resident profile updated successfully',
      resident
    });
  } catch (error) {
    next(error);
  }
};

export const getResident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resident = await getResidentById(id);
    res.status(200).json({
      success: true,
      resident
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    // req.user has verified JWT payload (contains authUserId, role)
    const profile = await getResidentProfile(req.user.authUserId);
    res.status(200).json({
      success: true,
      user: profile
    });
  } catch (error) {
    next(error);
  }
};

export const getResidents = async (req, res, next) => {
  try {
    const { wingId, floor, propertyType, role, status, isOwner, isTenant } = req.query;
    const residents = await listResidents({
      wingId,
      floor,
      propertyType,
      role,
      status,
      isOwner,
      isTenant
    });

    res.status(200).json({
      success: true,
      count: residents.length,
      residents
    });
  } catch (error) {
    next(error);
  }
};

export const assignProperty = async (req, res, next) => {
  try {
    const assignment = await assignPropertyService(req.body);
    res.status(201).json({
      success: true,
      message: 'Property assigned successfully',
      assignment
    });
  } catch (error) {
    next(error);
  }
};

export const removeAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // type is required: owner, tenant, or family_member
    
    if (!type) {
      return res.status(400).json({ success: false, message: 'Assignment type query parameter is required (owner, tenant, family_member)' });
    }

    await removePropertyAssignment(id, type);
    res.status(200).json({
      success: true,
      message: 'Property assignment removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertyResidents = async (req, res, next) => {
  try {
    const { id } = req.params; // propertyId
    const residents = await listPropertyResidents(id);
    res.status(200).json({
      success: true,
      residents
    });
  } catch (error) {
    next(error);
  }
};
