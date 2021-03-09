import { FILE_ACCESS_IDENTITY_ROUTES, LEARNING_OBJECT_ROUTE  } from './routes';
import { generateServiceToken } from '../../drivers/TokenManager';

const fetch = require('node-fetch');

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

    static async getCollection(): Promise<any[]> {
      const options = {
        ...this.options,
        method: 'GET',
      }
      options.uri = LEARNING_OBJECT_ROUTE.getCollection();
      options.headers.Authorization = `Bearer ${generateServiceToken()}`;
      
      delete options.body;
      return await (await fetch(options.uri, options)).json();
    }

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
        body: JSON.stringify({ fileAccessID: fileAccessIdentity })
      }
      options.uri = FILE_ACCESS_IDENTITY_ROUTES.createFileAccessIdentity(username);
      options.headers.Authorization = `Bearer ${generateServiceToken()}`;
      
      return await (await fetch(options.uri, options)).json();
    }

    static async updateFileAccessIdentity({
        username,
        fileAccessIdentity,
    }: {
        username: string,
        fileAccessIdentity: string,
    }): Promise<string> {
        const options = { ...this.options };
        options.body = JSON.stringify({ fileAccessID: fileAccessIdentity });
        options.uri = FILE_ACCESS_IDENTITY_ROUTES.updateFileAccessIdentity(username);
        options.headers.Authorization = `Bearer ${generateServiceToken()}`;
        
        return await (await fetch(options.uri, options)).json();
    }
  }