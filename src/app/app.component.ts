import { Component, OnInit } from '@angular/core';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { IdleSessionService } from './shared/services/idle-session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'autoservice-pro';
  constructor(
    private loadingBar: LoadingBarService,
    private idleSessionService: IdleSessionService
  ) { }

  ngOnInit() {
    const loader = this.loadingBar.useRef();
    loader.start();

    this.idleSessionService.start();

    setTimeout(() => loader.complete(), 1000);
  }
}
