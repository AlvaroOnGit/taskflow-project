import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller.js'

export const createActivityRouter =  ({ ActivityModel }) => {

    const activityRouter = Router();
    const activityController = new ActivityController({ ActivityModel });

    activityRouter.get('/', activityController.httpGetActivities);
    activityRouter.post('/', activityController.httpCreateActivity);
    activityRouter.delete('/:id', activityController.httpDeleteActivity);

    return activityRouter;
}