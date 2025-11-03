/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  gender: string;
  country: string;
  age: number;
  picture: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface UsersResponse {
  data: UserSummary[];
  pagination: PaginationMeta;
  availableCountries: string[];
  availableGenders: string[];
  lastUpdated: string;
}
