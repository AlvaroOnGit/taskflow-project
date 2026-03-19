import { PORT } from "./src/config/env.js";
import express from 'express';
import cors from 'cors';
import { ActivityService } from './src/services/activity.service.js';
import { createActivityRouter } from './src/routes/activity.routes.js';
import { errorHandler } from './src/middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/activities', createActivityRouter({ ActivityService }))

app.use(errorHandler);

app.listen(PORT, () => {
    console.log('Server listening')
})