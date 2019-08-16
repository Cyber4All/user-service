import { CognitoIdentityGateway } from '../../interfaces';
import { CognitoIdentityManager } from '../../../CognitoIdentityManager';

export class ModuleCognitoIdentityGateway implements CognitoIdentityGateway{
    /**
     * @inheritdoc
     *
     * Retrieves OpenIdToken from CognitoIdentityManagerModule and returns only the Identity Id
     *
     * @returns {Promise<string>}
     * @memberof ModuleCognitoIdentityGateway
     */
  async getCognitoIdentityId(params: { username: string; isAdminOrEditor?: boolean; }): Promise<string> {
    const openIdToken = await CognitoIdentityManager.getOpenIdToken(params);
    if (openIdToken) {
      return openIdToken.IdentityId;
    }
    return null;
  }
}
