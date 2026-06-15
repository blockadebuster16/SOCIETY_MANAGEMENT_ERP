import { supabaseAdmin } from '../config/supabase.js';

const getStorageFileName = (fileUrl) => {
  const parts = fileUrl.split('/event-images/');
  return parts.length > 1 ? parts[1] : fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
};

export const createEvent = async (eventData) => {
  const { title, description, eventType, location, eventDate, startTime, endTime, maxAttendees, coverImage, createdBy } = eventData;

  const { data, error } = await supabaseAdmin
    .from('events')
    .insert([
      {
        title,
        description,
        event_type: eventType,
        location,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        max_attendees: maxAttendees ? parseInt(maxAttendees, 10) : null,
        cover_image: coverImage || null,
        created_by: createdBy || null,
        status: 'Draft'
      }
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateEvent = async (eventId, updateData) => {
  const { title, description, eventType, location, eventDate, startTime, endTime, maxAttendees, coverImage, status } = updateData;

  // Retrieve current event details to check cover image and status
  const { data: current, error: fetchErr } = await supabaseAdmin
    .from('events')
    .select('cover_image, status')
    .eq('id', eventId)
    .single();

  if (fetchErr || !current) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }

  if (current.status === 'Completed' || current.status === 'Cancelled') {
    const err = new Error(`Cannot modify event details because it is already ${current.status.toLowerCase()}`);
    err.statusCode = 400;
    throw err;
  }

  let updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (eventType !== undefined) updates.event_type = eventType;
  if (location !== undefined) updates.location = location;
  if (eventDate !== undefined) updates.event_date = eventDate;
  if (startTime !== undefined) updates.start_time = startTime;
  if (endTime !== undefined) updates.end_time = endTime;
  if (maxAttendees !== undefined) updates.max_attendees = maxAttendees ? parseInt(maxAttendees, 10) : null;
  if (coverImage !== undefined) updates.cover_image = coverImage;
  if (status !== undefined) updates.status = status;

  const { data, error } = await supabaseAdmin
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // If a new cover image is uploaded and it's different, remove the old one
  if (coverImage && current.cover_image && current.cover_image !== coverImage) {
    const oldFileName = getStorageFileName(current.cover_image);
    try {
      await supabaseAdmin.storage.from('event-images').remove([oldFileName]);
    } catch (removeErr) {
      console.error('Failed to remove replaced cover image from storage:', removeErr);
    }
  }

  return data;
};

export const publishEvent = async (eventId) => {
  return updateEvent(eventId, { status: 'Published' });
};

export const cancelEvent = async (eventId) => {
  return updateEvent(eventId, { status: 'Cancelled' });
};

export const completeEvent = async (eventId) => {
  return updateEvent(eventId, { status: 'Completed' });
};

export const registerResident = async (eventId, residentId) => {
  // Check if event exists and is not Cancelled or Completed
  const { data: event, error: fetchErr } = await supabaseAdmin
    .from('events')
    .select('status, max_attendees')
    .eq('id', eventId)
    .single();

  if (fetchErr || !event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }

  if (event.status !== 'Published') {
    const err = new Error(`Cannot register for an event that is ${event.status.toLowerCase()}`);
    err.statusCode = 400;
    throw err;
  }

  // Check attendee limit
  if (event.max_attendees) {
    const { count, error: countErr } = await supabaseAdmin
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('registration_status', 'Registered');

    if (countErr) throw new Error(countErr.message);

    if (count >= event.max_attendees) {
      const err = new Error('Event registration is full');
      err.statusCode = 400;
      throw err;
    }
  }

  // Fetch existing registration to allow reopening cancelled RSVP
  const { data: existing } = await supabaseAdmin
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .eq('resident_id', residentId)
    .maybeSingle();

  if (existing) {
    if (existing.registration_status === 'Registered') {
      const err = new Error('You are already registered for this event');
      err.statusCode = 409;
      throw err;
    }

    // Reactivate cancelled RSVP
    const { data, error } = await supabaseAdmin
      .from('event_registrations')
      .update({ registration_status: 'Registered', registered_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // Insert new registration
  const { data, error } = await supabaseAdmin
    .from('event_registrations')
    .insert([
      {
        event_id: eventId,
        resident_id: residentId,
        registration_status: 'Registered'
      }
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const cancelRegistration = async (eventId, residentId) => {
  const { data, error } = await supabaseAdmin
    .from('event_registrations')
    .update({ registration_status: 'Cancelled' })
    .eq('event_id', eventId)
    .eq('resident_id', residentId)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) {
    const err = new Error('Event registration not found');
    err.statusCode = 404;
    throw err;
  }

  return data;
};

export const getEventById = async (eventId, currentResidentId = null) => {
  const { data: event, error } = await supabaseAdmin
    .from('events')
    .select('*, creator:created_by(id, first_name, last_name, email, role)')
    .eq('id', eventId)
    .single();

  if (error || !event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }

  // Get registrations count
  const { count, error: rsvpCountError } = await supabaseAdmin
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('registration_status', 'Registered');

  if (rsvpCountError) throw new Error(rsvpCountError.message);

  // Check current resident's RSVP status
  let userRsvpStatus = null;
  if (currentResidentId) {
    const { data: registration } = await supabaseAdmin
      .from('event_registrations')
      .select('registration_status')
      .eq('event_id', eventId)
      .eq('resident_id', currentResidentId)
      .maybeSingle();

    if (registration) {
      userRsvpStatus = registration.registration_status;
    }
  }

  // Fetch gallery images
  const { data: gallery } = await supabaseAdmin
    .from('event_gallery')
    .select('*, uploader:uploaded_by(id, first_name, last_name)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  return {
    ...event,
    rsvpCount: count || 0,
    userRsvpStatus,
    gallery: gallery || []
  };
};

export const listEvents = async (filters = {}, showAll = false) => {
  const { eventType, status, search, page = 1, limit = 10 } = filters;

  let query = supabaseAdmin
    .from('events')
    .select('*, creator:created_by(id, first_name, last_name, email, role)', { count: 'exact' });

  if (!showAll) {
    // Non-admins can only see Published or Completed events
    query = query.in('status', ['Published', 'Completed']);
  } else if (status) {
    query = query.eq('status', status);
  }

  if (eventType) {
    query = query.eq('event_type', eventType);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.order('event_date', { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    events: data,
    total: count,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  };
};

export const getUpcomingEvents = async (filters = {}, showAll = false) => {
  const { eventType, search, page = 1, limit = 10 } = filters;
  const nowStr = new Date().toISOString().split('T')[0]; // Current date YYYY-MM-DD

  let query = supabaseAdmin
    .from('events')
    .select('*, creator:created_by(id, first_name, last_name, email, role)', { count: 'exact' })
    .gte('event_date', nowStr);

  if (!showAll) {
    query = query.eq('status', 'Published');
  } else {
    query = query.neq('status', 'Cancelled');
  }

  if (eventType) {
    query = query.eq('event_type', eventType);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.order('event_date', { ascending: true }).range(from, to);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    events: data,
    total: count,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  };
};

export const getPastEvents = async (filters = {}, showAll = false) => {
  const { eventType, search, page = 1, limit = 10 } = filters;
  const nowStr = new Date().toISOString().split('T')[0];

  let query = supabaseAdmin
    .from('events')
    .select('*, creator:created_by(id, first_name, last_name, email, role)', { count: 'exact' });

  if (!showAll) {
    query = query.or(`event_date.lt.${nowStr},status.eq.Completed`).eq('status', 'Completed');
  } else {
    query = query.or(`event_date.lt.${nowStr},status.eq.Completed`);
  }

  if (eventType) {
    query = query.eq('event_type', eventType);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.order('event_date', { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    events: data,
    total: count,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  };
};

export const uploadEventImages = async (eventId, imageUrls, uploadedBy) => {
  const inserts = imageUrls.map(url => ({
    event_id: eventId,
    image_url: url,
    uploaded_by: uploadedBy
  }));

  const { data, error } = await supabaseAdmin
    .from('event_gallery')
    .insert(inserts)
    .select();

  if (error) throw new Error(error.message);
  return data;
};

export const updateRSVPStatus = async (eventId, residentId, status) => {
  const { data, error } = await supabaseAdmin
    .from('event_registrations')
    .update({ registration_status: status })
    .eq('event_id', eventId)
    .eq('resident_id', residentId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};
