let tasks = [];

export class ActivityModel {

    static async getActivities() {
        return tasks;
    }

    static async createActivity(data) {

        const { name, tags } = data;

        if (!name || name.trim() === '') {
            throw new Error('NO_NAME');
        }

        if (name.trim().length < 3) {
            throw new Error('TOO_SHORT');
        }

        if (name.trim().length > 50) {
            throw new Error('TOO_LONG');
        }
        if (tasks.some(task => task.name === name.trim())) {
            throw new Error('DUPLICATE');
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

        const index  = tasks.findIndex(task => task.id === id);

        if (index === -1) {
            throw new Error('NOT_FOUND');
        }

        const [deletedActivity] = tasks.splice(index, 1);
        return deletedActivity;
    }
}