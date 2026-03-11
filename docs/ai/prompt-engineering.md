# Prompt engineering (guía práctica)

>Esta guía recopila **prompts reutilizables** para tareas comunes (análisis, debugging, diseño, redacción, revisión).  
>Cada prompt incluye **por qué funciona bien**, para que puedas adaptarlo sin perder calidad.

## 1) Aclarar requisitos antes de construir

**Prompt**

```
Actúa como analista de producto. Quiero implementar <feature>.

Contexto:
- Usuario objetivo: <...>
- Problema que resuelve: <...>
- Restricciones: <...>

Tarea:
1) Lista las decisiones que faltan (máximo 10) en forma de preguntas.
2) Propón 2-3 opciones por decisión, con pros/contras cortos.
3) Dame una recomendación final con supuestos explícitos.
Devuélvelo en Markdown.
```

**Por qué funciona bien**
- **Reduce ambigüedad**: obliga a enumerar decisiones pendientes.
- **Estructura la exploración**: opciones + pros/contras evitan respuestas vagas.
- **Hace visibles los supuestos**: mejora la alineación y disminuye retrabajo.

## 2) Plan de implementación con pasos verificables

**Prompt**

```
Eres un lead engineer. Necesito un plan de implementación para <feature> en <stack>.

Incluye:
- Alcance (qué entra / qué NO entra)
- Lista de tareas (ordenadas) con entregables claros
- Riesgos y mitigaciones
- Plan de pruebas (unit/integration/e2e) con casos concretos
- Criterios de aceptación medibles
Sé específico y no inventes dependencias: si falta info, asume y decláralo.
```

**Por qué funciona bien**
- **Convierte intención en acciones**: tareas con entregables evitan planes abstractos.
- **Incorpora calidad**: pruebas + criterios de aceptación desde el inicio.
- **Controla alucinaciones**: “no inventes dependencias” + supuestos explícitos.

## 3) Debugging con hipótesis + experimentos

**Prompt**

```
Actúa como ingeniero de debugging. Tengo este bug:
Síntoma: <...>
Repro: <pasos>
Esperado: <...>
Actual: <...>
Logs/errores: <...>
Entorno: <OS, versiones, flags>

Quiero:
1) 5 hipótesis ordenadas por probabilidad.
2) Para cada hipótesis: una prueba mínima para confirmarla/refutarla.
3) Si confirmo la #1: propuesta de fix + riesgos.
No des "posibles causas" genéricas: ancla cada hipótesis a la evidencia.
```

**Por qué funciona bien**
- **Fuerza pensamiento científico**: hipótesis → test mínimo → decisión.
- **Prioriza**: evita perder tiempo en causas improbables.
- **Ancla a evidencia**: reduce respuestas genéricas.

## 4) Revisión de PR orientada a riesgos (no estilo)

**Prompt**

```
Eres reviewer senior. Revisa este cambio (pego diff y contexto).

Objetivo del cambio: <...>
Diff:
<...>

Evalúa SOLO:
- Bugs lógicos y edge cases
- Seguridad (inyección, auth, datos sensibles)
- Rendimiento (queries, N+1, render loops)
- Mantenibilidad (acoplamiento, deuda, naming crítico)
- Observabilidad (logs/metrics/tracing)

Entrega:
1) "Bloqueantes" (con explicación y sugerencia)
2) "Recomendados"
3) "Preguntas"
No pidas cambios cosméticos salvo que impacten mantenimiento.
```

**Por qué funciona bien**
- **Enfoca en impacto**: prioriza riesgos reales vs. estilo.
- **Clasificación accionable**: bloqueantes/recomendados/preguntas.
- **Mejora comunicación**: cada hallazgo debe venir con sugerencia.

## 5) Generar casos de prueba a partir de criterios

**Prompt**

```
Actúa como QA/automation. Con estos criterios de aceptación:
<pega criterios>

Genera:
- 10 casos de prueba (tabla): ID, precondiciones, pasos, datos, esperado
- 5 edge cases adicionales
- 3 casos de regresión (qué podría romperse)
Si falta info, declara supuestos.
```

