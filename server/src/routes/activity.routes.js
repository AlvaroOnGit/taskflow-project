import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller.js'

export const createActivityRouter =  ({ ActivityService }) => {

    const activityRouter = Router();
    const activityController = new ActivityController({ ActivityService });

    activityRouter.get('/', activityController.httpGetActivities);
    activityRouter.post('/', activityController.httpCreateActivity);
    activityRouter.delete('/:id', activityController.httpDeleteActivity);
    activityRouter.patch('/:id', activityController.httpUpdateActivity);

    return activityRouter;
}