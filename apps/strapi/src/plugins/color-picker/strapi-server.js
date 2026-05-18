"use strict";

module.exports = {
  register({ strapi }) {
    strapi.customFields.register({
      name: "color",
      plugin: "color-picker",
      type: "string",
    });
  },
};
