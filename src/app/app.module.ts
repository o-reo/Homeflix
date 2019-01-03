import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatChipsModule} from '@angular/material/chips';
import {VgCoreModule} from 'videogular2/core';
import {VgControlsModule} from 'videogular2/controls';
import {VgOverlayPlayModule} from 'videogular2/overlay-play';
import {VgBufferingModule} from 'videogular2/buffering';
import {VgStreamingModule} from 'videogular2/streaming';
import {IonRangeSliderModule} from 'ng2-ion-range-slider';
import {MatSliderModule} from '@angular/material/slider';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatGridListModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatDialogModule,
    MatProgressBarModule,
    MatTabsModule,
    MatListModule,
    MatBadgeModule,
    MatProgressSpinnerModule
} from '@angular/material';

import {AppComponent} from './app.component';
import {AuthComponent, DialogTemplateComponent} from './auth/auth.component';
import {Routes} from '@angular/router';
import {RouterModule} from '@angular/router';
import {NavbarComponent} from './navbar/navbar.component';
import {FooterComponent} from './footer/footer.component';
import {ProfileComponent} from './profile/profile.component';
import {ReactiveFormsModule} from '@angular/forms';
import {NgxPaginationModule} from 'ngx-pagination';
import {RegisterComponent} from './register/register.component';
import {UpdateComponent} from './update/update.component';
import {TorrentsComponent} from './torrents/torrents.component';
import {TorrentComponent, DialogSelectComponent} from './torrent/torrent.component';
import {MovieComponent, ErrorDialogTemplateComponent} from './movie/movie/movie.component';
import {SearchComponent} from './movie/search/search.component';
import {AuthguardService} from './authguard.service';
import {FileUploadModule} from 'ng2-file-upload';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}

const appRoutes: Routes = [
    {path: 'auth', component: AuthComponent},
    {path: '', component: AuthComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'update', component: UpdateComponent},
    {path: 'profile', canActivate: [AuthguardService], component: ProfileComponent},
    {path: 'watch', canActivate: [AuthguardService], component: TorrentsComponent},
    {path: 'watch/genre/:genre', canActivate: [AuthguardService], component: TorrentsComponent},
    {path: 'watch/movie/:id_movie', canActivate: [AuthguardService], component: MovieComponent},
    {path: '**', redirectTo: 'auth'}
];

@NgModule({
    declarations: [
        AppComponent,
        AuthComponent,
        NavbarComponent,
        FooterComponent,
        ProfileComponent,
        RegisterComponent,
        UpdateComponent,
        FooterComponent,
        TorrentsComponent,
        SearchComponent,
        TorrentComponent,
        MovieComponent,
        DialogTemplateComponent,
        DialogSelectComponent,
        DialogTemplateComponent,
        ErrorDialogTemplateComponent
    ],
    imports: [
        VgCoreModule,
        MalihuScrollbarModule.forRoot(),
        FileUploadModule,
        VgControlsModule,
        VgOverlayPlayModule,
        VgBufferingModule,
        VgStreamingModule,
        IonRangeSliderModule,
        BrowserModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        MatButtonModule,
        MatCheckboxModule,
        MatMenuModule,
        MatCardModule,
        MatSliderModule,
        MatIconModule,
        MatToolbarModule,
        MatInputModule,
        MatFormFieldModule,
        MatDividerModule,
        MatGridListModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatSnackBarModule,
        MatSidenavModule,
        MatBadgeModule,
        MatDialogModule,
        MatTabsModule,
        MatListModule,
        MatChipsModule,
        HttpClientModule,
        FormsModule,
        RouterModule.forRoot(appRoutes),
        ReactiveFormsModule,
        NgxPaginationModule,
    ],
    entryComponents: [DialogTemplateComponent, DialogSelectComponent, ErrorDialogTemplateComponent],
    providers: [AuthguardService],
    bootstrap: [AppComponent],
})

export class PizzaPartyAppModule {
}
