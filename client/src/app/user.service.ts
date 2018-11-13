import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {User} from './user';
import {HyperAuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  constructor(private http: HttpClient, private authService: HyperAuthService) {
  }

  getUsers() {
    const headers = {};
    headers['Authorization'] = 'Bearer ' + this.authService.getToken();
    return this.http.get<User[]>('http://localhost:3000/users', {headers: headers});
  }

  getUser(id) {
    id = id || '';
    const header = {};
    header['Authorization'] = 'Bearer ' + this.authService.getToken();
    header['Content-Type'] = 'application/json';
    return this.http.get('http://localhost:3000/user/' + id, {headers: header});
  }

  addUser(newUser) {
    const headers = {};
    headers['Content-Type'] = 'application/json';
    return this.http.post<any>('http://localhost:3000/user/register', newUser, {headers: headers});
  }

  updateMyUser(newData) {
    const headers = {};
    headers['Authorization'] = 'Bearer ' + this.authService.getToken();
    headers['Content-Type'] = 'application/json';
    return this.http.put('http://localhost:3000/user', newData, {headers: headers});
  }

  Recovery(email) {
    return this.http.get('http://localhost:3000/user/recovery', {params: {email: email}});
  }


  /*
  const headers = {};
  headers['Authorization'] = this.authService.getToken();
//   headers['Content-Type'] = 'application/json';
//   return this.http.put<User>('http://localhost:3000/user', newUser, {headers: headers});
*/


  UpdateMyPhoto(photo) {
    // if ('mail' in localStorage && 'passwd' in localStorage) {
    //   const headers = this.authService.getHeader_authBasic('application/json');
    //   return this.http.put<any>('http://localhost:3000/api/myuserphoto', photo, {headers: headers});
    // } else {
    //   console.log('ERREUR PAS d USERNAME ET DE PASS');
    // }
  }
}


/*
  getMyUser() {
    if (this.authService.isLoggedIn()) {
      return this.http.get('http://localhost:3000/user/', {headers: {Authorization: this.authService.getToken()}});
    }
    else {
      console.log('An error has occurred.');
    }



          // const headers = this.authService.getHeader_token('application/x-www-form-urlencoded');
          // return this.http.get<User>('http://localhost:3000/api/myuser', {headers: headers});
        // } else {
        //   console.log('ERREUR PAS d USERNAME ET DE PASS');
        }
      }

      deleteUser(id) {
        // const headers = this.authService.getHeader_authBasic('application/x-www-form-urlencoded');
        // return this.http.delete<User>('http://localhost:3000/api/user/' + id, {headers: headers});


  }
*/
