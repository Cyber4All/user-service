import { CognitoGateway } from '../interactors/AuthenticationInteractor';
import { UserToken } from '../types/user-token';
import { OpenIdToken } from '../CognitoIdentityManager/typings';
import { CognitoIdentityManager } from '../CognitoIdentityManager';

export class ProcessCognitoGateway implements CognitoGateway {
  /**
   * Proxies CognitoIdentity Manager to retrieve OpenIdToken
   *
   * @param {UserToken} requester [Data from the requester requesting OpenIdToken]
   * @returns {Promise<OpenIdToken>}
   * @memberof CognitoProcessGateway
   */
  getOpenIdToken({
    requester
  }: {
    requester: UserToken;
  }): Promise<OpenIdToken> {
    return CognitoIdentityManager.getOpenIdToken({ requester });
  }
}
