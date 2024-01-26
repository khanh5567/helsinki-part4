//test our API without running the server
const supertest = require("supertest");
const mongoose = require("mongoose");
mongoose.set("bufferTimeoutMS", 30000);

const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);

const Blog = require("../models/blog");

beforeEach(async () => {
  //delete all existing notes on database
  await Blog.deleteMany({});

  //create a bunch of blog model instances
  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  //save them instances to Mongo
  const promiseArray = blogObjects.map((note) => note.save());
  //ensure that all notes are saved sucessfully before moving on
  await Promise.all(promiseArray);
});

describe("GET request tests", () => {
  test("blogs returned as JSON", async () => {
    //weird syntax but whatever
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("number of blogs in the database", async () => {
    //result.body is an array
    const result = await api.get("/api/blogs");
    expect(result.body.length).toBe(helper.initialBlogs.length);
  });

  test("specific author test", async () => {
    const result = await api.get("/api/blogs");
    //map to array of authors
    const authors = result.body.map((blog) => blog.author);
    expect(authors).toContain("Edsger W. Dijkstra");
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
