import { Store } from '@prisma/client';
import AppError from '../../../shared/errors/AppError';
import { CreateDTO } from '../../../types/model.type';
import StoreRepository from '../infra/StoreRepository';

export default class CreateStoreService {
  constructor(private storeRepository: StoreRepository) {
    this.storeRepository = storeRepository;
  }

  public async execute(storeData: CreateDTO<Store>): Promise<Store> {
    const checkStoreEmailExist = await this.storeRepository.findByEmail(
      storeData.email,
    );

    if (checkStoreEmailExist) {
      throw new AppError(
        'ERRO: O endereço de e-mail já está sendo utilizado',
        409,
      );
    }

    const checkStoreIdentificationExist =
      await this.storeRepository.findByIdentification(storeData.email);

    if (checkStoreIdentificationExist) {
      throw new AppError('ERRO: O CPF/CNPJ já está sendo utilizado', 409);
    }

    return this.storeRepository.create(storeData);
  }
}