**Por qué funciona bien**
- **Cubre happy path + bordes + regresión**: reduce escapes a producción.
- **Formato de tabla**: fácil de convertir a tests automatizados.
- **Supuestos visibles**: evita “inventar” requisitos.

## 6) Convertir requisitos en contrato de API (OpenAPI-like)

**Prompt**

```
Eres backend engineer. Diseña el contrato de API para <feature>.

Incluye por endpoint:
- Método + path
- Auth requerida (sí/no, roles si aplica)
- Request body (campos, tipos, validaciones)
- Responses (200/4xx/5xx) con ejemplos JSON
- Errores (códigos + mensajes)
- Notas de idempotencia y paginación si aplica

Devuélvelo como YAML tipo OpenAPI (sin necesidad de ser 100% completo).
```

**Por qué funciona bien**
- **Define fronteras**: contrato explícito reduce malentendidos frontend/backend.
- **Incluye negativos**: errores y 4xx evitan “solo funciona cuando va bien”.
- **Ejemplos concretos**: acelera implementación y pruebas.

## 7) Especificar cambios de base de datos con migración segura

**Prompt**

```
Eres especialista en bases de datos. Necesito modelar <entidad/cambio>.

Datos:
- Volumen estimado: <...>
- Lecturas/escrituras críticas: <...>
- Motor: <Postgres/MySQL/etc>

Entrega:
1) Propuesta de esquema (tablas, columnas, índices)
2) Constraints y claves (FK/unique/check)
3) Migración en pasos seguros (online si aplica)
4) Plan de backfill y rollback
5) Riesgos (locks, tiempos, compatibilidad)
```

**Por qué funciona bien**
- **Piensa en producción**: migración segura, backfill, rollback.
- **Optimiza desde el uso**: índices basados en patrones de acceso.
- **Expone riesgos operacionales**: locks/compatibilidad/tiempos.

## 8) Refactor guiado por objetivos (sin “reescribir todo”)

**Prompt**

```
Eres responsable de calidad del código. Quiero refactorizar <módulo/archivo>.

Objetivos (ordena por prioridad):
1) <...>
2) <...>

Restricciones:
- No romper API pública
- Cambios pequeños y revisables
- Mantener comportamiento actual (salvo bugs documentados)

Propón:
- 3 opciones de refactor (con trade-offs)
- Pasos incrementales (cada paso debe compilar/pasar tests)
- Qué medir para validar mejora (métricas concretas)
```

**Por qué funciona bien**
- **Evita refactors peligrosos**: incremental + compilable en cada paso.
- **Trade-offs explícitos**: ayuda a elegir sin sesgo.
- **Medición**: define “mejor” con métricas, no con opiniones.

## 9) Redacción técnica para README/Docs con estructura fija

**Prompt**

```
Eres technical writer. Escribe documentación para <tema>.

Audiencia: <junior/devops/pm/etc>
Contexto del proyecto: <...>

Estructura obligatoria:
- Qué es (2-3 líneas)
- Requisitos previos
- Instalación / Setup
- Uso básico (ejemplo)
- Configuración (tabla de variables/flags)
- Troubleshooting (3 problemas comunes)
- FAQ (3 preguntas)

Tono: claro y directo, sin marketing.
```

**Por qué funciona bien**
- **Plantilla estable**: reduce omisiones típicas (setup, troubleshooting).
- **Orientado a tareas**: ejemplo de uso acelera adopción.
- **Controla el tono**: evita docs “bonitas” pero poco útiles.

## 10) Generar mensajes de commit consistentes

**Prompt**

```
Eres un asistente de git. A partir de estos cambios (resumen o diff):
<...>

Propón 3 opciones de commit message siguiendo Conventional Commits:
- type(scope): resumen corto

Incluye en el cuerpo (si aplica):
- Motivación (por qué)
- Impacto / riesgos
- Notas de migración

No describas literalmente el diff; enfócate en intención.
```

**Por qué funciona bien**
- **Consistencia**: Conventional Commits facilita changelogs y releases.
- **Enfoque en intención**: mejores mensajes para futuros maintainers.
- **Opciones**: permite elegir el tono/alcance correcto.