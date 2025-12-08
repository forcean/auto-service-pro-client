export type DataType = 'string' | 'number' | 'percent' | 'date';

export interface IReqCreateUser {
    publicId: string;
    painTextPassword: string;
    firstname?: string;
    lastname?: string;
    phoneNumber: string;
    email: string;
    // sysEmail: string;
    role: string;
    managerId?: string;
}

export interface IReqUpdateUser {
    publicId: string;
    painTextPassword?: string;
    firstName?: string;
    lastName?: string;
    sysEmail: string;
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
    users: IListUser[];
}

export interface IListUser {
    id: string;
    chargeNumber: string;
    senderName: string;
    defaultSender: boolean;
    senderType: number;
    createDt: string;
    status: 'Waiting for Approve' | 'Rejected' | 'Reject' | 'reject' | 'rejected' | 'Approved';
    approvedDt: string;
    approvedBy: string;
    remark: string;
}