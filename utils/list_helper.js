/* eslint-disable */
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

module.exports = {
  totalLikes,
  favoriteBlog,
};
