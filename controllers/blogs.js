/* eslint-disable no-prototype-builtins */
const middlewares = require("../utils/middlewares");

//get token from the HTTP request header
const blogRouter = require("express").Router();
const Blog = require("../models/blog");

blogRouter.get("/", async (request, response) => {
  //similar to SELECT username, name, id WHERE user.id == blog.user_id;
  const blogs = await Blog.find({}).populate("user", {
    username: 1,
    name: 1,
    id: 1,
  });
  response.json(blogs);
});

blogRouter.use(middlewares.jwtVerification, middlewares.userExtractor);

blogRouter.post("/", async (request, response) => {
  const toBeAddedBlog = request.body;
  if (
    !toBeAddedBlog.hasOwnProperty("title") ||
    !toBeAddedBlog.hasOwnProperty("url")
  ) {
    return response.status(400).end();
  }

  //use the payload content that was associated with a user when logging in
  //to find the user in the database
  const user = request.user;

  const blog = new Blog({ ...request.body, user: request.decodedPayload.id });

  const result = await blog.save();
  //attach a user to the blog
  user.notes = user.notes.concat(blog._id);
  await user.save();

  response.status(201).json(result);
});

blogRouter.delete("/:id", async (req, res) => {
  const requestedID = req.params.id;

  const result = await Blog.findById(requestedID);

  const decodedID = req.decodedPayload.id;
  const userID = result.user.id.toString("hex");

  //console.log("decoded id", decodedID, " user id ", userID);

  if (userID !== decodedID) {
    return res.status(401).json({ error: "not authorized" });
  }

  await Blog.findByIdAndDelete(requestedID);

  const user = req.user;

  const newUserNoteLists = user.notes.filter(
    (note) => note.id.toString("hex") !== requestedID
  );
  user.notes = newUserNoteLists;
  await user.save();
  return res.status(204).end();
});

blogRouter.put("/:id", async (request, response) => {
  const body = request.body;

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, body, {
    new: true,
  });

  response.json(updatedBlog);
});

module.exports = blogRouter;
