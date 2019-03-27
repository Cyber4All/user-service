import * as supertest from 'supertest';
import * as express from 'express';
import {
  handleProcessTokenError,
  processToken,
  enforceAuthenticatedAccess
} from '../../middleware';
import { RoleManager } from '../index';
import { RoleDatastore } from '../interfaces';
import { MockRoleDatastore } from '../tests/drivers/RoleDatastore/MockRoleDatastore';
import { userToken } from '../tests/MockStore';
import { encodeToken } from '../../shared/TokenEncoder';

describe('RoleManager: ExpressRouterAdapter', () => {
  let request: supertest.SuperTest<supertest.Test>;
  const validToken = encodeToken(userToken);
  beforeAll(() => {
    RoleManager.providers = [
      {
        provide: RoleDatastore,
        useClass: MockRoleDatastore
      }
    ];
    RoleManager.initialize();

    const app = express();
    app.use(processToken, handleProcessTokenError);
    app.use(enforceAuthenticatedAccess);
    app.use(RoleManager.expressRouter);
    request = supertest(app);
  });

  describe('GET /users/:id/roles', () => {
    it('should respond with 200 and object containing roles', done => {
      const userId = '12345';
      const url = `/users/${userId}/roles`;
      request
        .get(url)
        .expect(200)
        .set('Authorization', `Bearer ${validToken}`)
        .end(async (err: any, res: supertest.Response) => {
          if (err) return done(err);
          expect(res.body).toEqual(
            expect.objectContaining({
              roles: expect.arrayContaining([expect.any(String)])
            })
          );
          done();
        });
    });
    it('should respond with 400 (userId undefined)', done => {
      const userId: any = undefined;
      const url = `/users/${userId}/roles`;
      request
        .get(url)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400, done);
    });
    it('should respond with 400 (userId null)', done => {
      const userId: any = null;
      const url = `/users/${userId}/roles`;
      request
        .get(url)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400, done);
    });
    it('should respond with 400 (userId empty string)', done => {
      const userId: any = '  ';
      const url = `/users/${userId}/roles`;
      request
        .get(url)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400, done);
    });
    it('should respond with 401 (no token)', done => {
      const userId: any = '123';
      const url = `/users/${userId}/roles`;
      request.get(url).expect(401, done);
    });
    it('should respond with 401 (no accessGroups)', done => {
      const userId: any = '123';
      const url = `/users/${userId}/roles`;
      const invalidToken = encodeToken({ ...userToken, accessGroups: [] });
      request
        .get(url)
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401, done);
    });
    it('should respond with 401 (not admin)', done => {
      const userId: any = '123';
      const url = `/users/${userId}/roles`;
      const invalidToken = encodeToken({
        ...userToken,
        accessGroups: ['reviewer']
      });
      request
        .get(url)
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401, done);
    });
  });

  afterAll(() => {
    RoleManager.destroy();
  });
});
