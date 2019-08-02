import { serviceModule, ServiceModule } from 'node-service-module';
import * as Interactor from './Interactor';
/**
 * Module encapsulating all things related to managing Cognito Identities
 * Since this module is an extension of `ServiceModule`
 * functionality of this module can be access through it's ModuleAdapter
 *
 * @export
 * @class CognitoIdentityManager
 * @extends {ServiceModule}
 */

@serviceModule({
  providers: []
})
export class CognitoIdentityManager extends ServiceModule {}

export namespace CognitoIdentityManager {
  export const getOpenIdToken = Interactor.getOpenIdToken;
}
