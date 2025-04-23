import { User } from '@prisma/client';
import UserRepository from '../infra/Repository';
import PaginationParams from '../../../types/pagination.type';
import getTotalPage from '../../../shared/utils/totalPage';
import SessionInfo from '../../../types/sessionInfo';

export default class FindUsersService {
  constructor(private repository: UserRepository) {
    this.repository = repository;
  }

  public async execute(
    params: PaginationParams<User>,
    session: SessionInfo,
  ): Promise<[User[], number]> {
    const users = await this.repository.find(
      params,
      session.storeId,
      session.access_level,
    );

    if (!users[0]?.length) {
      return [[], 0];
    }

    return [users[0], getTotalPage(users[1], params.limit)];
  }
}
