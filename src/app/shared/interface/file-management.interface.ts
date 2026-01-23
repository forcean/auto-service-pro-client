export interface IUploadImagePayload {
  tempId: string;
  file: File;
  isPrimary: boolean;
}

export interface IResponseUploadImage {
  primaryId: string;
  galleryIds?: string[];
}