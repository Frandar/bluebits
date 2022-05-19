import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';

import { AccordionModule } from 'primeng/accordion';
import { NavComponent } from './shared/nav/nav.component';
import { ProductsModule } from '@bluebits/products';
import { UiModule } from '@bluebits/ui';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OrdersModule } from '@bluebits/orders';
import { MessagesComponent } from './shared/messages/messages.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NgxStripeModule } from 'ngx-stripe';
import { JwtInterceptor, UsersModule } from '@bluebits/users';

const routes: Routes = [{ path: '', component: HomePageComponent }];
@NgModule({
    declarations: [
        AppComponent,
        HomePageComponent,
        HeaderComponent,
        FooterComponent,
        NavComponent,
        MessagesComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(routes),
        HttpClientModule,
        NgxStripeModule.forRoot(
            'pk_test_51L0cQ7KYbYI0gtCEulYgz9D9kx2HwyJhfIc7I5vnBFRkov8KFPe1hUOo3IzdDevaHoWO1H0lrv94dNBKCb92R0ZZ00adEobzOX'
        ),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        ProductsModule,
        UiModule,
        AccordionModule,
        OrdersModule,
        ToastModule,
        UsersModule
    ],
    providers: [
        MessageService,
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
    ],
    bootstrap: [AppComponent],
    exports: [MessagesComponent]
})
export class AppModule {}
