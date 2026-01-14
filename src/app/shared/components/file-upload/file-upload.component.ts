import { Component, EventEmitter, Output } from '@angular/core';

interface PreviewImage {
  file: File;
  preview: string;
  isPrimary: boolean;
  tempId: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: false,
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent {

  @Output() uploaded = new EventEmitter<{
    file: File;
    isPrimary: boolean;
    tempId: string;
  }>();

  images: PreviewImage[] = [];

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    Array.from(input.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const isPrimary = this.images.length === 0;

        const image: PreviewImage = {
          file,
          preview: reader.result as string,
          isPrimary,
          tempId: crypto.randomUUID(),
        };

        this.images.push(image);

        this.uploaded.emit({
          file,
          isPrimary,
          tempId: image.tempId,
        });
      };

      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  setPrimary(index: number): void {
    this.images.forEach((img, i) => (img.isPrimary = i === index));
  }

  remove(index: number): void {
    this.images.splice(index, 1);

    if (!this.images.some(i => i.isPrimary) && this.images.length) {
      this.images[0].isPrimary = true;
    }
  }
}
