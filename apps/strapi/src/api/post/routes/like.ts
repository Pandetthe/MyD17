export default {
  routes: [
    {
      method: "POST",
      path: "/posts/:documentId/like",
      handler: "post.like",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
