export default interface IUpdateUserDTO {
  name?: string;
  email?: string;
  access_level?: number;
  password?: string;
  email_checked?: boolean;
  forgotten_token?: string;
  first_access?: boolean;
}
