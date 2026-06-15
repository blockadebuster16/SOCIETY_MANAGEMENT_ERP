import { supabaseAdmin } from '../config/supabase.js';

/**
 * Simulates sending an email/SMS notification to a resident after a successful payment transaction.
 * Logs the dispatch details to represent external mail SMTP or SMS gateway calls.
 * @param {string} userId - The local profile user UUID
 * @param {number} amount - The amount paid
 * @param {string} receiptNumber - Reference receipt number
 */
export const sendPaymentNotification = async (userId, amount, receiptNumber) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('first_name, last_name, email, phone')
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.warn(`[NOTIFICATION WARNING] User details not found for ID: ${userId}. Bypassing notification dispatch.`);
      return;
    }

    const fullName = `${user.first_name} ${user.last_name}`;
    const emailRecipient = user.email || 'no-email@portal.com';
    const smsRecipient = user.phone || 'No phone number linked';

    const messageBody = `Dear ${fullName}, your maintenance payment of INR ${parseFloat(amount).toFixed(2)} has been successfully received and verified. Receipt reference: ${receiptNumber}. Thank you, Suyash Pride Committee.`;

    console.log('\n--- SIMULATED NOTIFICATION DISPATCH ---');
    console.log(`[SMTP Mail Channel] From: billing@suyashpride.co -> To: ${emailRecipient}`);
    console.log(`[SMTP Mail Subject] Maintenance Payment Verified - Receipt #${receiptNumber}`);
    console.log(`[SMTP Mail Content] ${messageBody}`);
    console.log(`[SMS Gateway Channel] To: ${smsRecipient} -> Content: ${messageBody}`);
    console.log('----------------------------------------\n');
  } catch (err) {
    console.error('[NOTIFICATION ERROR] Failed to dispatch payment receipt notification:', err.message);
  }
};
