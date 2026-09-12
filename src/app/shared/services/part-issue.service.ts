import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { HttpService } from '../../core/services/http-service/http.service';
import { ApiPrefix } from '../enum/api-prefix.enum';
import { IBaseResponse } from '../interface/base-http.interface';
import { ICreatePartIssueRequest, IPartIssue } from '../interface/repair-flow.interface';

@Injectable({ providedIn: 'root' })
export class PartIssueService {
  private readonly apiPath = `${ApiPrefix.ServiceManagement}/part-issues`;

  constructor(private readonly httpService: HttpService) {}

  create(body: ICreatePartIssueRequest): Promise<IBaseResponse<IPartIssue>> {
    return this.request(() => this.httpService.post<IPartIssue>(this.apiPath, body));
  }

  getByIssueNo(issueNo: string): Promise<IBaseResponse<IPartIssue>> {
    return this.request(() => this.httpService.get<IPartIssue>(`${this.apiPath}/${issueNo}`));
  }

  reserve(issueNo: string): Promise<IBaseResponse<IPartIssue>> {
    return this.request(() => this.httpService.post<IPartIssue>(`${this.apiPath}/${issueNo}/reserve`, {}));
  }

  issue(
    issueNo: string,
    items: Array<{ productId: string; issuedQty: number; remark?: string }>,
    remark?: string,
  ): Promise<IBaseResponse<IPartIssue>> {
    return this.request(() =>
      this.httpService.post<IPartIssue>(`${this.apiPath}/${issueNo}/issue`, { items, remark }),
    );
  }

  cancel(issueNo: string, remark: string): Promise<IBaseResponse<IPartIssue>> {
    return this.request(() =>
      this.httpService.patch<IPartIssue>(`${this.apiPath}/${issueNo}/cancel`, { remark }),
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
