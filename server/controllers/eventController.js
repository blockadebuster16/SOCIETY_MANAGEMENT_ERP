import {
  createEvent as createEventService,
  updateEvent as updateEventService,
  publishEvent as publishEventService,
  cancelEvent as cancelEventService,
  completeEvent as completeEventService,
  registerResident as registerResidentService,
  cancelRegistration as cancelRegistrationService,
  getEventById,
  listEvents,
  getUpcomingEvents,
  getPastEvents,
  uploadEventImages as uploadEventImagesService,
  updateRSVPStatus
} from '../services/eventService.js';
import { getResidentProfile } from '../services/residentService.js';
import { uploadFileToSupabase } from '../utils/storage.js';

const getLocalUserId = async (userPayload) => {
  const profile = await getResidentProfile(userPayload.authUserId);
  return profile.id;
};

export const getEvents = async (req, res, next) => {
  try {
    const { eventType, status, search, page, limit } = req.query;
    const adminRoles = ['committee_member', 'society_manager', 'super_admin'];
    const showAll = req.user && adminRoles.includes(req.user.role);

    const result = await listEvents({
      eventType,
      status,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10
    }, showAll);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcoming = async (req, res, next) => {
  try {
    const { eventType, search, page, limit } = req.query;
    const adminRoles = ['committee_member', 'society_manager', 'super_admin'];
    const showAll = req.user && adminRoles.includes(req.user.role);

    const result = await getUpcomingEvents({
      eventType,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10
    }, showAll);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const getPast = async (req, res, next) => {
  try {
    const { eventType, search, page, limit } = req.query;
    const adminRoles = ['committee_member', 'society_manager', 'super_admin'];
    const showAll = req.user && adminRoles.includes(req.user.role);

    const result = await getPastEvents({
      eventType,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10
    }, showAll);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    let localUserId = null;
    if (req.user) {
      localUserId = await getLocalUserId(req.user);
    }

    const event = await getEventById(id, localUserId);

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const localUserId = await getLocalUserId(req.user);
    let coverImage = null;

    if (req.file) {
      coverImage = await uploadFileToSupabase(req.file, 'event-images');
    }

    const eventData = {
      ...req.body,
      coverImage,
      createdBy: localUserId
    };

    const event = await createEventService(eventData);

    res.status(201).json({
      success: true,
      message: 'Event scheduled successfully',
      event
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    let coverImage = undefined;

    if (req.file) {
      coverImage = await uploadFileToSupabase(req.file, 'event-images');
    }

    const updateData = {
      ...req.body,
      ...(coverImage !== undefined && { coverImage })
    };

    const updated = await updateEventService(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: updated
    });
  } catch (error) {
    next(error);
  }
};

export const publishEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await publishEventService(id);

    res.status(200).json({
      success: true,
      message: 'Event published successfully',
      event: updated
    });
  } catch (error) {
    next(error);
  }
};

export const cancelEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await cancelEventService(id);

    res.status(200).json({
      success: true,
      message: 'Event cancelled successfully',
      event: updated
    });
  } catch (error) {
    next(error);
  }
};

export const completeEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await completeEventService(id);

    res.status(200).json({
      success: true,
      message: 'Event marked as completed successfully',
      event: updated
    });
  } catch (error) {
    next(error);
  }
};

export const registerResident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const localUserId = await getLocalUserId(req.user);

    const registration = await registerResidentService(id, localUserId);

    res.status(201).json({
      success: true,
      message: 'RSVP registered successfully',
      registration
    });
  } catch (error) {
    next(error);
  }
};

export const cancelRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const localUserId = await getLocalUserId(req.user);

    const registration = await cancelRegistrationService(id, localUserId);

    res.status(200).json({
      success: true,
      message: 'RSVP cancelled successfully',
      registration
    });
  } catch (error) {
    next(error);
  }
};

export const uploadEventImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const localUserId = await getLocalUserId(req.user);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one gallery image file is required'
      });
    }

    const imageUrls = [];
    for (const file of req.files) {
      const url = await uploadFileToSupabase(file, 'event-images');
      imageUrls.push(url);
    }

    const galleryRecords = await uploadEventImagesService(id, imageUrls, localUserId);

    res.status(201).json({
      success: true,
      message: 'Images uploaded and added to event gallery successfully',
      gallery: galleryRecords
    });
  } catch (error) {
    next(error);
  }
};

export const updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { residentId, status } = req.body;

    if (!residentId || !status) {
      return res.status(400).json({
        success: false,
        message: 'residentId and status parameters are required'
      });
    }

    const allowedStatus = ['Registered', 'Cancelled', 'Attended'];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatus.join(', ')}`
      });
    }

    const updated = await updateRSVPStatus(id, residentId, status);

    res.status(200).json({
      success: true,
      message: `RSVP status updated to ${status} successfully`,
      registration: updated
    });
  } catch (error) {
    next(error);
  }
};
