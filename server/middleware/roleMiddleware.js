export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permission Denied: Insufficient credentials for this action'
      });
    }
    next();
  };
};
export default restrictTo;
