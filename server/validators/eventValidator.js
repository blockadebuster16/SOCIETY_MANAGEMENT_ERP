// Input validators for Event Management requests

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

const validEventTypes = [
  'AGM',
  'SGM',
  'Festival',
  'Sports',
  'Cultural',
  'Maintenance',
  'Emergency Meeting',
  'Vendor Meeting',
  'Workshop',
  'Other'
];

const validStatuses = ['Draft', 'Published', 'Cancelled', 'Completed'];

export const validateCreateEventInput = (req, res, next) => {
  const { title, description, eventType, location, eventDate, startTime, endTime, maxAttendees } = req.body;

  if (!title || title.trim().length < 5 || title.length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Title is required and must be between 5 and 200 characters long'
    });
  }

  if (!description || description.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Description is required and must be at least 10 characters long'
    });
  }

  if (!eventType || !validEventTypes.includes(eventType)) {
    return res.status(400).json({
      success: false,
      message: `Event type must be one of: ${validEventTypes.join(', ')}`
    });
  }

  if (!location || location.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Location is required and must be at least 3 characters long'
    });
  }

  if (!eventDate || isNaN(Date.parse(eventDate))) {
    return res.status(400).json({
      success: false,
      message: 'A valid event date (YYYY-MM-DD) is required'
    });
  }

  const parsedDate = new Date(eventDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsedDate < today) {
    return res.status(400).json({
      success: false,
      message: 'Event date cannot be in the past'
    });
  }

  if (!startTime || !timeRegex.test(startTime)) {
    return res.status(400).json({
      success: false,
      message: 'A valid start time (HH:MM or HH:MM:SS) is required'
    });
  }

  if (!endTime || !timeRegex.test(endTime)) {
    return res.status(400).json({
      success: false,
      message: 'A valid end time (HH:MM or HH:MM:SS) is required'
    });
  }

  if (maxAttendees !== undefined && maxAttendees !== null) {
    const attendees = parseInt(maxAttendees, 10);
    if (isNaN(attendees) || attendees <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Max attendees must be a positive integer'
      });
    }
  }

  next();
};

export const validateUpdateEventInput = (req, res, next) => {
  const { id } = req.params;
  const { title, description, eventType, location, eventDate, startTime, endTime, maxAttendees, status } = req.body;

  if (!id || !uuidRegex.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid event ID parameter'
    });
  }

  if (title !== undefined && (title.trim().length < 5 || title.length > 200)) {
    return res.status(400).json({
      success: false,
      message: 'Title must be between 5 and 200 characters long'
    });
  }

  if (description !== undefined && description.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Description must be at least 10 characters long'
    });
  }

  if (eventType !== undefined && !validEventTypes.includes(eventType)) {
    return res.status(400).json({
      success: false,
      message: `Event type must be one of: ${validEventTypes.join(', ')}`
    });
  }

  if (location !== undefined && location.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Location must be at least 3 characters long'
    });
  }

  if (eventDate !== undefined) {
    if (isNaN(Date.parse(eventDate))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event date format'
      });
    }
    const parsedDate = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Event date cannot be in the past'
      });
    }
  }

  if (startTime !== undefined && !timeRegex.test(startTime)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid start time format (HH:MM or HH:MM:SS)'
    });
  }

  if (endTime !== undefined && !timeRegex.test(endTime)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid end time format (HH:MM or HH:MM:SS)'
    });
  }

  if (maxAttendees !== undefined && maxAttendees !== null) {
    const attendees = parseInt(maxAttendees, 10);
    if (isNaN(attendees) || attendees <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Max attendees must be a positive integer'
      });
    }
  }

  if (status !== undefined && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status must be one of: ${validStatuses.join(', ')}`
    });
  }

  next();
};

export const validateUuidParam = (req, res, next) => {
  const { id } = req.params;
  if (!id || !uuidRegex.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID parameter'
    });
  }
  next();
};
