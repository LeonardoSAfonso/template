import { Store } from '@prisma/client';
import StoreRepository from '../infra/Repository';
import PaginationParams from '../../../types/pagination.type';
import getTotalPage from '../../../shared/utils/totalPage';

export default class FindStoresService {
  constructor(private storeRepository: StoreRepository) {
    this.storeRepository = storeRepository;
  }

  public async execute(
    params: PaginationParams<Store>,
  ): Promise<[Store[], number]> {
    const stores = await this.storeRepository.find(params);

    if (!stores[0]?.length) {
      return [[], 0];
    }

    return [stores[0], getTotalPage(stores[1], params.limit)];
  }
}
