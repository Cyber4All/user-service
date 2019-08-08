import {
  ExpressServiceModule,
  expressServiceModule
} from 'node-service-module';
import { UserMetaDatastore, CognitoIdentityGateway } from './interfaces';
import { MongoUserMetaDatastore } from './drivers';
import { ExpressRouterAdapter } from './adapters';
import * as Interactor from './Interactor';
import { ModuleCognitoIdentityGateway } from './gateways';
/**
 * Module encapsulating all things related to user fetching metadata for users
 * Since this module is an extension of `ExpressServiceModule`
 * functionality of this module can be access through it's ModuleAdapter or the ExpressRouterAdapter
 *
 * @export
 * @class UserMetaRetriever
 * @extends {ExpressServiceModule}
 */
@expressServiceModule({
  expressRouter: ExpressRouterAdapter.buildRouter(),
  providers: [
    { provide: UserMetaDatastore, useClass: MongoUserMetaDatastore },
    { provide: CognitoIdentityGateway, useClass: ModuleCognitoIdentityGateway },
  ]
})
export class UserMetaRetriever extends ExpressServiceModule {
  static getUserRoles = Interactor.getUserRoles;
}
