import { Store } from '@prisma/client';
import prisma from '../../../prisma';
import { CreateDTO, UpdateDTO } from '../../../types/model.type';
import PaginationParams from '../../../types/pagination.type';

export default class StoreRepository {
  public async create(data: CreateDTO<Store>): Promise<Store> {
    const store = await prisma.store.create({ data });

    await prisma.$disconnect();
    return store;
  }

  public async find(
    params: PaginationParams<Store>,
  ): Promise<[Store[], number]> {
    const elements = await prisma.store.count({ ...params.getCount() });

    const stores = await prisma.store.findMany({ ...params.getQuery() });

    await prisma.$disconnect();
    return [stores, elements];
  }

  public async findById(id: number): Promise<Store | null> {
    const store = await prisma.store.findFirst({
      where: { id },
    });

    await prisma.$disconnect();
    return store;
  }

  public async findByEmail(email: string): Promise<Store | null> {
    const store = await prisma.store.findUnique({
      where: { email },
    });

    await prisma.$disconnect();
    return store;
  }

  public async findByIdentification(
    identification: string,
  ): Promise<Store | null> {
    const store = await prisma.store.findUnique({
      where: { identification },
    });

    await prisma.$disconnect();
    return store;
  }

  public async update(id: number, data: UpdateDTO<Store>): Promise<Store> {
    const updatedStore = await prisma.store.update({ where: { id }, data });

    await prisma.$disconnect();
    return updatedStore;
  }

  async delete(id: number): Promise<Store> {
    return prisma.store.delete({ where: { id } });
  }
}
