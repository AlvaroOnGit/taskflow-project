# Activities API

API REST para la gestión de actividades, construida con **Node.js** y **Express**. Permite crear, consultar, actualizar y eliminar actividades con soporte para etiquetas, validación de datos y manejo centralizado de errores.
 
---

## Tabla de contenidos

- [Arquitectura y estructura de carpetas](#arquitectura-y-estructura-de-carpetas)
- [Capas de la aplicación](#capas-de-la-aplicación)
- [Middlewares](#middlewares)
- [Modelos de datos](#modelos-de-datos)
- [Referencia de la API](#referencia-de-la-api)
- [Códigos de error](#códigos-de-error)
- [Instalación y uso](#instalación-y-uso)

---

## Arquitectura y estructura de carpetas

El proyecto sigue una **arquitectura en capas** (_Layered Architecture_), separando responsabilidades en directorios bien definidos. Este patrón garantiza bajo acoplamiento y alta cohesión entre módulos.

```
project-root/
├── index.js                        # Punto de entrada: configura Express y monta rutas
└── src/
    ├── config/
    │   └── env.js                  # Variables de entorno (PORT, etc.)
    ├── controllers/
    │   └── activity.controller.js  # Capa de presentación: maneja Request/Response HTTP
    ├── services/
    │   └── activity.service.js     # Capa de negocio: lógica de dominio y estado
    ├── routes/
    │   └── activity.routes.js      # Definición de rutas y enlace con controladores
    └── middlewares/
        └── error.middleware.js     # Manejo centralizado de errores y clases de error
```

### Decisiones de diseño

| Decisión | Justificación |
|---|---|
| Separación en capas | Facilita el testing unitario de cada capa de forma aislada |
| Factory function en `createActivityRouter` | Permite inyección de dependencias sin acoplamiento estático al servicio |
| Clases de error personalizadas | Tipado semántico de errores para que el middleware pueda tomar decisiones basadas en el tipo, sin inspeccionar mensajes de texto |
| Estado en memoria (`let tasks = []`) | Simplicidad para prototipos; intercambiable por una capa de repositorio sin tocar controladores ni rutas |
 
---

## Capas de la aplicación

### 1. Punto de entrada — `index.js`

Configura la instancia de Express, registra los middlewares globales y monta el router de actividades bajo el prefijo `/api/activities`. El `errorHandler` se registra **al final** del pipeline, requisito de Express para que funcione como middleware de error (firma de cuatro argumentos: `err, req, res, next`).

```js
app.use(cors());
app.use(express.json());
app.use('/api/activities', createActivityRouter({ ActivityService }));
app.use(errorHandler); // Debe ir último
```

### 2. Rutas — `activity.routes.js`

Utiliza el patrón **Factory Function** para recibir las dependencias (`ActivityService`) e instanciar el controlador. Esto implementa **Inversión de Dependencias (DIP)**: el router no importa el servicio directamente, lo recibe desde el exterior.

```
GET    /api/activities       → httpGetActivities
POST   /api/activities       → httpCreateActivity
DELETE /api/activities/:id   → httpDeleteActivity
PATCH  /api/activities/:id   → httpUpdateActivity
```

### 3. Controlador — `activity.controller.js`

Actúa como **capa de presentación**. Sus responsabilidades son:

- Extraer y validar los datos de `req.body` y `req.params`.
- Delegar la lógica de negocio al servicio.
- Construir la respuesta HTTP (`res.status(...).json(...)`).
- Capturar excepciones y propagarlas al middleware de error mediante `next(e)`.

El controlador **no contiene lógica de dominio**: no sabe cómo se almacenan las actividades ni qué constituye un duplicado; eso es responsabilidad del servicio.

### 4. Servicio — `activity.service.js`

Contiene la **lógica de negocio** y gestiona el estado de la aplicación (el array `tasks`). Sus métodos son `static async`, lo que permite invocarlos sin instanciar la clase. Lanza errores tipados (`DuplicateError`, `NotFoundError`) que el middleware de error interpreta para construir la respuesta adecuada.
 
---

## Middlewares

### `error.middleware.js`

Este fichero cumple dos funciones complementarias: **definir clases de error semánticas** y **centralizar el manejo de excepciones**.

#### Clases de error personalizadas

Se generan dinámicamente mediante una _factory function_ `createErrorClass`, que extiende la clase nativa `Error` añadiendo dos propiedades:

- `status` — código HTTP asociado al tipo de error.
- `errors` — objeto opcional para detalles adicionales (p. ej. errores de validación por campo).

```js
function createErrorClass(name, status) {
    return class extends Error {
        constructor(message, errors) {
            super(message);
            this.name = name;
            this.status = status;
            this.errors = errors;
        }
    };
}
```

| Clase | HTTP Status | Uso |
|---|---|---|
| `ValidationError` | `400 Bad Request` | Datos de entrada inválidos o incompletos |
| `NotFoundError` | `404 Not Found` | Recurso no encontrado por ID |
| `DuplicateError` | `409 Conflict` | Violación de unicidad (nombre duplicado) |
| `InternalError` | `500 Internal Server Error` | Fallos inesperados del servidor |

Este diseño permite que cualquier capa de la aplicación lance un error tipado (`throw new NotFoundError(...)`) y el middleware de error sepa exactamente qué status HTTP devolver, **sin usar condicionales sobre strings de mensaje**.

#### `errorHandler` — Middleware de error de Express

Express identifica un middleware de error por su aridad de cuatro parámetros `(err, req, res, next)`. Debe registrarse **después de todas las rutas**.

```
Petición HTTP
     │
     ▼
  Middleware (cors, json)
     │
     ▼
  Router → Controlador → Servicio
     │           │
     │     throw NotFoundError
     │           │
     └──────── next(e) ──────────▶ errorHandler
                                        │
                              ┌─────────┴──────────┐
                              │  status >= 500?     │
                         Yes  │                     │  No
                              ▼                     ▼
                       Log + respuesta       Respuesta JSON
                       sin detalles          con { message, errors }
```

Para errores de servidor (`status >= 500`), el handler extrae el origen del error mediante `extractSource(err.stack)`, parseando el _stack trace_ con expresiones regulares para obtener el fichero y la línea exacta. Esta información se registra en consola pero **no se expone al cliente**, evitando filtración de información interna.

```js
// Respuesta para errores 4xx
{ "message": "Nombre ya existe", "errors": {} }
 
// Respuesta para errores 5xx (solo el mensaje genérico al cliente)
{ "message": "Error interno del servidor" }
```
 
---

## Modelos de datos

### Activity

```json
{
  "id": 1748392847291,
  "name": "Diseñar base de datos",
  "description": "",
  "tags": [
    { "name": "Backend", "color": "#3b82f6" }
  ],
  "completed": false
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `number` | Timestamp Unix generado con `Date.now()` |
| `name` | `string` | Nombre de la actividad (3–50 caracteres, único) |
| `description` | `string` | Descripción opcional, vacía por defecto |
| `tags` | `Tag[]` | Array de etiquetas con nombre y color HEX |
| `completed` | `boolean` | Estado de completado, `false` por defecto |

### Tag

```json
{ "name": "string", "color": "#rrggbb" }
```
 
---

## Referencia de la API

**Base URL:** `http://localhost:3000/api/activities`
 
---

### `GET /`

Devuelve todas las actividades almacenadas.

**Respuesta exitosa — `200 OK`**

```json
[
  {
    "id": 1748392847291,
    "name": "Diseñar base de datos",
    "description": "",
    "tags": [],
    "completed": false
  }
]
```

**Ejemplo**

```http
GET http://localhost:3000/api/activities
```
 
---

### `POST /`

Crea una nueva actividad. El nombre debe ser único.

**Body (JSON)**

| Campo | Requerido | Tipo | Validación |
|---|---|---|---|
| `name` | ✅ | `string` | Mínimo 3 caracteres, máximo 50, único |
| `tags` | ❌ | `Tag[]` | Array de objetos `{ name, color }` |

**Ejemplo**

```http
POST http://localhost:3000/api/activities
Content-Type: application/json
 
{
  "name": "Implementar autenticación",
  "tags": [
    { "name": "Backend", "color": "#3b82f6" },
    { "name": "Seguridad", "color": "#ef4444" }
  ]
}
```

**Respuesta exitosa — `200 OK`**

```json
{
  "activity": {
    "id": 1748392847291,
    "name": "Implementar autenticación",
    "description": "",
    "tags": [
      { "name": "Backend", "color": "#3b82f6" },
      { "name": "Seguridad", "color": "#ef4444" }
    ],
    "completed": false
  },
  "message": "Activity created successfully"
}
```

**Errores posibles**

| Condición | Status | Mensaje |
|---|---|---|
| `name` vacío o ausente | `400` | `Nombre es requerido` |
| `name` menor de 3 caracteres | `400` | `Nombre debe tener mínimo 3 caracteres` |
| `name` mayor de 50 caracteres | `400` | `Nombre no puede superar 50 caracteres` |
| `name` ya existe | `409` | `Nombre ya existe` |
 
---

### `PATCH /:id`

Actualiza parcialmente una actividad existente. Solo se modifican los campos enviados en el body (_partial update_).

**Parámetros de ruta**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | `number` | ID numérico de la actividad |

**Body (JSON)** — todos los campos son opcionales

| Campo | Tipo | Validación |
|---|---|---|
| `name` | `string` | Mínimo 3 caracteres, máximo 50, único |
| `description` | `string` | Sin restricciones de longitud |
| `completed` | `boolean` | Debe ser exactamente `true` o `false` |

**Ejemplo — marcar como completada**

```http
PATCH http://localhost:3000/api/activities/1748392847291
Content-Type: application/json
 
{
  "completed": true
}
```

**Ejemplo — actualizar nombre y descripción**

```http
PATCH http://localhost:3000/api/activities/1748392847291
Content-Type: application/json
 
{
  "name": "Implementar OAuth2",
  "description": "Integrar proveedor externo con Google y GitHub"
}
```

**Respuesta exitosa — `200 OK`**

```json
{
  "activity": {
    "id": 1748392847291,
    "name": "Implementar OAuth2",
    "description": "Integrar proveedor externo con Google y GitHub",
    "tags": [{ "name": "Backend", "color": "#3b82f6" }],
    "completed": true
  },
  "message": "Activity updated successfully"
}
```

**Errores posibles**

| Condición | Status | Mensaje |
|---|---|---|
| `id` no es un número | `400` | `Id debe ser un número válido` |
| Actividad no encontrada | `404` | `No se pudo encontrar la actividad` |
| `name` vacío | `400` | `Nombre no puede estar vacío` |
| `name` menor de 3 caracteres | `400` | `Nombre debe tener mínimo 3 carácteres` |
| `name` mayor de 50 caracteres | `400` | `Nombre no puede superar 50 carácteres` |
| `completed` no es booleano | `400` | `completed debe ser un booleano` |
| `name` ya existe en otra actividad | `409` | `Nombre ya existe` |
 
---

### `DELETE /:id`

Elimina permanentemente una actividad por su ID.

**Parámetros de ruta**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | `number` | ID numérico de la actividad |

**Ejemplo**

```http
DELETE http://localhost:3000/api/activities/1748392847291
```

**Respuesta exitosa — `204 No Content`**

Sin cuerpo de respuesta.

**Errores posibles**

| Condición | Status | Mensaje |
|---|---|---|
| `id` ausente o inválido | `400` | `Id es requerido` / `Id debe ser un número` |
| Actividad no encontrada | `404` | `No se pudo encontrar la actividad` |
 
---

## Códigos de error

Todos los errores siguen la misma estructura de respuesta:

```json
{
  "message": "Descripción del error",
  "errors": {}
}
```

| Status | Nombre | Descripción |
|---|---|---|
| `400` | Bad Request | Datos de entrada inválidos o incompletos |
| `404` | Not Found | El recurso solicitado no existe |
| `409` | Conflict | Conflicto de unicidad (nombre duplicado) |
| `500` | Internal Server Error | Error inesperado del servidor |
 
---

## Instalación y uso

### Requisitos

- Node.js `>= 18`
- npm

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd <nombre-del-proyecto>
 
# 2. Instalar dependencias
npm install
 
# 3. Configurar variables de entorno
# Crear un fichero .env en la raíz:
echo "PORT=3000" > .env
 
# 4. Iniciar el servidor
node index.js
# o con hot-reload:
node --watch index.js
```

El servidor estará disponible en `http://localhost:3000`.

### Probar la API

Se incluye el fichero `api.http` compatible con la extensión **REST Client** de VS Code. Abre el fichero y pulsa `Send Request` sobre cada bloque para ejecutar las peticiones directamente desde el editor.

Alternativamente, con `curl`:

```bash
# Listar actividades
curl http://localhost:3000/api/activities
 
# Crear actividad
curl -X POST http://localhost:3000/api/activities \
  -H "Content-Type: application/json" \
  -d '{"name": "Mi primera actividad", "tags": []}'
 
# Marcar como completada (reemplaza el ID)
curl -X PATCH http://localhost:3000/api/activities/1748392847291 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
 
# Eliminar actividad
curl -X DELETE http://localhost:3000/api/activities/1748392847291
```
 