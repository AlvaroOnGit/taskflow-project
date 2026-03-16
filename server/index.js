import { PORT } from "./src/config/env.js";
import express from 'express';
import { ActivityModel } from './src/services/activity.service.js';
import { createActivityRouter } from './src/routes/activity.routes.js';

const app = express();

app.use(express.json());

app.use('/activities', createActivityRouter({ ActivityModel }))

app.listen(PORT, () => {
    console.log('Server listening')
})