// import jsPDF from 'jspdf';
// import * as htmlToImage from 'html-to-image';
import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';
import { Params } from '@angular/router';

export type MimeType = 'pdf' | 'xlsx' | 'csv' | 'png' | 'jpg' | 'txt' | 'zip';

export function exportReport(data: Blob, fileName: string) {
  const url = window.URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}

// export function exportAsImage(data: HTMLElement | null, chartType: string, typeFile: string) {
//   if (data) {
//     htmlToImage.toPng(data)
//       .then(function (dataUrl) {
//         if (typeFile.toLowerCase() === 'pdf') {
//           const pdf = new jsPDF();
//           const img = new Image();
//           img.src = dataUrl;
//           img.onload = () => {
//             const imgProps = pdf.getImageProperties(img);
//             const pdfWidth = pdf.internal.pageSize.getWidth();
//             const pdfHeight = pdf.internal.pageSize.getHeight();
//             const imgWidth = imgProps.width;
//             const imgHeight = imgProps.height;
//             const imgAspectRatio = imgWidth / imgHeight;
//             const pdfAspectRatio = pdfWidth / pdfHeight;
//             let renderWidth = 0;
//             let renderHeight = 0;
//             let xOffset = 0;
//             if (imgAspectRatio > pdfAspectRatio) {
//               renderWidth = pdfWidth;
//               renderHeight = pdfWidth / imgAspectRatio;
//               xOffset = 0;
//             } else {
//               renderHeight = pdfHeight;
//               renderWidth = pdfHeight * imgAspectRatio;
//               xOffset = (pdfWidth - renderWidth) / 2;
//             }
//             pdf.addImage(dataUrl, 'PNG', xOffset, 0, renderWidth, renderHeight);
//             pdf.save(`${chartType}.pdf`);
//           };
//         } else {
//           const link = document.createElement('a');
//           link.download = `${chartType}.${typeFile}`;
//           link.href = dataUrl;
//           link.click();
//         }
//       });
//   }
// }

export function invalidControl(formGroup: FormGroup, controlName: string) {
  return formGroup.get(controlName)?.invalid && formGroup.get(controlName)?.touched;
}

export function getFormControlValue(formGroup: FormGroup, controlName: string) {
  const control = formGroup.get(controlName);
  if (control) {
    return control.value;
  }
  return '';
}

export function getInvalidControl(formGroup: FormGroup, controlName: string) {
  const control = formGroup.get(controlName);

  if (control) {
    return control.invalid && control.dirty;
  }
  return false;
}

export function publicIdValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    const value = control.value;

    if (!value?.trim()) {
      return { mustContainAtLeastOneLetter: true };
    }

    if (!/^[a-zA-Z]/.test(value)) {
      return { mustStartWithLetter: true };
    }

    if (/(\.\.|--|__)/.test(value)) {
      return { consecutiveSpecialChars: true };
    }

    if (/^[.-]|[.-]$/.test(value)) {
      return { invalidStartOrEndChar: true };
    }


    return null;
  };
}

export function getPublicIdErrorKey(formGroup: FormGroup, controlName: string): string {
  const control = formGroup.get(controlName);
  if (!control || !control.errors) return '';

  if (control.errors['mustStartWithLetter']) {
    return 'CREATE_ADMIN_AND_USER.INVALID_START_WITH_LETTER';
  }
  if (control.errors['pattern']) {
    return 'CREATE_ADMIN_AND_USER.INVALID_CHARACTER';
  }
  if (control.errors['minlength']) {
    return 'CREATE_ADMIN_AND_USER.INVALID_MIN_LENGTH';
  }
  if (control.errors['invalidStartOrEndChar']) {
    return 'CREATE_ADMIN_AND_USER.INVALID_START_END_SPECIAL';
  }
  if (control.errors['consecutiveSpecialChars']) {
    return 'CREATE_ADMIN_AND_USER.INVALID_CONSECUTIVE_SPECIAL';
  }
  if (control.errors['mustContainAtLeastOneLetter']) {
    return 'CREATE_ADMIN_AND_USER.INVALID_LEAST_ONE_LETTER';
  }

  return '';
}

export function parseUrl(url: string): { path: string; queryParams: Params } {
  const decodedUrl = decodeURIComponent(url);
  const [path, queryString] = decodedUrl.split('?');
  const queryParams: Record<string, string> = {};

  if (queryString) {
    const isSafeKey = (key: string): boolean =>
      /^[a-zA-Z0-9_-]+$/.test(key) &&
      !['__proto__', 'constructor', 'prototype'].includes(key);

    queryString.split('&').forEach(param => {
      const [rawKey, rawValue] = param.split('=');
      const prop = decodeURIComponent(rawKey || '').trim();
      const value = decodeURIComponent(rawValue || '').trim();

      if (
        prop &&
        value !== undefined &&
        typeof prop === 'string' &&
        !Object.prototype.hasOwnProperty.call(queryParams, prop) &&
        isSafeKey(prop)
      ) {
        queryParams[prop] = value;
      }
    });
  }

  return { path, queryParams };
}

export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return email;
  }

  const emailParts = email.split('@');
  if (emailParts.length !== 2) {
    return email;
  }

  const localPart = emailParts[0];
  const domainPart = emailParts[1];

  const maskedLocalPart = localPart.length <= 3 ? localPart + 'xxx' : `${localPart.slice(0, 3)}xxx`;

  const domainParts = domainPart.split('.');
  if (domainParts.length < 2) {
    return email;
  }
  const maskedDomain = 'xxx.xxx';

  return `${maskedLocalPart}@${maskedDomain}`;
}