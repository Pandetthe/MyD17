export default () => ({
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/tags",
      handler: "controller.getTags",
      config: { policies: [] },
    },
    {
      method: "POST",
      path: "/send",
      handler: "controller.sendNotification",
      config: { policies: [] },
    },
  ],
});