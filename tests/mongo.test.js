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
}, 5000);

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

  test("object has id property", async () => {
    const result = await api.get("/api/blogs");
    expect(result.body[0].id).toBeDefined();
  });
});

describe("POST request tests", () => {
  const sampleBlog = {
    title: "Programming Fundamentals",
    author: "Alice Smith",
    url: "https://programming-books.com/fundamentals",
    likes: 98,
  };

  const faultyBlogTitle = {
    author: "Alice Smith",
    url: "https://programming-books.com/fundamentals",
    likes: 98,
  };

  const faultyBlogURL = {
    title: "Programming Fundamentals",
    author: "Alice Smith",
    likes: 98,
  };

  test("add blog to the database", async () => {
    await api
      .post("/api/blogs")
      .send(sampleBlog)
      .expect("Content-Type", /json/)
      .expect(201);

    const currentDBData = await helper.blogsInDb();

    expect(currentDBData).toHaveLength(helper.initialBlogs.length + 1);
  });

  test("new blog is added", async () => {
    await api.post("/api/blogs").send(sampleBlog);

    const currentDBData = await helper.blogsInDb();
    const titles = currentDBData.map((blog) => blog.title);

    expect(titles).toContain(sampleBlog.title);
  });

  test("bad request tests", async () => {
    const response = await api
      .post("/api/blogs")
      .send(faultyBlogTitle)
      .expect(400);

    expect(response.status).toBe(400);

    await api.post("/api/blogs").send(faultyBlogURL).expect(400);
  });
});

describe("default likes", () => {
  test("default number of like test", async () => {
    const sampleBlog = {
      title: "Programming Fundamentals",
      author: "Alice Smith",
      url: "https://programming-books.com/fundamentals",
    };

    await api.post("/api/blogs").send(sampleBlog).expect(201);

    const currentDBData = await helper.blogsInDb();
    const newlyAddedBlog = currentDBData.find(
      (blog) => blog.title === sampleBlog.title
    );

    expect(newlyAddedBlog.likes).toBe(0);
  });
});

describe("DELETE tests", () => {
  test("succeeds with status code 204 if id is valid", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

    const contents = blogsAtEnd.map((r) => r.title);
    expect(contents).not.toContain(blogToDelete.title);
  });

  test("failed deletion", async () => {
    await api.delete("/api/blogs/not_a_valid_id").expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });
});

describe("UPDATE tests", () => {
  test("change number of likes", async () => {
    const initialBlogs = await helper.blogsInDb();
    const updateNote = { ...initialBlogs[0], likes: 77 };

    await api.put(`/api/blogs/${updateNote.id}`).send(updateNote).expect(200);

    const blogAfterUpdate = await Blog.findById(updateNote.id);
    expect(blogAfterUpdate.likes).toBe(77);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
