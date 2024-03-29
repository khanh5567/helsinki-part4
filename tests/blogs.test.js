/* eslint-disable */
const listHelper = require("../utils/list_helper");

const listWithOneBlog = [
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0,
  },
];

const blogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0,
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0,
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0,
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0,
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0,
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0,
  },
];

describe("total blog likes", () => {
  const listWithZeroBlog = [];

  test("when list has only one blog, equals the likes of that", () => {
    const result = listHelper.totalLikes(listWithOneBlog);
    expect(result).toBe(5);
  });

  test("zero blogs", () => {
    const result = listHelper.totalLikes(listWithZeroBlog);
    expect(result).toBe(0);
  });

  test("normal blogs", () => {
    const result = listHelper.totalLikes(blogs);
    expect(result).toBe(36);
  });
});

describe("blog with most likes", () => {
  const result = {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    likes: 12,
  };

  const resultWithOneBlog = {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    likes: 5,
  };

  test("list with one blog", () => {
    expect(listHelper.favoriteBlog(listWithOneBlog)).toEqual(resultWithOneBlog);
  });

  test("normal list", () => {
    expect(listHelper.favoriteBlog(blogs)).toEqual(result);
  });
});

describe("most blogs author", () => {
  const result = {
    author: "Robert C. Martin",
    blogs: 3,
  };

  const resultWithOneBlog = {
    author: "Edsger W. Dijkstra",
    blogs: 1,
  };

  test("list with one blog", () => {
    expect(listHelper.mostBlogs(listWithOneBlog)).toEqual(resultWithOneBlog);
  });

  test("normal list", () => {
    expect(listHelper.mostBlogs(blogs)).toEqual(result);
  });
});

describe("most liked author", () => {
  const result = {
    author: "Edsger W. Dijkstra",
    likes: 17,
  };

  const resultWithOneBlog = {
    author: "Edsger W. Dijkstra",
    likes: 5,
  };

  test("list with one blog", () => {
    expect(listHelper.mostLikes(listWithOneBlog)).toEqual(resultWithOneBlog);
  });

  test("normal list", () => {
    expect(listHelper.mostLikes(blogs)).toEqual(result);
  });
});
