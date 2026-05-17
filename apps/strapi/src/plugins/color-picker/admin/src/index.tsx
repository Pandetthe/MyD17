export default {
  register(app: any) {
    app.customFields.register({
      name: "color",
      pluginId: "color-picker",
      type: "string",
      intlLabel: { id: "color-picker.label", defaultMessage: "Color" },
      intlDescription: {
        id: "color-picker.description",
        defaultMessage: "Pick a color from defined set",
      },
      components: {
        Input: async () => import("./ColorPickerInput"),
      },
      options: {
        advanced: [
          {
            sectionTitle: { id: "global.settings", defaultMessage: "Settings" },
            items: [
              {
                name: "required",
                type: "checkbox",
                intlLabel: {
                  id: "color-picker.form.attribute.item.requiredField",
                  defaultMessage: "Required field",
                },
                description: {
                  id: "color-picker.form.attribute.item.requiredField.description",
                  defaultMessage:
                    "You won't be able to create an entry if this field is empty",
                },
              },
              {
                name: "private",
                type: "checkbox",
                intlLabel: {
                  id: "color-picker.form.attribute.item.privateField",
                  defaultMessage: "Private field",
                },
                description: {
                  id: "color-picker.form.attribute.item.privateField.description",
                  defaultMessage:
                    "This field will not show up in the API response",
                },
              },
            ],
          },
        ],
      },
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
