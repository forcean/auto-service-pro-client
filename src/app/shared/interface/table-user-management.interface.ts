export interface IUserResultData {
  keyword: string;
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  users: UserList[];
}

export interface UserList {
  id: string;
  publicId: string;
  role: 'MNG' | 'ADM' | 'ACC' | 'MEC' | 'SO' | 'SAL' | 'STC';
  firstName?: string;
  lastName?: string;
  managerName: string | null;
  phoneNumber: string;
  activeFlag: boolean;
  lastAccess: string | null;
}

export interface ITableHeader {
  headerName: string;
  valueType: string;
  i18nKey?: string;
  isSort?: boolean;
}

export interface IQueryListUser extends ISearchCriteria {
  page: number;
  limit: number;
  sort?: string;
}

export interface ISearchCriteria {
  phoneNumber?: string;
  publicId?: string;
  role?: string;
}