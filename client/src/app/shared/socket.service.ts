import { Injectable } from '@angular/core';
// import io from 'socket.io-client';
import { environment } from '../../environments/environment';
import { AuthService } from '../account/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  socket;
  authenticated;

  constructor(
    private authSvc: AuthService
  ) {
    // const url = environment.API_BASE + '/';
    // this.socket = io(url);
  }

  init(token: string) {
  //   this.socket.on('connect', () => {
  //     console.log('Socket connected!');
  //     // this.subjects.onConnect.next('connected');
  //     // Authenticate or start heartbeat now
  //     this.socket.emit('authentication', token);
  //   });

  //   this.socket.on('authenticated', (userId) => {
  //     console.log('Socket authenticated! ' + userId);
  //     this.authenticated = true;
  //     // this.subjects.onAuthenticated.next();
  //     // this.heartbeater();
  //   });

  //   this.socket.on('unauthorized', (err: any) => {
  //     console.log('Socket unauthorized!');
  //     // this.authenticated = false;
  //     // this.subjects.onUnAuthorized.next(err);
  //   });

  //   this.socket.on('disconnect', (status: any) => {
  //     console.log('Socket disconnect!');
  //     // this.subjects.onDisconnect.next(status);
  //   });
  }

  // on(msg, cb) {
  //   this.socket.on(msg, cb);
  // }
}
