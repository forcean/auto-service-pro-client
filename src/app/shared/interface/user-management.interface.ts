export type DataType = 'string' | 'number' | 'percent' | 'date';

export interface IReqCreateUser {
    publicId: string;
    painTextPassword: string;
    firstname?: string;
    lastname?: string;
    phoneNumber: string;
    email: string;
    role: string;
    managerId?: string;
}

export interface IReqUpdateUser {
    publicId: string;
    painTextPassword?: string;
    firstname?: string;
    lastname?: string;
    email: string;
    role: string;
    phoneNumber?: string;
    managerId?: string;
}

export interface IResponseUserDetail {
    id: string;
    publicId: string;
    firstname: string;
    lastname: string;
    email: string;
    role: string;
    phoneNumber?: string;
    managerId?: string;
    createdDt: string;
    createdBy: string;
    updatedDt: string;
    updatedBy: string;
    activeFlag: boolean;
}