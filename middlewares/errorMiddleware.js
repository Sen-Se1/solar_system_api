const ApiError = require("../utils/apiError");

const sendErrorForDev = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

const sendErrorForProd = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

const handleJwtInvalidSignature = () =>
  new ApiError("Jeton invalide, veuillez vous reconnecter..", 401);

const handleJwtExpired = () =>
  new ApiError("Jeton expiré, veuillez vous reconnecter..", 401);

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Erreur";
  if (err.code === 11000) {
    const firstKey = Object.keys(err.keyValue)[0];
    err.message = `Ce ${firstKey} : '${err.keyValue[firstKey]}' existe déjà`;
  }
  if (err.name === "JsonWebTokenError") err = handleJwtInvalidSignature();
  if (err.name === "TokenExpiredError") err = handleJwtExpired();
  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    sendErrorForProd(err, res);
  }
};

module.exports = globalError;
