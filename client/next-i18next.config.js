/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    locales: ["en", "vi"],
    defaultLocale: "en",
    localeDetection: true, // Enable automatic locale detection language from Accept-Language header of browser when the user visits the site for the first time
  },
  localePath: "./public/locales",
  reloadOnPrerender: process.env.NODE_ENV === "development",
};
