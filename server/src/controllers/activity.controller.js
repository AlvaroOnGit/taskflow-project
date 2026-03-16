import { errorHandler } from "../helpers/errorHandler.js";

export class ActivityController {

    constructor({ ActivityModel}) {
        this.ActivityModel = ActivityModel;
    }

    httpGetActivities = async (req, res) => {
        try {
            const tasks = await this.ActivityModel.getActivities();
            return res.status(200).json(tasks);

        } catch (e) {
            return errorHandler(res, 500, 'SERVER_ERROR', 'Error interno del servidor');
        }
    }
    httpCreateActivity = async (req, res) => {

        const data = req.body;

        if (!data.name) {
            return errorHandler(res, 400, 'NO_NAME', 'Nombre es requerido');
        }

        if (typeof data.name !== 'string') {
            return errorHandler(res, 400, 'INVALID_TYPE', 'El nombre debe ser un string');
        }

        if (data.tags !== undefined && !Array.isArray(data.tags)) {
            return errorHandler(res, 400, 'INVALID_TAGS', 'Los tags deben ser un array');
        }

        try {
            const newActivity = await this.ActivityModel.createActivity(data);
            return res.status(200).json({ activity: newActivity , message: 'Activity created successfully'});
        } catch (e) {
            switch (e.message) {
                case 'NO_NAME':
                    return errorHandler(res, 400, 'NO_NAME', 'El nombre de la actividad no puede estar vacío');
                case 'TOO_SHORT':
                    return errorHandler(res, 400, 'TOO_SHORT', 'El nombre debe contener al menos 3 caracteres');
                case 'TOO_LONG':
                    return errorHandler(res, 400, 'TOO_LONG', 'El nombre no debe superar los 50 caracteres');
                case 'DUPLICATE':
                    return errorHandler(res, 400, 'DUPLICATE', 'Ya existe una actividad con este nombre');
                default:
                    return errorHandler(res, 500, 'SERVER_ERROR', 'Error interno del servidor');
            }
        }
    }
    httpDeleteActivity = async (req, res) => {

        const id = Number(req.params.id);

        console.log(id)

        if (!id) {
            return errorHandler(res, 400, 'NO_ID', 'Id es requerido');
        }
        if (isNaN(id)) {
            return errorHandler(res, 400, 'INVALID_TYPE', 'Id debe ser un número');
        }

        try {
            await this.ActivityModel.deleteActivity(id);
            return res.status(204).send();
        } catch (e) {
            switch (e.message) {
                case 'NOT_FOUND':
                    return errorHandler(res, 404, 'NOT_FOUND', 'Actividad no se pudo encontrar');
                default:
                    return errorHandler(res, 500, 'SERVER_ERROR', 'Error interno del servidor');
            }
        }
    }
}