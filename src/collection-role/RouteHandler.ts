import { Router, Request, Response } from 'express';
import { fetchReviewers, Assign, Edit, Remove } from './Interactor';
import { DataStore } from '../interfaces/DataStore';
import { mapErrorToResponseData, ResourceError, ResourceErrorReason } from '../Error';
import { UserToken } from '../types/user-token';

export function initializePrivate({
    router,
    dataStore
}: {
  router: Router
  dataStore: DataStore
}) {

  const ROLE_ACTIONS = {
    ASSIGN: 'assign',
    EDIT: 'edit',
    REMOVE: 'remove',
  };

  const modifyCollectionRole = async (req: Request, res: Response, action: string) => {
    try {
      const user: UserToken = req.user;
      const role: string = req.body.role;
      if (!role) {
        throw new ResourceError('Must provide a role', ResourceErrorReason.BAD_REQUEST);
      }
      const collection: string = req.params.collectionName;
      const userId: string = req.params.userId;
      switch (action) {
        case ROLE_ACTIONS.ASSIGN:
          await Assign.start(
            dataStore,
            user,
            collection,
            userId,
            role,
          );
        case ROLE_ACTIONS.EDIT:
          await Edit.start(
            dataStore,
            user,
            collection,
            userId,
            role,
          );
        case ROLE_ACTIONS.REMOVE:
          await Remove.start(
            dataStore,
            user,
            collection,
            userId,
            role,
          );
      }
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
      res.status(code).json({ message });
    }
  };

  router.get('/users/:collectionName/reviewers',
             (req, res) => fetchCollectionReviewers(req, res));

  router.put('/collections/:collectionName/members/:memberId',
             (req, res) => modifyCollectionRole(req, res, 'assign'));

  router.patch('/collections/:collectionName/members/:memberId',
               (req, res) => modifyCollectionRole(req, res, 'edit'));

  router.delete('/collections/:collectionName/members/:memberId',
                (req, res) => modifyCollectionRole(req, res, 'remove'));

  return router;
}
