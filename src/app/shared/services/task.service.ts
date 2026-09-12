import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { HttpService } from '../../core/services/http-service/http.service';
import { ApiPrefix } from '../enum/api-prefix.enum';
import { IBaseResponse } from '../interface/base-http.interface';
import {
  ICreateTaskRequest,
  IApproveAdditionalProblemRequest,
  ITaskListResult,
  IWorkOrderTask,
  ETaskStatus,
} from '../interface/repair-flow.interface';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly apiPath = `${ApiPrefix.ServiceManagement}/task`;

  constructor(private readonly httpService: HttpService) {}

  getTasks(workOrderNo: string): Promise<IBaseResponse<ITaskListResult>> {
    return this.request(() =>
      this.httpService.get<ITaskListResult>(this.apiPath, {
        page: 1,
        limit: 100,
        workOrderNo,
      }),
    );
  }

  createTask(body: ICreateTaskRequest): Promise<IBaseResponse<IWorkOrderTask>> {
    return this.request(() => this.httpService.post<IWorkOrderTask>(this.apiPath, body));
  }

  updateStatus(taskNo: string, status: ETaskStatus): Promise<IBaseResponse<IWorkOrderTask>> {
    return this.request(() =>
      this.httpService.patch<IWorkOrderTask>(`${this.apiPath}/${taskNo}/status`, { status }),
    );
  }

  reportAdditionalProblem(taskNo: string, description: string): Promise<IBaseResponse<IWorkOrderTask>> {
    return this.request(() =>
      this.httpService.post<IWorkOrderTask>(`${this.apiPath}/${taskNo}/additional-problem`, { description }),
    );
  }

  approveAdditionalProblem(
    taskNo: string,
    problemId: string,
    body: IApproveAdditionalProblemRequest,
  ): Promise<IBaseResponse<IWorkOrderTask>> {
    return this.request(() =>
      this.httpService.post<IWorkOrderTask>(
        `${this.apiPath}/${taskNo}/additional-problem/${problemId}/approve`,
        body,
      ),
    );
  }

  private async request<T>(action: () => Promise<IBaseResponse<T>>): Promise<IBaseResponse<T>> {
    try {
      return await action();
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<T>;
      }
      throw error;
    }
  }
}
