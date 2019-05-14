import { Router } from 'express';
import { ServiceModule, ClassProvider, serviceModule } from './ServiceModule';

/**
 * Provides reusable set of functions and properties for building an ExpressServiceModule
 * ExpressServiceModule is a ServiceModule with an adapter for the express router
 *
 * @export
 * @abstract
 * @class ExpressServiceModule
 * @extends {ServiceModule}
 */
export abstract class ExpressServiceModule extends ServiceModule {
  protected static _expressRouter: Router;
  /**
   * Returns the express router for this module if the module has been initialized
   *
   * @readonly
   * @static
   * @type {*}
   * @memberof ServiceModule
   */
  static get expressRouter(): Router {
    if (!this.initialized) {
      throw new Error(
        `${
          this.name
        } has not yet been initialized. Please use the initializer to utilize this module.`
      );
    }
    return this._expressRouter;
  }
}

/**
 * Decorator for the ExpressServiceModule Class
 * Provides a clean interface for setting module's, expressRouter,  and providers
 *
 * @export
 * @param {Router} expressRouter [The module's adapter that allows express applications to utilize functionality within the module]
 * @param {ClassProvider[]} providers [List of static dependencies to provide to the module]
 * @returns
 */
export function expressServiceModule({
  expressRouter,
  providers = []
}: {
  expressRouter: Router;
  providers: ClassProvider[];
}) {
  return function(target: any) {
    target._expressRouter = expressRouter;
    serviceModule({ providers })(target);
  };
}
