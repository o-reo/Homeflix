import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {User} from './user';
import {AuthsimpleService} from './authsimple.service';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  constructor(private http: HttpClient, private authService: AuthsimpleService) {}

  getUsers() {
      return this.http.get<User[]>('http://localhost:3000/api/users');
  }

  getUser(id) {
    return this.http.get<User>('http://localhost:3000/api/user/' + id);
  }

  getMyUser() {
    if ('isLog' in localStorage) {
      const headers = this.authService.getHeader_token('application/x-www-form-urlencoded');
      return this.http.get<User>('http://localhost:3000/api/myuser', {headers: headers});
    } else {
      console.log('ERREUR PAS d USERNAME ET DE PASS');
    }
  }

  deleteUser(id) {
    const headers = this.authService.getHeader_authBasic('application/x-www-form-urlencoded');
    return this.http.delete<User>('http://localhost:3000/api/user/' + id, {headers: headers});
  }

  addUser(newUser) {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.http.post<any>('http://localhost:3000/api/users', newUser, {headers: headers});
  }

  updateMyUser(newUser) {
    if ('isLog' in localStorage) {
      const headers = this.authService.getHeader_token('application/json');
      return this.http.put<User>('http://localhost:3000/api/myuser', newUser, {headers: headers});
    } else {
      console.log('PAS LOG');
    }
  }

  UpdateMyPhoto(photo) {
    if ('mail' in localStorage && 'passwd' in localStorage) {
      const headers = this.authService.getHeader_authBasic('application/json');
      return this.http.put<any>('http://localhost:3000/api/myuserphoto', photo, {headers: headers});
    } else {
      console.log('ERREUR PAS d USERNAME ET DE PASS');
    }
  }
}
