const generateRequestId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const requestIdMiddleware = (req, res, next) => {
  const requestId = generateRequestId();

  req.requestId = requestId;

  next();
};

module.exports = requestIdMiddleware;
