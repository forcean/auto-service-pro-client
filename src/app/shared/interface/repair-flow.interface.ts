export enum ETaskStatus {
  WAITING = 'WAITING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  QUALITY_CHECK = 'QUALITY_CHECK',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

export enum ETaskPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface IAssignedMechanic {
  mechanicId: string;
  mechanicName?: string;
}

export interface IAdditionalProblem {
  _id: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface IWorkOrderTask {
  _id: string;
  workOrderNo: string;
  taskNo: string;
  title: string;
  description?: string;
  priority: ETaskPriority;
  status: ETaskStatus;
  estimateMinute: number;
  actualMinute: number;
  progress: number;
  isRework: boolean;
  mechanics: IAssignedMechanic[];
  additionalProblems: IAdditionalProblem[];
  remark?: string;
  plannedStartDate?: string;
  plannedFinishDate?: string;
  startedAt?: string;
  finishedAt?: string;
  isDeleted?: boolean;
  createdBy?: string;
  createdDt?: string;
  updatedBy?: string;
  deletedBy?: string;
  deletedDt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ITaskListResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: IWorkOrderTask[];
}

export interface ICreateTaskRequest {
  workOrderNo: string;
  title: string;
  description?: string;
  priority?: ETaskPriority;
  status?: ETaskStatus;
  estimateMinute?: number;
  actualMinute?: number;
  plannedStartDate?: string;
  plannedFinishDate?: string;
  mechanics?: IAssignedMechanic[];
  remark?: string;
  isRework?: boolean;
}

export interface IUpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: ETaskPriority;
  estimateMinute?: number;
  actualMinute?: number;
  plannedStartDate?: string;
  plannedFinishDate?: string;
  progress?: number;
  mechanics?: IAssignedMechanic[];
  remark?: string;
}

export interface ICreatePartIssueRequest {
  workOrderNo: string;
  taskNo: string;
  quotationId: string;
  remark?: string;
  items: Array<{
    productId: string;
    sku: string;
    productName: string;
    requestedQty: number;
    reason: 'NORMAL' | 'ADDITIONAL' | 'DAMAGED' | 'REPLACEMENT';
    isAdditionalCharge: boolean;
    unitPrice: number;
    remark?: string;
  }>;
}

export interface IPartIssue {
  _id: string;
  issueNo: string;
  workOrderNo: string;
  taskNo: string;
  quotationId: string;
  quotationNo: string;
  status: 'REQUESTED' | 'RESERVED' | 'PARTIAL' | 'ISSUED' | 'CANCELLED';
  items: Array<{
    productId: string;
    sku: string;
    productName: string;
    requestedQty: number;
    reservedQty: number;
    issuedQty: number;
    reason: 'NORMAL' | 'ADDITIONAL' | 'DAMAGED' | 'REPLACEMENT';
    isAdditionalCharge: boolean;
    unitPrice: number;
    remark?: string;
  }>;
  requestedBy?: string;
  requestedByName?: string;
  requestedAt?: string;
  issuedBy?: string;
  issuedByName?: string;
  issuedAt?: string;
  remark?: string;
  isDeleted?: boolean;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  deletedDt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPartIssueListResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: IPartIssue[];
}

export interface IQuotationPartAvailability {
  productId: string;
  sku: string;
  productName: string;
  quotationQty: number;
  requestedQty: number;
  reservedQty: number;
  issuedQty: number;
  availableQty: number;
  unitPrice: number;
}

export interface IQuotationPartAvailabilityResult {
  quotationId: string;
  quotationNo: string;
  items: IQuotationPartAvailability[];
}

export interface IIssuePartIssueRequest {
  items: Array<{ productId: string; issuedQty: number; remark?: string }>;
  remark?: string;
}

export interface IApproveAdditionalProblemRequest {
  quotationId: string;
  title?: string;
  estimateMinute?: number;
}
