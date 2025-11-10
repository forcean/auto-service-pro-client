import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() isMinimal = false
  @Input() isCleanMenu = false
  @Output() miniBarToggled = new EventEmitter<boolean>()
  @ViewChild('btnSidebar') btnSidebar!: ElementRef<HTMLButtonElement>;


  toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  onMiniBarToggled() {
    this.isMinimal = !this.isMinimal;
    this.miniBarToggled.emit(this.isMinimal);
  }

}
