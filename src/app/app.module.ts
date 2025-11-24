import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CookieService } from 'ngx-cookie-service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { SharedModule } from './shared/shared.module';
import { ModalCommonService } from './shared/components/modal-common/modal-common.service';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ResponseInterceptor } from './core/interceptors/request.interceptor';
import { NotFoundComponent } from './pages/not-found/not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    LoadingBarModule,
    SharedModule,
  ],
  providers: [
    CookieService,
    ModalCommonService,
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: initializeApp,
    //   deps: [TranslateService],
    //   multi: true
    // },
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: RequestInterceptor,
    //   multi: true
    // },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ResponseInterceptor,
      multi: true
    },
    // {
    //   provide: 'ngx-extended-pdf-viewer.config',
    //   useValue: {
    //     assetFolder: 'assets'
    //   }
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
