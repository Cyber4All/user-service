import {
  ExpressServiceModule,
  expressServiceModule
} from '../shared/ExpressServiceModule';
import { UserMetaDatastore } from './interfaces';
import { MongoUserMetaDatastore } from './drivers';
import { ModuleAdapter, ExpressRouterAdapter } from './adapters';

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
  adapter: ModuleAdapter,
  expressRouter: ExpressRouterAdapter.buildRouter(),
  providers: [{ provide: UserMetaDatastore, useClass: MongoUserMetaDatastore }]
})
export class UserMetaRetriever extends ExpressServiceModule {}
