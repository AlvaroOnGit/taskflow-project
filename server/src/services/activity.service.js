import { DuplicateError, NotFoundError } from "../middlewares/error.middleware.js";

let tasks = [];

// noinspection JSCheckFunctionSignatures
export class ActivityService {

    static async getActivities() {
        return tasks;
    }

    static async createActivity(name, tags) {

        if (tasks.some(task => task.name === name.trim())) {
            throw new DuplicateError('Nombre ya existe');
        }

        const newActivity = {
            id: Date.now(),
            name: name,
            tags: tags ?? [],
            description: '',
            completed: false,
        }

        tasks.push(newActivity);
        return newActivity;
    }

    static async deleteActivity(id) {

        const index= tasks.findIndex(task => task.id === id);

        if (index === -1) {
            throw new NotFoundError('No se pudo encontrar la actividad');
        }

        const [deletedActivity] = tasks.splice(index, 1);
        return deletedActivity;
    }

    static async updateActivity(id, data) {

        const task = tasks.find(task => task.id === id);

        if (!task) {
            throw new NotFoundError('No se pudo encontrar la actividad');
        }

        const { name, description, completed } = data;

        if (name !== undefined) {
            if (tasks.some(t => t.id !== id && t.name === name.trim())) {
                throw new DuplicateError('Nombre ya existe');
            }
            task.name = name.trim();
        }

        if (description !== undefined) task.description = description;
        if (completed !== undefined) task.completed = completed;

        return task;
    }
}