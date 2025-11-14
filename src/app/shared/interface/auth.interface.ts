export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  isNewUser?: boolean;
}
export interface ILoginUser {
  publicId: string;
  painTextPassword: string;
}

export interface IReqRefreshToken {
  accessToken: string;
  refreshToken: string
}

export interface IResponseToken {
  accessToken: string;
  accessTokenExpireAt: string;
  refreshToken: string;
  refreshTokenExpireAt: string;
}
