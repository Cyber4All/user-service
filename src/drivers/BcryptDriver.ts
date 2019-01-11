import { HashInterface } from '../interfaces/interfaces';
import * as bcrypt from 'bcrypt-nodejs';

export class BcryptDriver implements HashInterface {

  async hash(password: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      bcrypt.hash(password, null, null, (err: any, result: string) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      bcrypt.compare(password, hash, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
}
