import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from './../../core/services/http-service/http.service';
import { Injectable } from '@angular/core';
import { ApiPrefix } from '../enum/api-prefix.enum';
import { IBaseResponse } from '../interface/base-http.interface';
import { IQueryListUser, IUserResultData } from '../interface/table-user-management.interface';
import { IResponseUploadImage, IUploadImagePayload } from '../interface/file-management.interface';

@Injectable({
  providedIn: 'root'
})
export class FileManagementService {

  private PREFIX_FILE = ApiPrefix.ServiceManagement;

  constructor(
    private httpService: HttpService,
  ) { }

  async getListProduct(params: IQueryListUser): Promise<IBaseResponse<IUserResultData>> {
    try {
      const uri = this.PREFIX_FILE + `/products`;
      const response = await this.httpService.get<IUserResultData>(uri, params);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IUserResultData>;
      } else {
        throw error;
      }
    }
  }

  async uploadImage(payloads: IUploadImagePayload[]): Promise<IBaseResponse<IResponseUploadImage[]>> {
    const uri = this.PREFIX_FILE + '/files/upload';
    const formData = new FormData();

    if (payloads && payloads.length > 0) {
      payloads.forEach(p => {
        formData.append('files', p.file);
        formData.append('isPrimary', String(p.isPrimary));
      });

    }


    try {
      const response = await this.httpService.post<IResponseUploadImage[]>(uri, formData);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IResponseUploadImage[]>;
      } else {
        throw error;
      }
    }
  }
}