import { User } from '@prisma/client';
import prisma from '../../../../../prisma';
import ICreateUserDTO from '../../../dtos/ICreateUseDTO';
import IUpdateUserDTO from '../../../dtos/IUpdateUserDTO';
import IUserRepository from '../../../repositories/IUserRepository';

export default class UserRepository implements IUserRepository {
  public async create(data: ICreateUserDTO): Promise<User> {
    const user = await prisma.user.create({ data });

    await prisma.$disconnect();
    return user;
  }

  public async findAll(
    access_level: number,
    offset: number,
    limit: number,
  ): Promise<[User[], number]> {
    const elements = await prisma.user.count({
      where: { access_level: { gte: access_level } },
    });
    const users = await prisma.user.findMany({
      where: { access_level: { gte: access_level } },
      orderBy: { id: 'desc' },
      skip: offset,
      take: limit,
    });

    await prisma.$disconnect();
    return [users, elements];
  }

  public async find(
    access_level: number,
    search: string,
    offset: number,
    limit: number,
  ): Promise<[User[], number]> {
    const elements = await prisma.user.count({
      where: {
        OR: [
          {
            email: {
              contains: search,
            },
          },
          {
            name: {
              contains: search,
            },
          },
        ],
      },
    });

    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            email: {
              contains: search,
            },
            access_level: {
              gte: access_level,
            },
          },
          {
            name: {
              contains: search,
            },
            access_level: {
              gte: access_level,
            },
          },
        ],
      },
      orderBy: { id: 'desc' },
      skip: offset,
      take: limit,
    });

    await prisma.$disconnect();
    return [users, elements];
  }

  public async findById(
    id: number,
    access_level: number,
  ): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { id, access_level: { gte: access_level } },
    });

    await prisma.$disconnect();
    return user;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    await prisma.$disconnect();
    return user;
  }

  public async update(id: number, data: IUpdateUserDTO): Promise<User> {
    const updatedUser = await prisma.user.update({ where: { id }, data });

    await prisma.$disconnect();
    return updatedUser;
  }

  async delete(id: number): Promise<string> {
    await prisma.user.delete({ where: { id } });

    return 'Usuário deletado com sucesso.';
  }
}
