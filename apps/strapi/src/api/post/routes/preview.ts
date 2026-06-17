export default {
  routes: [
    {
      method: "GET",
      path: "/preview",
      handler: "post.preview",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/preview-content",
      handler: "post.previewContent",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
