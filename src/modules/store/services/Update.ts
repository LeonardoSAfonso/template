import { Store } from '@prisma/client';
import AppError from '../../../shared/errors/AppError';
import StoreRepository from '../infra/Repository';
import { UpdateDTO } from '../../../types/model.type';

export default class UpdateStoreService {
  constructor(private storeRepository: StoreRepository) {
    this.storeRepository = storeRepository;
  }

  public async execute(
    id: number,
    storeData: UpdateDTO<Store>,
  ): Promise<Store> {
    const store = await this.storeRepository.findById(id);

    if (!store) {
      throw new AppError('ERRO: Nenhuma loja foi encontrada.', 404);
    }

    if (storeData.email) {
      const checkStoreEmailExist = await this.storeRepository.findByEmail(
        storeData.email,
      );

      if (checkStoreEmailExist && storeData.email !== store.email) {
        throw new AppError(
          'ERRO: O endereço de e-mail já está sendo utilizado',
          409,
        );
      }
    }

    if (storeData.identification) {
      const checkStoreEmailExist = await this.storeRepository.findByEmail(
        storeData.identification,
      );

      if (
        checkStoreEmailExist &&
        storeData.identification !== store.identification
      ) {
        throw new AppError('ERRO: O CPF/CNPJ já está sendo utilizado', 409);
      }
    }

    const updatedStore = await this.storeRepository.update(store.id, storeData);

    return updatedStore;
  }
}
