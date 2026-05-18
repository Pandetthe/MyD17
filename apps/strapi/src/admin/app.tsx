import type { StrapiApp, WidgetArgs } from "@strapi/admin/strapi-admin";

declare global {
  interface Window {
    strapi: {
      isEE: boolean;
      features: { isEnabled: (feature: string) => boolean };
      flags?: { promoteEE?: boolean };
    };
  }
}

const HIDDEN_SETTING_IDS = new Set([
  "content-releases",
  "review-workflows",
  "sso-purchase-page",
  "content-history-purchase-page",
]);

const register = (app: StrapiApp) => {
  if (window.strapi.isEE) return;

  const menu = app.router.menu;
  const cloudIdx = menu.findIndex((item) => item.to === "plugins/cloud");
  if (cloudIdx !== -1) menu.splice(cloudIdx, 1);

  const global = app.router.settings["global"];
  if (global) {
    global.links = global.links.filter(
      (link) => !HIDDEN_SETTING_IDS.has(link.id),
    );
  }

  app.widgets.register((widgets: WidgetArgs[]) =>
    widgets.filter((w) => w.id !== "deploy-now"),
  );
};

const bootstrap = () => {
  const preconnect1 = document.createElement("link");
  preconnect1.rel = "preconnect";
  preconnect1.href = "https://fonts.googleapis.com";
  document.head.appendChild(preconnect1);

  const preconnect2 = document.createElement("link");
  preconnect2.rel = "preconnect";
  preconnect2.href = "https://fonts.gstatic.com";
  preconnect2.crossOrigin = "anonymous";
  document.head.appendChild(preconnect2);

  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href =
    "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap";
  document.head.appendChild(fontLink);

  const style = document.createElement("style");
  style.textContent = `* { font-family: 'Montserrat', sans-serif !important; }`;
  document.head.appendChild(style);
};

export default {
  config: {
    auth: { logo: "/logo.png" },
    head: { favicon: "/logo.png" },
    menu: { logo: "/logo.png" },
    theme: {
      light: {
        colors: {
          primary100: "#E6F4FE",
          primary200: "#BAD7F1",
          primary500: "#2198FF",
          primary600: "#1065AF",
          primary700: "#0d56a0",
          neutral0: "#FFFFFF",
          neutral100: "#F8FAFC",
          neutral150: "#EBF4FC",
          neutral200: "#D6E8F7",
          neutral300: "#BAD7F1",
          neutral400: "#85B9E5",
          neutral500: "#53535D",
          neutral600: "#53535D",
          neutral700: "#212C3F",
          neutral800: "#212C3F",
          neutral900: "#151C28",
          neutral1000: "#0A0F1A",
          danger100: "#FEF2F2",
          danger200: "#FFC9C9",
          danger500: "#E7000B",
          danger600: "#822025",
          danger700: "#460809",
          success100: "#DCF6DC",
          success200: "#D8F999",
          success500: "#5EA500",
          success600: "#126427",
          success700: "#032E15",
          warning100: "#FFF6E5",
          warning200: "#FFDD8F",
          warning500: "#F6A200",
          warning600: "#693F05",
          warning700: "#341C00",
          buttonNeutral0: "#FFFFFF",
          buttonPrimary500: "#FFFFFF",
          buttonPrimary600: "#1065AF",
        },
      },
      dark: {
        colors: {
          primary100: "#0d3d6e",
          primary200: "#0d56a0",
          primary500: "#1065AF",
          primary600: "#2198FF",
          primary700: "#85B9E5",
          neutral0: "#151C28",
          neutral100: "#1a2436",
          neutral150: "#1f2b40",
          neutral200: "#212C3F",
          neutral300: "#2e3f59",
          neutral400: "#53535D",
          neutral500: "#85B9E5",
          neutral600: "#BAD7F1",
          neutral700: "#D6E8F7",
          neutral800: "#EBF4FC",
          neutral900: "#F8FAFC",
          neutral1000: "#FFFFFF",
          danger100: "#460809",
          danger200: "#822025",
          danger500: "#E7000B",
          danger600: "#FFC9C9",
          danger700: "#FEF2F2",
          success100: "#032E15",
          success200: "#126427",
          success500: "#5EA500",
          success600: "#D8F999",
          success700: "#DCF6DC",
          warning100: "#341C00",
          warning200: "#693F05",
          warning500: "#F6A200",
          warning600: "#FFDD8F",
          warning700: "#FFF6E5",
          buttonNeutral0: "#151C28",
          buttonPrimary500: "#FFFFFF",
          buttonPrimary600: "#2198FF",
        },
      },
    },
    locales: ["pl"],
    translations: {
      en: {
        "app.components.LeftMenu.navbrand.title": "MyD17 Dashboard",
        "Auth.form.welcome.title": "Welcome to MyD17!",
        "Auth.form.welcome.subtitle": "Log in to your MyD17 account",
        "Auth.form.register.subtitle":
          "Credentials are only used to authenticate in MyD17. All saved data will be stored in your database.",
        "Settings.application.strapi-version": "MyD17 version",
        "Settings.application.strapiVersion": "MyD17 version",
        "Settings.permissions.users.listview.header.subtitle":
          "All the users who have access to the MyD17 admin panel",
        "tours.overview.subtitle":
          "Follow the guided tour to get the most out of MyD17.",
      },
      pl: {
        "app.components.LeftMenu.navbrand.title": "MyD17 Dashboard",
        "Auth.form.welcome.title": "Witaj w MyD17!",
        "Auth.form.register.subtitle":
          "Dane logowania używane są tylko do uwierzytelniania w MyD17. Wszystkie zapisane dane będą przechowywane w twojej bazie danych.",
        "Settings.application.strapi-version": "Wersja MyD17",
        "Settings.application.strapiVersion": "Wersja MyD17",
        "Settings.permissions.users.listview.header.subtitle":
          "Wszyscy użytkownicy mający dostęp do panelu admina MyD17.",
        "tours.overview.subtitle":
          "Skorzystaj z przewodnika, aby jak najlepiej wykorzystać MyD17.",
      },
    },
  },
  register,
  bootstrap,
};
