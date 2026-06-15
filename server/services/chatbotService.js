import { supabaseAdmin } from '../config/supabase.js';
import KBRetriever from '../utils/retriever.js';
import { getOutstandingDues } from './paymentService.js';

export const appendTrainingFAQ = async (faqPair) => {
  const { question, answer } = faqPair;
  const { data, error } = await supabaseAdmin
    .from('chatbot_faqs')
    .insert([{ question, answer }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('This question already exists in the FAQ training data');
    }
    throw new Error(error.message);
  }
  return data;
};

export const getChatbotResponse = async (query, userContext = null) => {
  const cleanQuery = query.toLowerCase();

  // 1. Contextual Check: Maintenance / Outstanding Dues
  const duesKeywords = ['maintenance', 'due', 'outstanding', 'bill', 'pay', 'charge', 'balance'];
  const isDuesQuery = duesKeywords.some(kw => cleanQuery.includes(kw));

  if (isDuesQuery && userContext && userContext.properties && userContext.properties.length > 0) {
    const property = userContext.properties[0]; // Get primary property
    try {
      const outstanding = await getOutstandingDues(property.id);
      if (outstanding.totalOutstanding > 0) {
        let reply = `Dear ${userContext.name}, your property unit **${property.unit_number}** has a total outstanding maintenance balance of **INR ${outstanding.totalOutstanding.toFixed(2)}**.\n\nHere are the details of your unpaid bills:\n`;
        outstanding.bills.forEach(bill => {
          reply += `- **Bill #${bill.bill_number}**: INR ${bill.outstandingAmount.toFixed(2)} (Due: ${bill.due_date})\n`;
        });
        reply += `\nYou can make a payment directly in the Payments section of your portal dashboard.`;
        return reply;
      } else {
        return `Dear ${userContext.name}, you have **no outstanding dues** for your property unit **${property.unit_number}**. Your account balance is fully clear. Thank you for paying on time!`;
      }
    } catch (err) {
      console.error('Failed to retrieve outstanding dues for chatbot context:', err.message);
    }
  }

  // 2. Fetch FAQs from database and match semantically
  const { data: faqs } = await supabaseAdmin
    .from('chatbot_faqs')
    .select('*');

  if (faqs && faqs.length > 0) {
    const faqRetriever = new KBRetriever();
    const faqCorpus = faqs.map(faq => `Question: ${faq.question}. Answer: ${faq.answer}`).join('\n\n');
    faqRetriever.buildIndex(faqCorpus);

    const matches = faqRetriever.search(query, 1);
    if (matches.length > 0) {
      const matchedFaq = faqs.find(faq => {
        return matches[0].includes(faq.answer.substring(0, 20));
      });
      if (matchedFaq) {
        return matchedFaq.answer;
      }
    }
  }

  // 3. Match against Documents (e.g. Society By-Laws)
  const { data: documents } = await supabaseAdmin
    .from('documents')
    .select('*');

  if (documents && documents.length > 0) {
    const docRetriever = new KBRetriever();
    const docCorpus = documents.map(doc => `Document Title: ${doc.title}. Description: ${doc.description || ''}. Link: ${doc.file_url}`).join('\n\n');
    docRetriever.buildIndex(docCorpus);

    const matches = docRetriever.search(query, 1);
    if (matches.length > 0) {
      const matchedDoc = documents.find(doc => matches[0].includes(doc.title.substring(0, 20)));
      if (matchedDoc) {
        return `I found a document matching your query:\n\n**${matchedDoc.title}**\nDescription: ${matchedDoc.description || 'No description available.'}\n\nYou can download the document here: [Download Link](${matchedDoc.file_url})`;
      }
    }
  }

  // 4. Match against Events
  const { data: events } = await supabaseAdmin
    .from('events')
    .select('*');

  if (events && events.length > 0) {
    const eventRetriever = new KBRetriever();
    const eventCorpus = events.map(e => `Event Title: ${e.title}. Description: ${e.description}. Location: ${e.location}. Date: ${e.event_date}. Status: ${e.status}`).join('\n\n');
    eventRetriever.buildIndex(eventCorpus);

    const matches = eventRetriever.search(query, 1);
    if (matches.length > 0) {
      const matchedEvent = events.find(e => matches[0].includes(e.title.substring(0, 20)));
      if (matchedEvent) {
        return `I found the following event matching your query:\n\n**${matchedEvent.title}** (${matchedEvent.event_type || 'Community'})\nDescription: ${matchedEvent.description}\nLocation: ${matchedEvent.location}\nDate: ${matchedEvent.event_date} (Timings: ${matchedEvent.start_time} - ${matchedEvent.end_time})\nStatus: **${matchedEvent.status}**`;
      }
    }
  }

  // 5. Match against Notices
  const { data: notices } = await supabaseAdmin
    .from('notices')
    .select('*')
    .eq('status', 'Published');

  if (notices && notices.length > 0) {
    const noticeRetriever = new KBRetriever();
    const noticeCorpus = notices.map(n => `Notice Title: ${n.title}. Content: ${n.content}. Category: ${n.category}`).join('\n\n');
    noticeRetriever.buildIndex(noticeCorpus);

    const matches = noticeRetriever.search(query, 1);
    if (matches.length > 0) {
      const matchedNotice = notices.find(n => matches[0].includes(n.title.substring(0, 20)));
      if (matchedNotice) {
        return `I found a published notice matching your query:\n\n**${matchedNotice.title}** (${matchedNotice.category})\nContent: ${matchedNotice.content}\nPublished On: ${matchedNotice.published_at.split('T')[0]}`;
      }
    }
  }

  // 6. Default fallback answer
  return `Thank you for your question. I am the Suyash Pride Portal AI Assistant. I couldn't find a direct document, event, notice, or FAQ matching your query: "${query}". \n\nFor further help, please file a service ticket in the Complaints section or contact the society office at office@suyashpride.co.`;
};
export default getChatbotResponse;
