import { Router, Request, Response } from 'express';
import { modifyRoleAccess, fetchReviewers } from './Interactor';
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
      if (!role) {
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


  const fetchCollectionReviewers = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const collectionName = req.params.collectionName;
      const reviewers = await fetchReviewers(this.dataStore, user, collectionName);
      res.status(200).json(reviewers);
    } catch (e) {
      const { code, message } = mapErrorToResponseData(e);
      res.status(code).json({ message });;
    }
  };

  router.get('/users/:collectionName/reviewers',
             (req, res) => fetchCollectionReviewers(req, res));
  router.patch('/collections/:collectionName/users/:userId/assign',
               (req, res) => modifyCollectionRole(req, res, 'assign'));
  router.patch('/collections/:collectionName/users/:userId/remove',
               (req, res) => modifyCollectionRole(req, res, 'remove'));
  return router;
}
