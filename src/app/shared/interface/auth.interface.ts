export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  isNewUser?: boolean;
}
export interface ILoginUser {
  email: string;
  password: string;
  role: string;
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
