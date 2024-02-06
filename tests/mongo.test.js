//test our API without running the server
const supertest = require("supertest");
const mongoose = require("mongoose");
mongoose.set("bufferTimeoutMS", 30000);
jest.setTimeout(10000);

const bcrypt = require("bcrypt");
const User = require("../models/user");

const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);

const Blog = require("../models/blog");

let loginToken = "";
let user = undefined;

beforeEach(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("sekret", 10);
  const admin = new User({ username: "root", passwordHash });

  const createdUser = await admin.save();

  //delete all existing notes on database
  await Blog.deleteMany({});

  //create a bunch of blog model instances
  const blogObjects = helper.initialBlogs.map(
    (blog) => new Blog({ ...blog, user: createdUser.toJSON().id })
  );
  //save them instances to Mongo
  const promiseArray = blogObjects.map((note) => note.save());
  //ensure that all notes are saved sucessfully before moving on
  await Promise.all(promiseArray);

  user = await api
    .post("/api/login")
    .send({ username: "root", password: "sekret" });

  loginToken = "Bearer " + user._body.token;
}, 10000);

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

  test("add blog to the database", async () => {
    await api
      .post("/api/blogs")
      .send(sampleBlog)
      .set({ Authorization: loginToken })
      .expect("Content-Type", /json/)
      .expect(201);

    const currentDBData = await helper.blogsInDb();

    expect(currentDBData).toHaveLength(helper.initialBlogs.length + 1);

    const titles = currentDBData.map((blog) => blog.title);

    expect(titles).toContain(sampleBlog.title);
    //verify blogs have user assigned to it
    currentDBData.forEach((blog) => expect(blog.user).toBeDefined());
  });

  test("bad request tests", async () => {
    await api.post("/api/blogs").send(faultyBlogTitle).expect(401);
    await api.post("/api/blogs").send(sampleBlog).expect(401);
  });
});

describe("DELETE tests", () => {
  test("succeeds with status code 204 if id is valid", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set({ Authorization: loginToken })
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

    const contents = blogsAtEnd.map((r) => r.title);
    expect(contents).not.toContain(blogToDelete.title);
  });

  test("failed deletion", async () => {
    await api
      .delete("/api/blogs/not_a_valid_id")
      .set({ Authorization: loginToken })
      .expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });
});

describe("UPDATE tests", () => {
  test("change number of likes", async () => {
    const initialBlogs = await helper.blogsInDb();
    const updateNote = { ...initialBlogs[0], likes: 77 };

    await api
      .put(`/api/blogs/${updateNote.id}`)
      .send(updateNote)
      .set({ Authorization: loginToken })
      .expect(200);

    const blogAfterUpdate = await Blog.findById(updateNote.id);
    expect(blogAfterUpdate.likes).toBe(77);
  });
});

describe("operations with users", () => {
  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test("creation fails with validation", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "mlu",
      name: "Matti Luukkainen",
      password: "sa",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toBeDefined();
    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test("create blog with a user associated with it", async () => {
    const rootUser = await User.findOne({ username: "root" });
    const sampleUserID = rootUser._id.toString();

    const blogToBeSaved = {
      title: "Test",
      author: "Jimmy",
      url: "dotcom",
      likes: 7,
      user: sampleUserID,
    };

    await api
      .post("/api/blogs")
      .send(blogToBeSaved)
      .set({ Authorization: loginToken })
      .expect(201)
      .expect("Content-Type", /application\/json/);

    await api.post("/api/blogs").send(blogToBeSaved).expect(401);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
