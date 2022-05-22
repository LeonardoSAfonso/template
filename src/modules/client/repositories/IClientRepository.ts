import { Client } from '@prisma/client';
import ICreateUserDTO from '../dtos/ICreateClientDTO';
import IUpdateUserDTO from '../dtos/IUpdateClientDTO';

export default interface IUserRepository {
  create(data: ICreateUserDTO): Promise<Client>;
  findAll(
    userId: number,
    offset: number,
    limit: number,
  ): Promise<[Client[], number]>;
  find(
    userId: number,
    search: string,
    offset: number,
    limit: number,
  ): Promise<[Client[], number]>;
  findById(
    id: number,
    userId: number,
    offset: number,
    limit: number,
  ): Promise<[Client[], number]>;
  findByName(
    name: string,
    userId: number,
    offset: number,
    limit: number,
  ): Promise<[Client[], number]>;
  findByBirthday(
    initialDate: Date,
    finalDate: Date,
    userId: number,
    offset: number,
    limit: number,
  ): Promise<[Client[], number]>;
  findTotal(filter: string): Promise<{ total: number; sumSalaries: number }>;
  update(id: number, data: IUpdateUserDTO): Promise<Client>;
  delete(id: number): Promise<string>;
}
