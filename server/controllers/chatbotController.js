import { getChatbotResponse, appendTrainingFAQ } from '../services/chatbotService.js';
import { getResidentProfile } from '../services/residentService.js';

export const queryChatbot = async (req, res, next) => {
  try {
    const { query } = req.body;
    let userContext = null;

    if (req.user && req.user.authUserId) {
      try {
        const profile = await getResidentProfile(req.user.authUserId);
        if (profile) {
          let properties = [];
          if (profile.owned_properties && profile.owned_properties.length > 0) {
            properties = profile.owned_properties.map(op => op.properties).filter(Boolean);
          } else if (profile.rented_properties && profile.rented_properties.length > 0) {
            properties = profile.rented_properties.map(rp => rp.properties).filter(Boolean);
          }
          userContext = {
            name: `${profile.first_name} ${profile.last_name}`,
            properties: properties
          };
        }
      } catch (profileError) {
        console.warn(`Could not resolve resident profile for authUserId ${req.user.authUserId}: ${profileError.message}`);
      }
    }

    const response = await getChatbotResponse(query, userContext);
    
    res.status(200).json({
      success: true,
      query,
      response
    });
  } catch (error) {
    next(error);
  }
};

export const trainChatbotFAQ = async (req, res, next) => {
  try {
    const { question, answer } = req.body;
    const data = await appendTrainingFAQ({ question, answer });
    res.status(201).json({
      success: true,
      message: 'Chatbot FAQ training data registered successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

