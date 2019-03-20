import { Router, Request, Response } from 'express';
import { modifyRoleAccess } from './Interactor';
import { DataStore } from '../interfaces/DataStore';

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
        res.status(200).json({message: 'You did it!'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
  };

  router.patch('/collections/:collectionName/users/:userId/assign', (req, res) => modifyCollectionRole(req, res, 'assign'));
  router.patch('/collections/:collectionName/users/:userId/remove', (req, res) => modifyCollectionRole(req, res, 'remove'));
  return router;
}