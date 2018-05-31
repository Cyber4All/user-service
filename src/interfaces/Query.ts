export interface Query {
  limit?: number;
  page?: number;
  text?: string;
  orderBy?: OrderBy;
  sortType?: SortType;
}

export class OrderBy {
  public static NAME = 'name';
}

export enum SortType {
  Ascending = 1,
  Descending = -1
}

export class UserOrderBy extends OrderBy {
  public static USERNAME = 'username';
  public static EMAIL = 'email';
  public static ORGANIZATION = 'organization';
  public static REGISTERED_AT = 'createdAt';
}

export interface UserQuery extends Query {
  username?: string;
  name?: string;
  email?: string;
  organization?: string;
}
