export class UserNotFoundError extends Error {
  constructor(userID: string) {
    super(`user ${userID} not found`);
  }
}
