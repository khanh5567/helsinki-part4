/* eslint-disable */
var _ = require("lodash");

const totalLikes = (blogs) => {
  if (blogs.length === 0) return 0;
  else if (blogs.length === 1) return blogs[0].likes;
  else {
    return blogs.reduce((sum, currentBlog) => {
      return sum + currentBlog.likes;
    }, 0);
  }
};

const favoriteBlog = (blogs) => {
  let maxLikes = 0;
  let returnedBlog;
  blogs.forEach((blog) => {
    if (blog.likes > maxLikes) {
      returnedBlog = {
        title: blog.title,
        author: blog.author,
        likes: blog.likes,
      };
      maxLikes = blog.likes;
    }
  });

  return returnedBlog;
};

const mostBlogs = (blogs) => {
  //count the number of elements in the array that matches with (1)
  //the generated key (from the iteratee - the author) (2)
  //return an object with key (2) - value (1) pairs
  const groupedAuthor = _.countBy(blogs, (blog) => {
    return blog.author;
  });

  let maxValue = 0;
  let returnedObject;

  //loop through object to find the one with highest value
  for (const [key, value] of Object.entries(groupedAuthor)) {
    if (value > maxValue) {
      maxValue = value;
      returnedObject = {
        author: key,
        blogs: value,
      };
    }
  }

  return returnedObject;
};

const mostLikes = (blogs) => {
  let returnedObject;

  //return an object of author and their blogs
  //author being the string-keyed property, their blogs are value array
  //{'author0': [author0 blogs], ...}
  const groupedAuthor = _.groupBy(blogs, (blog) => blog.author);

  let maxLikesAuthor = 0;

  //Object.entries turn
  //{'author0': [author0 blogs], ...} to [[author0, [author0 blogs]], [...]]
  //loop through the outer array
  for ([key, value] of Object.entries(groupedAuthor)) {
    //summarize the likes, group by author
    //SO MUCH EASIER WITH SQL
    let sum = value.reduce((sum, blog) => sum + blog.likes, 0);
    if (sum > maxLikesAuthor) {
      maxLikesAuthor = sum;
      returnedObject = {
        author: key,
        likes: maxLikesAuthor,
      };
    }
  }

  //complexity of #author*#theirblogs, about n^2
  return returnedObject;
};

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
