export default interface ICreateUserDTO {
  name: string;
  email: string;
  password?: string;
  access_level: number;
}
