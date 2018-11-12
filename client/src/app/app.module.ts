import 'froala-editor/js/froala_editor.pkgd.min.js';

import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {FileSelectDirective} from 'ng2-file-upload';
import {FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatChipsModule} from '@angular/material/chips';
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
// import {UsersComponent} from './users/users.component';
import {AuthComponent, DialogTemplateComponent} from './auth/auth.component';
// import {StorageServiceModule} from 'angular-webstorage-service';
import {Routes} from '@angular/router';
import {RouterModule} from '@angular/router';
import {NavbarComponent} from './navbar/navbar.component';
import {FooterComponent} from './footer/footer.component';
import {ProfileComponent} from './profile/profile.component';
import {FroalaEditorModule, FroalaViewModule} from 'angular-froala-wysiwyg';
import {ReactiveFormsModule} from '@angular/forms';
import {NgxPaginationModule} from 'ngx-pagination';
import {RegisterComponent} from './register/register.component';
import {UpdateComponent} from './update/update.component';
import {TorrentsComponent} from './torrents/torrents.component';
import {TorrentComponent} from './torrent/torrent.component';
import {MovieComponent} from './movie/movie/movie.component';
import {SearchComponent} from './movie/search/search.component';
import {CommentsComponent} from './movie/comments/comments.component';
import {CommentComponent} from './movie/comment/comment.component';
import {PostCommentComponent} from './movie/post-comment/post-comment.component';
// import {LoaderComponent} from './loader/loader.component';
import {HyperAuthService} from './auth.service';
import {SocialLoginModule, AuthServiceConfig, GoogleLoginProvider} from 'angularx-social-login';
import {AuthguardService} from './authguard.service';
import {GOOGLE_API} from './credentials';

const config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider(GOOGLE_API.clientID)
  }
]);

export function provideConfig() {
  return config;
}

const appRoutes: Routes = [
  {path: 'auth', component: AuthComponent},
  {path: '', component: AuthComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'update', component: UpdateComponent},
  {path: 'profile', canActivate: [AuthguardService], component: ProfileComponent},
  {path: 'watch', canActivate: [AuthguardService], component: TorrentsComponent},
  // {path: 'torrents/:page', canActivate: [AuthguardService], component: TorrentComponent},
  {path: 'watch/movie/:id_movie', canActivate: [AuthguardService], component: MovieComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    // UsersComponent,
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
    CommentsComponent,
    CommentComponent,
    FileSelectDirective,
    PostCommentComponent,
    DialogTemplateComponent
    // LoaderComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    MatCardModule,
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
    // StorageServiceModule,
    RouterModule.forRoot(appRoutes),
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    ReactiveFormsModule,
    NgxPaginationModule,
    SocialLoginModule
  ],
  entryComponents: [DialogTemplateComponent],
  providers: [HyperAuthService, {provide: AuthServiceConfig, useFactory: provideConfig}, AuthguardService],
  bootstrap: [AppComponent],
})

export class PizzaPartyAppModule {
}
