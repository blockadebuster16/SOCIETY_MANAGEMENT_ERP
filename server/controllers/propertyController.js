import { listProperties, updatePropertyStatus } from '../services/propertyService.js';

export const getProperties = async (req, res, next) => {
  try {
    const { wingId, unitType, ownershipStatus, status } = req.query;
    const properties = await listProperties({
      wingId,
      unitType,
      ownershipStatus,
      status
    });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    next(error);
  }
};

export const modifyPropertyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedProperty = await updatePropertyStatus(id, status);

    res.status(200).json({
      success: true,
      message: 'Property status updated successfully',
      property: updatedProperty
    });
  } catch (error) {
    next(error);
  }
};
