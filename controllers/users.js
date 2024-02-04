const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

usersRouter.get("/", async (request, response) => {
  try {
    const userLists = await User.find({});
    const formattedUserLists = userLists.map((user) => user.toJSON());
    response.json(formattedUserLists);
  } catch {
    console.log("error occured");
  }
});

module.exports = usersRouter;
