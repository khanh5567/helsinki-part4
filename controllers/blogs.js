/* eslint-disable no-prototype-builtins */
const blogRouter = require("express").Router();
const Blog = require("../models/blog");

blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
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

  const blog = new Blog(request.body);

  const result = await blog.save();
  response.status(201).json(result);
});

module.exports = blogRouter;
