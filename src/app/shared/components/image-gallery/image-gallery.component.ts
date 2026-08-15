import {
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';

export interface IImageGalleryItem {

    id: string;

    url: string;

    thumbnail?: string;

    title?: string;

    description?: string;

    uploadedAt?: string;

}
@Component({
  selector: 'app-image-gallery',
  standalone: false,
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.scss'
})
export class ImageGalleryComponent {

    @Input() title = '';
    @Input() description = '';
    @Input() emptyTitle = 'No Images';
    @Input() emptyDescription = '';
    @Input() showUpload = false;
    @Input() showDelete = false;
    @Input() images: IImageGalleryItem[] = [];

    @Output() upload = new EventEmitter<void>();
    @Output() preview = new EventEmitter<IImageGalleryItem>();
    @Output() download = new EventEmitter<IImageGalleryItem>();
    @Output() delete = new EventEmitter<IImageGalleryItem>();

}
