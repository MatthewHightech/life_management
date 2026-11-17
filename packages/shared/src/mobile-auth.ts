export const accessTokenMaxAgeSeconds = 60 * 60;

export const refreshTokenMaxAgeSeconds = 365 * 24 * 60 * 60;

export type MobileAuthUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

export type MobileTokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: MobileAuthUser;
};
