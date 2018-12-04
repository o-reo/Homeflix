import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {User} from './user';
import {HyperAuthService} from './auth.service';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  constructor(private http: HttpClient, private authService: HyperAuthService, private translate: TranslateService) {
  }


  switchLanguage(language: string) {
    let lang = 'en';
    if (language === 'french') {
      lang = 'fr';
    } else if (language === 'spanish') {
      lang = 'sp';
    }
    this.translate.use(lang);
  }

  getUsers() {
    const headers = {};
    headers['Authorization'] = 'Bearer ' + this.authService.getToken();
    return this.http.get<User[]>(`http://${window.location.hostname}:3000/users`, {headers: headers});
  }

  getUser(id) {
    id = id || '';
    const headers = {};
    headers['Authorization'] = 'Bearer ' + this.authService.getToken();
    headers['Content-Type'] = 'application/json';
    return this.http.get(`http://${window.location.hostname}:3000/user/${id}`, {headers: headers});
  }

  addUser(newUser) {
    const headers = {};
    headers['Content-Type'] = 'application/json';
    return this.http.post<any>(`http://${window.location.hostname}:3000/user/register`, newUser, {headers: headers});
  }

  updateMyUser(newData) {
    const headers = {};
    headers['Authorization'] = 'Bearer ' + this.authService.getToken();
    headers['Content-Type'] = 'application/json';
    return this.http.put(`http://${window.location.hostname}:3000/user`, newData, {headers: headers});
  }

  Recovery(email) {
    return this.http.get(`http://${window.location.hostname}:3000/user/recovery`, {params: {email: email}});
  }
}
