import { CognitoGateway } from '../interactors/AuthenticationInteractor';
import { OpenIdToken } from '../CognitoIdentityManager/typings';
import { CognitoIdentityManager } from '../CognitoIdentityManager';

export class ProcessCognitoGateway implements CognitoGateway {
  /**
   * @inheritdoc
   * 
   * Proxies CognitoIdentity Manager to retrieve OpenIdToken
   *
   * @returns {Promise<OpenIdToken>}
   * @memberof CognitoProcessGateway
   */
  getOpenIdToken(params: {username: string, isAdminOrEditor?: boolean  }): Promise<OpenIdToken> {
    return CognitoIdentityManager.getOpenIdToken(params);
  }
}
