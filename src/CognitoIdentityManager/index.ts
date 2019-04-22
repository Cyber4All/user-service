import { serviceModule, ServiceModule } from '../shared/ServiceModule';
import { ModuleAdapter } from './adapters';

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
  adapter: ModuleAdapter,
  providers: []
})
export class CognitoIdentityManager extends ServiceModule {}
