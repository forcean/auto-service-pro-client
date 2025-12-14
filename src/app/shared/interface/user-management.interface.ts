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