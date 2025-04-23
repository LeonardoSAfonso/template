import { User } from '@prisma/client';
import prisma from '../../../prisma';
import { CreateDTO, UpdateDTO } from '../../../types/model.type';
import PaginationParams from '../../../types/pagination.type';

export default class UserRepository {
  public async create(data: CreateDTO<User>): Promise<User> {
    const user = await prisma.user.create({ data });

    await prisma.$disconnect();
    return user;
  }

  public async find(
    params: PaginationParams<User>,
    storeId: number,
    access_level: number,
  ): Promise<[User[], number]> {
    const elements = await prisma.user.count({
      ...params
        .getCount()
        .withCondition({ access_level: { gte: access_level } })
        .withCondition({ storeId }),
    });

    const users = await prisma.user.findMany({
      ...params
        .getQuery()
        .withCondition({ access_level: { gte: access_level } })
        .withCondition({ storeId }),
    });

    await prisma.$disconnect();
    return [users, elements];
  }

  public async findById(id: number): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { id },
    });

    await prisma.$disconnect();
    return user;
  }

  public async findByEmail(
    email: string,
    storeId: number,
  ): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { email, storeId },
    });

    await prisma.$disconnect();
    return user;
  }

  public async update(id: number, data: UpdateDTO<User>): Promise<User> {
    const updatedUser = await prisma.user.update({ where: { id }, data });

    await prisma.$disconnect();
    return updatedUser;
  }

  async delete(id: number): Promise<User> {
    return prisma.user.delete({ where: { id } });
  }
}
