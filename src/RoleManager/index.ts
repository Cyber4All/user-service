import {
  ExpressServiceModule,
  expressServiceModule
} from '../shared/ExpressServiceModule';
import { RoleDatastore } from './interfaces';
import { MongoRoleDatastore } from './drivers';
import { ModuleAdapter, ExpressRouterAdapter } from './adapters';

/**
 * Module encapsulating all things related to user Role Management
 * Since this module is an extension of `ExpressServiceModule`
 * functionality of this module can be access through it's ModuleAdapter or the ExpressRouterAdapter
 *
 * @export
 * @class RoleManager
 * @extends {ExpressServiceModule}
 */
@expressServiceModule({
  adapter: ModuleAdapter,
  expressRouter: ExpressRouterAdapter.buildRouter(),
  providers: [{ provide: RoleDatastore, useClass: MongoRoleDatastore }]
})
export class RoleManager extends ExpressServiceModule {}
