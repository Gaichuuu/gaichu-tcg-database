export type AppResult<T, E> = {
  data: T | undefined;
  error: E | undefined;
  isLoading: boolean;
};
// TODO: saori - remove it
