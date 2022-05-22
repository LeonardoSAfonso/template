import { Client } from '@prisma/client';
import prisma from '../../../../../prisma';
import ICreateClientDTO from '../../../dtos/ICreateClientDTO';
import IUpdateClientDTO from '../../../dtos/IUpdateClientDTO';
import IClientRepository from '../../../repositories/IClientRepository';

export default class ClientRepository implements IClientRepository {
  public async create(data: ICreateClientDTO): Promise<Client> {
    const client = await prisma.client.create({ data });

    await prisma.$disconnect();
    return client;
  }

  public async findAll(
    access_level: number,
    offset: number,
    limit: number,
  ): Promise<[Client[], number]> {
    const elements = await prisma.client.count({
      where: { access_level: { gte: access_level } },
    });
    const users = await prisma.client.findMany({
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
  ): Promise<[Client[], number]> {
    const elements = await prisma.client.count({
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

    const users = await prisma.client.findMany({
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
  ): Promise<Client | null> {
    const client = await prisma.client.findFirst({
      where: { id, access_level: { gte: access_level } },
    });

    await prisma.$disconnect();
    return client;
  }

  public async findByEmail(email: string): Promise<Client | null> {
    const client = await prisma.client.findUnique({
      where: { email },
    });

    await prisma.$disconnect();
    return client;
  }

  public async update(id: number, data: IUpdateClientDTO): Promise<Client> {
    const updatedClient = await prisma.client.update({ where: { id }, data });

    await prisma.$disconnect();
    return updatedClient;
  }

  async delete(id: number): Promise<string> {
    await prisma.client.delete({ where: { id } });

    return 'Usuário deletado com sucesso.';
  }
}
