import { FILE_ACCESS_IDENTITY_ROUTES } from './routes';
import { generateServiceToken } from '../../drivers/TokenManager';
import * as request from 'request-promise';

// FIXME: Create interface for this Gateway
export class HttpFileAccessIdentityGateway {
    private static options = {
      uri: '',
      json: true,
      headers: {
        Authorization: 'Bearer',
      },
      method: 'GET',
      body: {},
    };

    static async createFileAccessIdentity({
        username,
        fileAccessIdentity,
    }: {
        username: string,
        fileAccessIdentity: string,
    }): Promise<string> {
      const options = { 
        ...this.options,
        method: 'POST',
        body: {
          fileAccessID: fileAccessIdentity,
        },
      }
      options.uri = FILE_ACCESS_IDENTITY_ROUTES.createFileAccessIdentity(username);
      options.headers.Authorization = `Bearer ${generateServiceToken()}`;
      const res = await request(options);
      return res;
    }

    static async updateFileAccessIdentity({
        username,
        fileAccessIdentity,
    }: {
        username: string,
        fileAccessIdentity: string,
    }): Promise<string> {
        const options = { ...this.options };
        options.body = { fileAccessID: fileAccessIdentity };
        options.uri = FILE_ACCESS_IDENTITY_ROUTES.updateFileAccessIdentity(username);
        options.headers.Authorization = `Bearer ${generateServiceToken()}`;
        const res = await request(options);
        return res;
    }
  }