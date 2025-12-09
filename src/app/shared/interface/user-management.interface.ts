export type DataType = 'string' | 'number' | 'percent' | 'date';

export interface IReqCreateUser {
    publicId: string;
    painTextPassword: string;
    firstName?: string;
    lastName?: string;
    phoneNumber: string;
    email: string;
    role: string;
    managerId?: string;
}

export interface IReqUpdateUser {
    publicId: string;
    painTextPassword?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: string;
    phoneNumber?: string;
    managerId?: string;
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

export interface IUserResultData {
    limit: number;
    page: number;
    total: number;
    totalPage: number;
    users: IUser[];
}

export interface IUser {
    id: string;
    publicId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'MNG' | 'ADM' | 'ACC' | 'MEC' | 'SO' | 'SAL' | 'STC';
    phoneNumber: string;
    managerId: string;
    createdDt: string;
}