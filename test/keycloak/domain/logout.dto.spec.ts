import { validate } from 'class-validator';
import { LogoutDTO } from 'src/keycloak/domain/logout.dto';

describe('LogoutDTO', () => {
  it('deve validar dados corretos', async () => {
    const logoutDTO = new LogoutDTO();
    logoutDTO.id = 'user-123';

    const errors = await validate(logoutDTO);
    expect(errors).toHaveLength(0);
  });

  it('deve aceitar id vazio (IsString não rejeita strings vazias)', async () => {
    const logoutDTO = new LogoutDTO();
    logoutDTO.id = '';

    const errors = await validate(logoutDTO);
    expect(errors).toHaveLength(0);
  });

  it('deve rejeitar id não string', async () => {
    const logoutDTO = new LogoutDTO();
    (logoutDTO as any).id = 123;

    const errors = await validate(logoutDTO);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('id');
    expect(errors[0].constraints?.isString).toBeDefined();
  });

  it('deve aceitar diferentes tipos de id válidos', async () => {
    const validIds = [
      'user-123',
      'admin-user',
      'test@example.com',
      '12345',
      'uuid-123e4567-e89b-12d3-a456-426614174000',
    ];

    for (const id of validIds) {
      const logoutDTO = new LogoutDTO();
      logoutDTO.id = id;

      const errors = await validate(logoutDTO);
      expect(errors).toHaveLength(0);
    }
  });

  it('deve rejeitar id null', async () => {
    const logoutDTO = new LogoutDTO();
    (logoutDTO as any).id = null;

    const errors = await validate(logoutDTO);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('id');
    expect(errors[0].constraints?.isString).toBeDefined();
  });

  it('deve rejeitar id undefined', async () => {
    const logoutDTO = new LogoutDTO();
    (logoutDTO as any).id = undefined;

    const errors = await validate(logoutDTO);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('id');
    expect(errors[0].constraints?.isString).toBeDefined();
  });
});
