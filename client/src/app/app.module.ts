import 'froala-editor/js/froala_editor.pkgd.min.js';

import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import { FileSelectDirective } from 'ng2-file-upload';
import {FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
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
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSnackBarModule,
  MatSidenavModule
} from '@angular/material';

import {AppComponent} from './app.component';
// import {UsersComponent} from './users/users.component';
import {AuthComponent} from './auth/auth.component';
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
import {TorrentsComponent} from './torrents/torrents.component';
import {TorrentComponent} from './torrent/torrent.component';
import {MovieComponent} from './movie/movie/movie.component';
import {SearchComponent} from './movie/search/search.component';
import {CommentsComponent} from './movie/comments/comments.component';
import {CommentComponent} from './movie/comment/comment.component';
import {PostCommentComponent} from './movie/post-comment/post-comment.component';
// import {LoaderComponent} from './loader/loader.component';
import {AuthService} from './auth.service';
import {AuthguardService} from './authguard.service';

const appRoutes: Routes = [
  {path: 'auth', component: AuthComponent},
  {path: '', component: AuthComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'profile', canActivate: [AuthguardService], component: ProfileComponent},
  {path: 'watch', canActivate: [AuthguardService], component: TorrentsComponent},
  // {path: 'torrents/:page', canActivate: [AuthguardService], component: TorrentComponent},
  {path: 'watch/movie/:id_movie', canActivate: [AuthguardService], component: MovieComponent},
  {path: 'auth/:code', component: AuthComponent}
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
    FooterComponent,
    TorrentsComponent,
    SearchComponent,
    TorrentComponent,
    MovieComponent,
    CommentsComponent,
    CommentComponent,
    FileSelectDirective,
    PostCommentComponent
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
    MatSnackBarModule,
    MatSidenavModule,
    HttpClientModule,
    FormsModule,
    // StorageServiceModule,
    RouterModule.forRoot(appRoutes),
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    ReactiveFormsModule,
    NgxPaginationModule
  ],
  providers: [AuthService, AuthguardService],
  bootstrap: [AppComponent],
})

export class PizzaPartyAppModule {
}
