// Input validators for Payment and Billing Management requests

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const validPaymentModes = ['Razorpay', 'Cash', 'Cheque', 'Bank Transfer'];

export const validateBillingCycleInput = (req, res, next) => {
  const { cycleName, startDate, endDate, dueDate } = req.body;

  if (!cycleName || cycleName.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Cycle name is required and must be at least 3 characters long'
    });
  }

  if (!startDate || isNaN(Date.parse(startDate))) {
    return res.status(400).json({
      success: false,
      message: 'A valid start date is required'
    });
  }

  if (!endDate || isNaN(Date.parse(endDate))) {
    return res.status(400).json({
      success: false,
      message: 'A valid end date is required'
    });
  }

  if (!dueDate || isNaN(Date.parse(dueDate))) {
    return res.status(400).json({
      success: false,
      message: 'A valid due date is required'
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const due = new Date(dueDate);

  if (end <= start) {
    return res.status(400).json({
      success: false,
      message: 'End date must be after the start date'
    });
  }

  if (due < start) {
    return res.status(400).json({
      success: false,
      message: 'Due date cannot be before the start date'
    });
  }

  next();
};

export const validateCreateReceiptInput = (req, res, next) => {
  const { propertyId, paymentMode, referenceNumber, amountReceived, receivedDate } = req.body;

  if (!propertyId || !uuidRegex.test(propertyId)) {
    return res.status(400).json({
      success: false,
      message: 'Valid property ID is required'
    });
  }

  if (!paymentMode || !validPaymentModes.includes(paymentMode)) {
    return res.status(400).json({
      success: false,
      message: `Payment mode must be one of: ${validPaymentModes.join(', ')}`
    });
  }

  if (amountReceived === undefined || isNaN(parseFloat(amountReceived)) || parseFloat(amountReceived) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount received must be a positive number'
    });
  }

  if (!receivedDate || isNaN(Date.parse(receivedDate))) {
    return res.status(400).json({
      success: false,
      message: 'A valid received date is required'
    });
  }

  next();
};

export const validateCreateOrderInput = (req, res, next) => {
  const { billId } = req.body;

  if (!billId || !uuidRegex.test(billId)) {
    return res.status(400).json({
      success: false,
      message: 'Valid bill ID is required to create a payment order'
    });
  }

  next();
};

export const validateVerifyPaymentInput = (req, res, next) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!razorpayOrderId) {
    return res.status(400).json({
      success: false,
      message: 'razorpayOrderId is required'
    });
  }

  if (!razorpayPaymentId) {
    return res.status(400).json({
      success: false,
      message: 'razorpayPaymentId is required'
    });
  }

  if (!razorpaySignature) {
    return res.status(400).json({
      success: false,
      message: 'razorpaySignature is required'
    });
  }

  next();
};

export const validateUuidParam = (req, res, next) => {
  const { propertyId, id } = req.params;
  const targetId = propertyId || id;
  if (!targetId || !uuidRegex.test(targetId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID parameter'
    });
  }
  next();
};
