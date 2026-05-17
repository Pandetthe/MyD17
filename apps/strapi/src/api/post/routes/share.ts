export default {
  routes: [
    {
      method: "GET",
      path: "/share/post/:documentId",
      handler: "post.share",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
