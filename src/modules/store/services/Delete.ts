import { Store } from '@prisma/client';
import AppError from '../../../shared/errors/AppError';
import StoreRepository from '../infra/Repository';

export default class DeleteStoreservice {
  constructor(private storeRepository: StoreRepository) {
    this.storeRepository = storeRepository;
  }

  public async execute(id: number): Promise<Store> {
    const checkStoreExist = await this.storeRepository.findById(id);

    if (!checkStoreExist) {
      throw new AppError('ERRO: Nenhuma loja foi encontrado.', 404);
    }

    const store = await this.storeRepository.delete(id);

    return store;
  }
}
