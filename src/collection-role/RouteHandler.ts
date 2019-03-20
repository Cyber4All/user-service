import { Router, Request, Response } from 'express';
import { modifyRoleAccess } from './Interactor';
import { DataStore } from '../interfaces/DataStore';
import { mapErrorToResponseData, ResourceError, ResourceErrorReason } from '../Error';

export function initializePrivate({
    router,
    dataStore
}: {
  router: Router
  dataStore: DataStore
}) {

  const modifyCollectionRole = async (req: Request, res: Response, action: string) => {
    try {
      const user = req.user;
      const role = req.body.role;
      if (role !== null && typeof(role) !== 'undefined') {
        throw new ResourceError('Must Provide a Role', ResourceErrorReason.BAD_REQUEST);
      }
      const collectionName = req.params.collectionName;
      const userId = req.params.userId;
      await modifyRoleAccess(
            dataStore,
            user,
            collectionName,
            userId,
            role,
            action,
        );
      res.sendStatus(200);
    } catch (e) {
      const { code, message } = mapErrorToResponseData(e);
      res.status(code).json({ message });
    }
  };

  router.patch('/collections/:collectionName/users/:userId/assign',
               (req, res) => modifyCollectionRole(req, res, 'assign'));
  router.patch('/collections/:collectionName/users/:userId/remove',
               (req, res) => modifyCollectionRole(req, res, 'remove'));
  return router;
}
