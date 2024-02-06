const User = require("../models/user");
const jwt = require("jsonwebtoken");

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({ error: error.message });
  }

  next(error);
};

const jwtVerification = (request, response, next) => {
  //decode the token, verify it matches our secret key, then get the payload
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  //if we didn't receive payload, meaning verify fails
  if (!decodedToken.id) {
    return response.status(401).json({ error: "token invalid" });
  }

  request.decodedPayload = decodedToken;

  next();
};

const tokenExtractor = (request, response, next) => {
  const authHeader = request.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    request.token = authHeader.replace("Bearer ", "");
  }
  next();
};

const userExtractor = async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  request.user = await User.findById(decodedToken.id);

  next();
};

module.exports = {
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
  jwtVerification,
};
