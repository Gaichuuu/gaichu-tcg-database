export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface PaginationInfo {
  totalItems: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ApiMeta {
  requestId: string;
  timestamp: string;
  version: string;
}

export interface ApiListResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationInfo;
  meta: ApiMeta;
}

export interface ApiItemResponse<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: ApiMeta;
}

export type ApiResponse<T> =
  | ApiListResponse<T>
  | ApiItemResponse<T>
  | ApiErrorResponse;

export interface CardQueryParams {
  series?: string;
  set?: string;
  rarity?: string;
  type?: string;
  illustrator?: string;
  name?: string;
  locale?: "en" | "ja";
  limit?: number;
  offset?: number;
  sort?: "name" | "number" | "sort_by";
  order?: "asc" | "desc";
}

export interface SetQueryParams {
  series?: string;
  limit?: number;
  offset?: number;
}
