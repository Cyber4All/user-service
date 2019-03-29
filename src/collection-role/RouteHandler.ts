import { Router, Request, Response } from 'express';
import { fetchReviewers, Assign, Edit, Remove, fetchCurators, fetchMembers } from './Interactor';
import { DataStore } from '../interfaces/DataStore';
import { mapErrorToResponseData, ResourceError, ResourceErrorReason } from '../Error';
import { UserToken } from '../types/user-token';

export function initializePrivate({ dataStore }: { dataStore: DataStore }) {
  const router: Router = Router();
  const ROLE_ACTIONS = {
    ASSIGN: 'assign',
    EDIT: 'edit',
    REMOVE: 'remove',
  };

  const ACCESS_GROUP = {
    CURATOR: 'curator',
    REVIEWER: 'reviewer',
  };

  const modifyCollectionRole = async (req: Request, res: Response, action: string) => {
    try {
      const user: UserToken = req.user;
      const role: string = req.body.role;
      const collection: string = req.params.collectionName;
      const userId: string = req.params.memberId;
      switch (action) {
        case ROLE_ACTIONS.ASSIGN:
          await Assign.start(
            dataStore,
            user,
            collection,
            userId,
            role,
          );
          break;
        case ROLE_ACTIONS.EDIT:
          await Edit.start(
            dataStore,
            user,
            collection,
            userId,
            role,
          );
          break;
        case ROLE_ACTIONS.REMOVE:
          await Remove.start(
            dataStore,
            user,
            collection,
            userId,
            role,
          );
          break;
      }
      res.sendStatus(200);
    } catch (e) {
      const { code, message } = mapErrorToResponseData(e);
      res.status(code).json({ message });
    }
  };

  const fetchCollectionReviewers = async (req: Request, res: Response) => {
    try {
      const user: UserToken = req.user;
      const role: string = req.query.role;
      const collectionName: string = req.params.collectionName;
      let members;
      switch (role) {
        case ACCESS_GROUP.CURATOR:
          members = await fetchCurators(
            dataStore,
            user,
            collectionName
          );
          break;
        case ACCESS_GROUP.REVIEWER:
          members = await fetchReviewers(
            dataStore,
            user,
            collectionName
          );
          break;
        default:
          members = await fetchMembers(
            dataStore,
            user,
            collectionName
          );
          break;
      }
      res.status(200).json(members.map(user => user.toPlainObject()));
    } catch (e) {
      const { code, message } = mapErrorToResponseData(e);
      res.status(code).json({ message });
    }
  };

  router.get('/collections/:collectionName/members',
             (req, res) => fetchCollectionReviewers(req, res));

  router.put('/collections/:collectionName/members/:memberId',
             (req, res) => modifyCollectionRole(req, res, 'assign'));

  router.patch('/collections/:collectionName/members/:memberId',
               (req, res) => modifyCollectionRole(req, res, 'edit'));

  router.delete('/collections/:collectionName/members/:memberId',
                (req, res) => modifyCollectionRole(req, res, 'remove'));

  return router;
}
