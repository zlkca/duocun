import { Injectable, Inject } from '@angular/core';
import { LoopBackAuth, InternalStorage } from '../shared/lb-sdk';

@Injectable()
export class AuthService extends LoopBackAuth {
  constructor (@Inject(InternalStorage) protected storage: InternalStorage) {
    super(storage);
  }
}
