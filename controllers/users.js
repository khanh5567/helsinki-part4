const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;
  if (password.length < 3)
    return response
      .status(400)
      .send({ error: "password length must be greater than 3" });

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
    const userLists = await User.find({}).populate("notes", {
      url: 1,
      author: 1,
      title: 1,
      id: 1,
    });
    const formattedUserLists = userLists.map((user) => user.toJSON());
    response.json(formattedUserLists);
  } catch {
    console.log("error occured");
  }
});

module.exports = usersRouter;
