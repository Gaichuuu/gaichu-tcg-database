declare type Result<Success, Failure> = {
  data?: Success;
  error?: Failure;
  isLoading: boolean;
};
export type { Result };
