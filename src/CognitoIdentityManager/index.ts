import {
  expressServiceModule,
  ExpressServiceModule,
} from '../shared/ExpressServiceModule';
import { ModuleAdapter, ExpressRouterAdapter } from './adapters';

/**
 * Module encapsulating all things related to managing Cognito Identities
 * Since this module is an extension of `ExpressServiceModule`
 * functionality of this module can be access through it's ModuleAdapter or the resolvers
 *
 * @export
 * @class CognitoIdentityManager
 * @extends {ExpressServiceModule}
 */

@expressServiceModule({
  adapter: ModuleAdapter,
  expressRouter: ExpressRouterAdapter.buildRouter(),
  /**
   * Set module's providers
   * Providers include concrete implementations for Drivers and Gateways that will be used at the interactor level
   */
  providers: [],
})
export class CognitoIdentityManager extends ExpressServiceModule {}
