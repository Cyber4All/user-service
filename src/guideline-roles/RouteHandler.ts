import { DataStore } from '../interfaces/DataStore';
import { Router, Request, Response } from 'express';
import { mapErrorToResponseData, ResourceError, ResourceErrorReason } from '../Error';
import { mapUserDataToUser } from '../shared/functions';
import { isAdmin } from '../collection-role/AuthManager';
import { requesterIsAdmin } from '../shared/AuthorizationManager';

export function initializePrivate({ dataStore }: { dataStore: DataStore }) {
    const router: Router = Router();

    const ACCESS_GROUP = {
        MAPPER: 'mapper',
    };

    const ERROR_MESSAGES = {
        VIEW_INVALID_ACCESS: 'User does not have permission to view mapper users',
        ADD_INVALID_ACCESS: 'User does not have permission to add mapper users',
        REMOVE_INVALID_ACCESS: 'User does not have permission to add mapper users',
        ALREADY_IS_MAPPER: 'Specified user is already a mapper',
        IS_NOT_MAPPER: 'Specified user is not a mapper',
    };

    
    const getMappers = async (req: Request, res: Response) => {
        try {
            const isAdmin = requesterIsAdmin(req.user);
            if (!isAdmin) {
                throw new ResourceError(ERROR_MESSAGES.VIEW_INVALID_ACCESS, ResourceErrorReason.INVALID_ACCESS);
            }

            let mappers = await dataStore.fetchMappers();
            mappers = mappers.map(mapUserDataToUser);
            res.status(200).json(mappers);
        } catch (error) {
            const { code, message } = mapErrorToResponseData(e);
            res.status(code).json({ message });
        }
    };

    const addMapper = async (req: Request, res: Response) => {
        try {
            requesterIsAdmin(req.user);
            if (!isAdmin) {
                throw new ResourceError(ERROR_MESSAGES.ADD_INVALID_ACCESS, ResourceErrorReason.INVALID_ACCESS);
            }

            const memberId = req.params.memberId;
            const user = await dataStore.findUserById(memberId);
            if (user.accessGroups.includes(ACCESS_GROUP.MAPPER)) {
                throw new ResourceError(ERROR_MESSAGES.ALREADY_IS_MAPPER, ResourceErrorReason.INVALID_ACCESS);
            }

            await dataStore.assignAccessGroup(memberId, ACCESS_GROUP.MAPPER);
            return res.sendStatus(201);
        } catch (error) {
            const { code, message } = mapErrorToResponseData(e);
            res.status(code).json({ message });
        }
    };

    const removeMapper = async (req: Request, res: Response) => {
        try {
            requesterIsAdmin(req.user);
            if (!isAdmin) {
                throw new ResourceError(ERROR_MESSAGES.REMOVE_INVALID_ACCESS, ResourceErrorReason.INVALID_ACCESS);
            }

            const memberId = req.params.memberId;
            const user = await dataStore.findUserById(memberId);
            if (!(user.accessGroups.includes(ACCESS_GROUP.MAPPER))) {
                throw new ResourceError(ERROR_MESSAGES.IS_NOT_MAPPER, ResourceErrorReason.INVALID_ACCESS);
            }

            await dataStore.removeAccessGroup(memberId, ACCESS_GROUP.MAPPER);
            return res.sendStatus(204);
        } catch (error) {
            const { code, message } = mapErrorToResponseData(e);
            res.status(code).json({ message });
        }
    };

    router.get('/guidelines/members', (req, res) => getMappers(req, res));
    router.put('/guidelines/members/:memberId', (req, res) => addMapper(req, res));
    router.delete('/guidelines/members/:memberId', (req, res) => removeMapper(req, res));
}