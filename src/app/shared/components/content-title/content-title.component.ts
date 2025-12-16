import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-content-title',
  standalone: false,
  templateUrl: './content-title.component.html',
  styleUrl: './content-title.component.scss',
})
export class ContentTitleComponent {
  @Input() title = 'Content Title';
  @Input() customClass = '';
}
