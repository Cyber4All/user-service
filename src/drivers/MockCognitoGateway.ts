import { CognitoGateway } from '../interactors/AuthenticationInteractor';
import { OpenIdToken } from '../CognitoIdentityManager/typings';

export class MockCognitoGateway implements CognitoGateway {
  getOpenIdToken(_: { username: string, isAdminOrEditor?:boolean }): Promise<OpenIdToken> {
    const token: OpenIdToken = {
      IdentityId: '123',
      Token: '456'
    };
    return Promise.resolve(token);
  }
}
