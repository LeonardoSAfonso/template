type CreateDTO<T> = Omit<T, 'id' | 'createdAt' | 'updateAt'>;

type UpdateDTO<T> = Partial<T>;

export { CreateDTO, UpdateDTO };
