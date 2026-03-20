import { ValidationError } from "../middlewares/error.middleware.js";

// noinspection JSCheckFunctionSignatures
export class ActivityController {

    constructor({ ActivityService}) {
        this.ActivityService = ActivityService;
    }

    httpGetActivities = async (req, res, next) => {
        try {
            const tasks = await this.ActivityService.getActivities();
            return res.status(200).json(tasks);

        } catch (e) {
            next(e);
        }
    }
    httpCreateActivity = async (req, res, next) => {

        const { name, tags } = req.body;

        if (!name || name.trim() === '') {
            const e = new ValidationError('Nombre es requerido');
            next(e);
        }

        if (name.trim().length < 3) {
            const e = new ValidationError('Nombre debe tener mínimo 3 caracteres');
            next(e);
        }

        if (name.trim().length > 50) {
            const e = new ValidationError('Nombre no puede superar 50 caracteres');
            next(e);
        }

        try {
            const newActivity = await this.ActivityService.createActivity(name, tags);
            return res.status(200).json({ activity: newActivity , message: 'Activity created successfully'});
        } catch (e) {
            next(e);
        }
    }
    httpDeleteActivity = async (req, res, next) => {

        const id = Number(req.params.id);

        if (!id) {
            const e = new ValidationError('Id es requerido');
            next(e);
        }
        if (isNaN(id)) {
            const e = new ValidationError('Id debe ser un número');
            next(e);
        }

        try {
            await this.ActivityService.deleteActivity(id);
            return res.status(204).send();
        } catch (e) {
            next(e);
        }
    }
    httpUpdateActivity = async (req, res, next) => {

        const id = Number(req.params.id);

        if (!id || isNaN(id)) {
            const e = new ValidationError('Id debe ser un número válido')
            next(e);
        }

        const { name, description, completed } = req.body;

        if (name !== undefined) {
            if (name.trim() === '') {
                const e = new ValidationError('Nombre no puede estar vacío');
                next(e);
            }
            if (name.trim().length < 3) {
                const e = new ValidationError('Nombre debe tener mínimo 3 carácteres');
                next(e);
            }
            if (name.trim().length > 50) {
                const e = new ValidationError('Nombre no puede superar 50 carácteres');
                next(e);
            }
        }

        if (completed !== undefined && typeof completed !== 'boolean') {
            const e = new ValidationError('completed debe ser un booleano');
            next(e);
        }

        try {
            const updated = await this.ActivityService.updateActivity(id, { name, description, completed });
            return res.status(200).json({ activity: updated, message: 'Activity updated successfully' });
        } catch (e) {
            next(e);
        }
    }
}