/* eslint-disable no-prototype-builtins */
const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");

blogRouter.get("/", async (request, response) => {
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

  const user = await User.findById(request.body.user);
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
