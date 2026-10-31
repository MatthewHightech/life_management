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

  const ios = {
    supportsTablet: false,
    bundleIdentifier: "sh.mattsmith.life",
    deploymentTarget: "18.0",
    appleTeamId: "X5CT5W338V",
    config: {
      usesNonExemptEncryption: false,
    },
  };

  // Keep Expo's primary scheme as "life" for Metro / deep links.
  // Register Google's reverse-client-ID scheme separately so OAuth redirects work
  // without Expo treating it as the development-client URL.
  if (googleScheme) {
    ios.infoPlist = {
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: ["life", "sh.mattsmith.life", googleScheme],
        },
      ],
    };
  }

  return {
    expo: {
      name: "Life",
      slug: "life",
      version: "0.1.0",
      orientation: "portrait",
      icon: "./assets/images/icon.png",
      scheme: "life",
      userInterfaceStyle: "light",
      ios,
      plugins: [
        "expo-router",
        [
          "expo-splash-screen",
          {
            image: "./assets/images/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#f8f9fa",
          },
        ],
        "expo-secure-store",
        "@react-native-community/datetimepicker",
      ],
      extra: {
        router: {},
        eas: {
          projectId: "fd3bd601-f280-422a-9957-0b15ece31e07",
        },
      },
    },
  };
};
