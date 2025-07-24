import AccountRepository from '../repository';
import AppError from 'src/shared/AppError';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class FindOneAccountService {
  constructor(private repository: AccountRepository) {}

  public async execute(id: string) {
    const account = await this.repository.findForBI(id);

    if (!account) {
      throw new AppError('ERRO: Nenhum usuário foi encontrado.', 404);
    }

    const dashboard = {
      farms: account.Farms.length,
      hectars: account.Farms.reduce((prevValue, current) => {
        prevValue += current.totalArea;
        return prevValue;
      }, 0),
      graphs: {
        states: account.Farms.reduce(
          (acc, farm) => {
            acc[farm.state] = (acc[farm.state] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),

        cities: account.Farms.reduce(
          (acc, farm) => {
            acc[farm.city] = (acc[farm.city] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),

        cultivares: account.Farms.flatMap((farm) => farm.Harvests || [])
          .flatMap((harvest) => harvest.Cultivares || [])
          .reduce(
            (acc, cultivar) => {
              acc[cultivar.name] = (acc[cultivar.name] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
      },
    };

    return { ...account, dashboard };
  }
}
