import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserNotFoundError } from './errors/user-not-found.error';
import { UserDTO } from './domain/user.dto';

@Injectable()
export class KeycloakUserService {
  constructor(
    private readonly admin: KeycloakAdminClient,
    private readonly jwtService: JwtService,
  ) {}

  async create(user: UserDTO): Promise<{ id: string }> {
    const kcUser = await this.admin.users
      .create({
        username: user.email,
        email: user.email,
        firstName: user.name,
        enabled: true,
        credentials: [
          {
            temporary: false,
            type: 'password',
            value: user.password,
          },
        ],
        realmRoles: ['panel'],
      })
      .catch((e) => {
        throw new Error(JSON.stringify(e));
      });

    return kcUser;
  }

  async changePassword(
    id: string,
    newPassword: string,
  ): Promise<{ id: string }> {
    const user = await this.findById(id);

    await this.admin.users.resetPassword({
      id: user.id,
      credential: {
        temporary: false,
        type: 'password',
        value: newPassword,
      },
    });

    return { id: user.id };
  }

  async activeUserEmail(token: string): Promise<boolean> {
    const { id } = await this.jwtService.verifyAsync(token);

    await this.admin.users.update(
      { id },
      {
        emailVerified: true,
      },
    );

    return true;
  }

  async update(user: Partial<UserDTO>): Promise<boolean> {
    const checkUserExists = await this.findById(user.id);

    if (!checkUserExists) {
      return false;
    }

    await this.admin.users.update(
      { id: user.id },
      {
        ...user,
      },
    );

    return true;
  }

  remove(id: string): Promise<void> {
    return this.admin.users.del({ id });
  }

  private async findById(id: string) {
    const user = await this.admin.users.findOne({ id });

    if (!user.id) {
      throw new UserNotFoundError(id);
    }

    return user;
  }

  async verifyToken(token: string): Promise<string> {
    const { email } = await this.jwtService.verifyAsync(token);
    return email;
  }
}
