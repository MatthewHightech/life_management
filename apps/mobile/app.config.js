const appJson = require("./app.json");

/** Google iOS clients redirect to com.googleusercontent.apps.<client-id-prefix>:/oauthredirect */
function googleIosUrlScheme() {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
  if (!clientId) {
    return null;
  }
  const prefix = clientId.replace(/\.apps\.googleusercontent\.com$/i, "");
  return `com.googleusercontent.apps.${prefix}`;
}

module.exports = () => {
  const googleScheme = googleIosUrlScheme();
  const ios = { ...(appJson.expo.ios ?? {}) };

  // Keep Expo's primary scheme as "life" for Metro / deep links.
  // Register Google's reverse-client-ID scheme separately so OAuth redirects work
  // without Expo treating it as the development-client URL.
  if (googleScheme) {
    ios.infoPlist = {
      ...(ios.infoPlist ?? {}),
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: ["life", "sh.mattsmith.life", googleScheme],
        },
      ],
    };
  }

  return {
    expo: {
      ...appJson.expo,
      scheme: "life",
      ios,
    },
  };
};
