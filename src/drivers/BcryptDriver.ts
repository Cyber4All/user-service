import * as bcrypt from 'bcrypt';

import { HashInterface } from '../interfaces/interfaces';

export class BcryptDriver implements HashInterface {
    constructor(public saltRounds: number) { }

    async hash(pwd: string): Promise<string> {
        return bcrypt.hash(pwd, this.saltRounds);
    };

    async verify(pwd: string, hash_: string): Promise<boolean> {
        return bcrypt.compare(pwd, hash_);
    };
}
