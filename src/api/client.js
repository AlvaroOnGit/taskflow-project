// ─── API Client ───────────────────────────────────────────────────────────────

const API_URL = 'https://taskflow-project-imrp.vercel.app/api';

/**
 * Realiza una petición HTTP genérica y devuelve el cuerpo JSON parseado.
 * Lanza un error con el mensaje del servidor si la respuesta no es ok.
 *
 * @param {string} endpoint - Ruta relativa a `API_URL` (ej: '/activities').
 * @param {RequestInit} [options={}] - Opciones nativas de `fetch`.
 * @returns {Promise<any>} Cuerpo de la respuesta parseado, o `null` si es 204.
 * @throws {Error} Si la respuesta HTTP no es exitosa.
 */
async function request(endpoint, options = {}) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });

    if (res.status === 204) return null;

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error en la petición');

    return data;
}

// ─── Actividades ──────────────────────────────────────────────────────────────

/**
 * Obtiene todas las actividades del servidor.
 *
 * @returns {Promise<Activity[]>}
 */
export const getActivities = () => request('/activities');

/**
 * Crea una nueva actividad.
 *
 * @param {string} name - Nombre de la actividad.
 * @param {{ name: string, color: string }[]} tags - Etiquetas asociadas.
 * @returns {Promise<{ activity: Activity, message: string }>}
 */
export const createActivity = (name, tags) =>
    request('/activities', {
        method: 'POST',
        body: JSON.stringify({ name, tags }),
    });

/**
 * Actualiza campos concretos de una actividad existente.
 *
 * @param {number} id - ID de la actividad.
 * @param {{ name?: string, description?: string, completed?: boolean }} data - Campos a actualizar.
 * @returns {Promise<{ activity: Activity, message: string }>}
 */
export const updateActivity = (id, data) =>
    request(`/activities/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });

/**
 * Elimina una actividad por su ID.
 *
 * @param {number} id - ID de la actividad a eliminar.
 * @returns {Promise<null>}
 */
export const deleteActivity = (id) =>
    request(`/activities/${id}`, { method: 'DELETE' });