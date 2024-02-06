require("express-async-errors");
const express = require("express");
const config = require("./utils/config");
const app = express();
const cors = require("cors");
const blogRouter = require("./controllers/blogs");
const userRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const logger = require("./utils/logger");
const middlewares = require("./utils/middlewares");
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connecting to MongoDB:", error.message);
  });

app.use(cors());
app.use(express.json());

//extract token prior and place it in request.token
app.use(middlewares.tokenExtractor);

//now to get blogs, u must be authenticated
app.use("/api/blogs", blogRouter);

//no need to authenticate for these routes
app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);

app.use(middlewares.unknownEndpoint);
app.use(middlewares.errorHandler);

module.exports = app;
