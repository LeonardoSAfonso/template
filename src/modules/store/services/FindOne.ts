import { Store } from '@prisma/client';
import AppError from '../../../shared/errors/AppError';
import StoreRepository from '../infra/Repository';

export default class FindOneStoreService {
  constructor(private storeRepository: StoreRepository) {
    this.storeRepository = storeRepository;
  }

  public async execute(id: number): Promise<Store> {
    const store = await this.storeRepository.findById(id);

    if (!store) {
      throw new AppError('ERRO: Nenhuma loja foi encontrada.', 404);
    }

    return store;
  }
}
