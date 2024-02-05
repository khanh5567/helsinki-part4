/* eslint-disable no-prototype-builtins */
const jwt = require("jsonwebtoken");

//get token from the HTTP request header
const getTokenFrom = (request) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "");
  }
  return null;
};

const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");

blogRouter.get("/", async (request, response) => {
  //similar to SELECT username, name, id WHERE user.id == blog.user_id;
  const blogs = await Blog.find({}).populate("user", {
    username: 1,
    name: 1,
    id: 1,
  });
  response.json(blogs);
});

blogRouter.post("/", async (request, response) => {
  const toBeAddedBlog = request.body;
  if (
    !toBeAddedBlog.hasOwnProperty("title") ||
    !toBeAddedBlog.hasOwnProperty("url")
  ) {
    return response.status(400).end();
  }

  //decode the token, verify it matches our secret key, then get the payload
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
  //if we didn't receive payload, meaning verify fails
  if (!decodedToken.id) {
    return response.status(401).json({ error: "token invalid" });
  }
  //use the payload content that was associated with a user when logging in
  //to find the user in the database
  const user = await User.findById(decodedToken.id);

  const blog = new Blog(request.body);

  const result = await blog.save();

  //attach a user to the blog
  user.notes = user.notes.concat(blog._id);
  await user.save();

  response.status(201).json(result);
});

blogRouter.delete("/:id", async (req, res) => {
  const result = await Blog.findByIdAndDelete(req.params.id);
  if (result) res.status(204).end();
  else res.status(204).json({ error: "Nothing to delete" });
});

blogRouter.put("/:id", async (request, response) => {
  const body = request.body;

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, body, {
    new: true,
  });

  response.json(updatedBlog);
});

module.exports = blogRouter;
