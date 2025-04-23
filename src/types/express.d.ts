declare namespace Express {
  export interface Request {
    user: {
      id: number;
      access_level: number;
    };
  }
}
