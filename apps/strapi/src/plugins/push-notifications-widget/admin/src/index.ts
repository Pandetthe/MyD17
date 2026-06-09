import { PLUGIN_ID } from "./pluginId";
import { Initializer } from "./components/Initializer";
import { PaperPlane } from "@strapi/icons";

export default {
  register(app: any) {
    app.widgets.register({
    icon: PaperPlane,
    title: {
      id: `${PLUGIN_ID}.widget.push.title`,
      defaultMessage: "Push Notifications",
    },
    component: async () => {
      const component = await import("./components/PushWidget");
      return component.default;
    },
    id: "content-push",
    pluginId: PLUGIN_ID,
  });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(
            `./translations/${locale}.json`
          );

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};