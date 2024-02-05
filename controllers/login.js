const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const User = require("../models/user");

loginRouter.post("/", async (request, response) => {
  const { username, password } = request.body;

  const user = await User.findOne({ username });

  //check password against the decrypted one in the database
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  //if user not found (invalid username) orp password incorrect
  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: "invalid username or password",
    });
  }

  //payload for the token
  const userForToken = {
    username: user.username,
    id: user._id,
  };

  //digitally sign (create) a token and store it in an env var
  const token = jwt.sign(userForToken, process.env.SECRET);

  response
    .status(200)
    .send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;
