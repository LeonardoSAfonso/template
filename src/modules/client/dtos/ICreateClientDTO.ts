export default interface ICreateClientDTO {
  name: string;
  cpf: string;
  marital_status: number;
  father?: string;
  mother?: string;
  partner?: string;
  rg: string;
  salary: string;
  kind: string;
  electoral_card: string;
  gender: string;
  cellphone?: string;
  zipcode: string;
  street: string;
  number: number;
  complement?: string;
  district: string;
  city: string;
  email: string;
  birthday: Date;
  user_id: number;
}
