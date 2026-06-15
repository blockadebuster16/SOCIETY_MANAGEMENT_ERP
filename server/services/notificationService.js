import { supabaseAdmin } from '../config/supabase.js';

/**
 * Triggers a multi-channel notification for a specific user.
 * Dispatches to In-App, Email, WhatsApp, and SMS channels (simulated).
 */
export const triggerNotification = async (userId, templateName, variables, sourceId = null, type = 'General') => {
  try {
    // 1. Fetch Template
    const { data: template, error: tempErr } = await supabaseAdmin
      .from('notification_templates')
      .select('*')
      .eq('template_name', templateName)
      .single();

    if (tempErr || !template) {
      console.error(`[NOTIFICATION ENGINE] Template not found: ${templateName}`);
      return null;
    }

    // 2. Fetch Recipient Details
    const { data: user, error: userErr } = await supabaseAdmin
      .from('users')
      .select('first_name, last_name, email, phone')
      .eq('id', userId)
      .single();

    if (userErr || !user) {
      console.error(`[NOTIFICATION ENGINE] User recipient not found: ${userId}`);
      return null;
    }

    // Add generic recipient variables
    const completeVars = {
      name: `${user.first_name} ${user.last_name}`,
      email: user.email || '',
      phone: user.phone || '',
      ...variables
    };

    // 3. Compile templates placeholders
    let titleCompiled = template.subject_template || 'New Alert';
    let bodyCompiled = template.body_template;

    for (const key in completeVars) {
      const placeholder = `{{${key}}}`;
      titleCompiled = titleCompiled.replace(new RegExp(placeholder, 'g'), completeVars[key]);
      bodyCompiled = bodyCompiled.replace(new RegExp(placeholder, 'g'), completeVars[key]);
    }

    // 4. Create In-App Notification record
    const { data: inAppNotification, error: notifyErr } = await supabaseAdmin
      .from('notifications')
      .insert([
        {
          user_id: userId,
          title: titleCompiled,
          message: bodyCompiled,
          type,
          source_id: sourceId,
          is_read: false
        }
      ])
      .select()
      .single();

    if (notifyErr) throw new Error(notifyErr.message);

    // 5. Create delivery logs for each channel
    const channels = [
      { channel: 'In-App', recipient: 'In-App' },
      { channel: 'Email', recipient: user.email || 'no-email@portal.com' },
      { channel: 'WhatsApp', recipient: user.phone || 'no-phone' },
      { channel: 'SMS', recipient: user.phone || 'no-phone' }
    ];

    const logs = channels.map(c => ({
      user_id: userId,
      channel: c.channel,
      recipient: c.recipient,
      status: 'Sent',
      sent_at: new Date().toISOString()
    }));

    await supabaseAdmin
      .from('notification_logs')
      .insert(logs);

    // Print to stdout to simulate SMS/WhatsApp/SMTP gateway execution
    console.log(`\n========================================`);
    console.log(`[NOTIFICATION ENGINE] Triggered: "${templateName}" for ${completeVars.name}`);
    console.log(`[In-App Notification Created] Title: "${titleCompiled}"`);
    console.log(`[Email Dispatched] To: ${user.email} -> Subject: "${titleCompiled}"`);
    console.log(`[SMS Dispatched] To: ${user.phone} -> Content: "${bodyCompiled}"`);
    console.log(`[WhatsApp Dispatched] To: ${user.phone} -> Content: "${bodyCompiled}"`);
    console.log(`========================================\n`);

    return inAppNotification;
  } catch (err) {
    console.error('[NOTIFICATION ENGINE ERROR] Failed to dispatch trigger notification:', err.message);
    return null;
  }
};

/**
 * Retrieves all in-app notifications for a specific user.
 */
export const getUserNotifications = async (userId, filters = {}) => {
  const { isRead, page = 1, limit = 10 } = filters;

  let query = supabaseAdmin
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  if (isRead !== undefined) {
    const isReadBool = isRead === 'true' || isRead === true;
    query = query.eq('is_read', isReadBool);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    notifications: data || [],
    total: count,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  };
};

/**
 * Marks a specific in-app notification as read.
 */
export const markAsRead = async (notificationId, userId) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Marks all in-app notifications of a user as read.
 */
export const markAllAsRead = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .select();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Broadcasts an emergency critical alert to all active residents.
 */
export const broadcastEmergencyAlert = async (alertData, createdBy) => {
  const { title, message } = alertData;

  // Fetch all active residents
  const { data: residents, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('status', 'Active');

  if (error) throw new Error(error.message);
  if (!residents || residents.length === 0) {
    return { success: true, count: 0 };
  }

  // Iterate and trigger notifications asynchronously
  let broadcastCount = 0;
  for (const resident of residents) {
    await triggerNotification(
      resident.id,
      'emergency_alert',
      {
        alert_title: title,
        alert_message: message
      },
      null, // source_id
      'Emergency'
    );
    broadcastCount++;
  }

  return {
    success: true,
    broadcastCount
  };
};
