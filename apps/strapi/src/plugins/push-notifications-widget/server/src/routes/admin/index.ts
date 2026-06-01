export default () => ({
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/tags",
      handler: "controller.getTags",
      config: { policies: [], auth: false },
    },
    {
      method: "POST",
      path: "/send",
      handler: "controller.sendNotification",
      config: { policies: [] },
    },
  ],
});
