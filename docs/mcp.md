# Instalación del servidor MCP de GitHub en Cursor

## Requisitos previos
- Cursor instalado
- Cuenta de GitHub activa

## Paso 1 — Crear el archivo de configuración

Dentro de tu proyecto, crea la carpeta `.cursor` y dentro el archivo `mcp.json`:
```
tu-proyecto/
└── .cursor/
    └── mcp.json
```
## Paso 2 — Obtener un Personal Access Token (PAT) en GitHub

1. Ve a **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. Haz clic en **Generate new token**
3. Asigna un nombre y activa los siguientes permisos mínimos:
   - `Contents`: Read & Write
   - `Issues`: Read & Write
   - `Pull requests`: Read & Write
   - `Metadata`: Read (obligatorio)
4. Genera el token y **cópialo** — no lo volverás a ver

## Paso 3 — Configurar el servidor en `mcp.json`

Pega el siguiente contenido en el archivo, sustituyendo `TU_TOKEN_AQUI` por el token generado:
```json
{
  "mcpServers": {
    "github": {
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer TU_TOKEN_AQUI"
      }
    }
  }
}
```

> ⚠️ **Importante:** nunca subir este archivo a un repositorio público. Añade `.cursor/mcp.json` a tu `.gitignore`.

## Paso 4 — Reiniciar Cursor

Cierra y vuelve a abrir Cursor completamente para que cargue la nueva configuración.


## Paso 5 — Verificar que funciona

1. Ve a **Cursor Settings → MCP**
2. Comprueba que el servidor `github` aparece con un **punto verde**
3. Abre el Composer con `Cmd + I`, selecciona el modo **Agent** y prueba con:
```
Lista mis repositorios de GitHub
```

Si responde con tu lista de repos, la instalación es correcta ✅