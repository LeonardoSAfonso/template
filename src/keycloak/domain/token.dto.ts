export interface Token {
  accessToken: string;
  expiresIn: number;
  idToken: string;
  refreshToken: string;
  tokenType: string;
  sessionState: string;
  scope: string;
  sub?: string;
}
