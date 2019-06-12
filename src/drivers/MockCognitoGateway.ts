import { CognitoGateway } from '../interactors/AuthenticationInteractor';
import { OpenIdToken, UserToken } from '../CognitoIdentityManager/typings';

export class MockCognitoGateway implements CognitoGateway {
  getOpenIdToken(_: { requester: UserToken }): Promise<OpenIdToken> {
    const token: OpenIdToken = {
      IdentityId: '123',
      Token: '456'
    };
    return Promise.resolve(token);
  }
}
