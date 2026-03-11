# Experimentos Código IA - Developer

> **Función:** Recopila varias funciones resultas de manera manual y por IA y las compara 

---

### Experimento 1: FizzBuzz
**Problema**: Dado un número \(n\), imprimir los números del 1 a \(n\). Para múltiplos de 3 imprimir `Fizz`, para múltiplos de 5 imprimir `Buzz` y para múltiplos de ambos `FizzBuzz`.

### 1.1 Sin IA

```javascript
function fizzBuzz(n) {
  for (let i = 1; i <= n; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
      console.log("FizzBuzz");
    } else if (i % 3 === 0) {
      console.log("Fizz");
    } else if (i % 5 === 0) {
      console.log("Buzz");
    } else {
      console.log(i);
    }
  }
}
```

- **Calidad del código (evaluado por IA)**:
  - **Legibilidad**: Aceptable, pero sin comentarios ni pruebas automatizadas.
  - **Robustez**: No valida que `n` sea un número positivo.
  - **Comprensión del problema**: Buena; el flujo se entiende, pero la solución está muy acoplada a `console.log`.

### 1.2. Con IA

```javascript
function fizzBuzz(n) {
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error("n debe ser un entero positivo");
  }

  const result = [];

  for (let i = 1; i <= n; i++) {
    const divisiblePor3 = i % 3 === 0;
    const divisiblePor5 = i % 5 === 0;

    if (divisiblePor3 && divisiblePor5) {
      result.push("FizzBuzz");
    } else if (divisiblePor3) {
      result.push("Fizz");
    } else if (divisiblePor5) {
      result.push("Buzz");
    } else {
      result.push(String(i));
    }
  }

  return result;
}
```

- **Comparativa**:
  - **Tiempo**: IA claramente más rápida.
  - **Calidad del código**: La versión con IA incluye validación, nombres algo más descriptivos y devuelve un resultado reutilizable.
  - **Comprensión**: La IA propone la estructura; el desarrollador necesita leer y entender el flujo, pero el problema es sencillo y la comprensión se mantiene alta.
---

### Experimento 2: Comprobar si una cadena es palíndromo

**Problema**: Dada una cadena, determinar si se lee igual de izquierda a derecha y de derecha a izquierda, ignorando espacios y mayúsculas/minúsculas.

### 2.1. Sin IA

```javascript
function esPalindromo(texto) {
  // quitar espacios
  let sinEspacios = "";
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (c !== " ") {
      sinEspacios += c;
    }
  }

  sinEspacios = sinEspacios.toLowerCase();

  let alReves = "";
  for (let i = sinEspacios.length - 1; i >= 0; i--) {
    alReves += sinEspacios[i];
  }

  if (alReves === sinEspacios) {
    return true;
  } else {
    return false;
  }
}
```

- **Calidad del código (evaludado por IA)**:
  - **Legibilidad**: Aceptable, pero con bucles manuales y algo verboso.
  - **Eficiencia**: Construye cadenas carácter a carácter; poco eficiente, aunque suficiente para cadenas pequeñas.
  - **Comprensión del problema**: Correcta; se ve claramente la idea, pero no aprovecha bien las utilidades del lenguaje.

### 2.2. Con IA

```javascript
function esPalindromo(texto) {
  const permitidos = /[a-z0-9]/i;

  const normalizado = texto
    .toLowerCase()
    .split("")
    .filter((c) => permitidos.test(c))
    .join("");

  const invertido = normalizado.split("").reverse().join("");

  return normalizado === invertido;
}
```

- **Comparativa**:
  - **Tiempo**: La IA reduce el tiempo al sugerir directamente patrones comunes en JavaScript (métodos de arrays, expresiones regulares).
  - **Calidad del código**: Mucho más conciso y fácil de reutilizar. Maneja más casos (dígitos, signos).
  - **Comprensión**: El desarrollador debe entender el uso combinado de `split`, `filter`, `join` y expresiones regulares; buena oportunidad para aprender nuevas construcciones.

---

### Experimento 3: Resumen de tareas completadas (pequeño script tipo backend)
 
- **Problema**: Dada una lista de tareas con campos `id`, `titulo`, `completada` y `duracionMinutos`, calcular:
  - Número total de tareas.
  - Número de tareas completadas.
  - Tiempo total invertido en tareas completadas.

#### 3.1. Sin IA

```javascript
function obtenerResumen(tareas) {
  var total = tareas.length;
  var completadas = 0;
  var minutosCompletadas = 0;

  for (var i = 0; i < tareas.length; i++) {
    var tarea = tareas[i];
    if (tarea.completada === true) {
      completadas = completadas + 1;
      minutosCompletadas = minutosCompletadas + tarea.duracionMinutos;
    }
  }

  return {
    total: total,
    completadas: completadas,
    minutosCompletadas: minutosCompletadas,
  };
}
```

- **Calidad del código (evaluado por IA)**:
  - **Legibilidad**: Clara, pero con estilo más cercano a Java (for clásico, repetición, `var`).
  - **Eficiencia**: Correcta para tamaños pequeños/medios.
  - **Comprensión del problema**: Buena; el flujo es muy directo.

#### 3.2. Con IA

```javascript
function normalizarDuracion(minutos) {
  if (!Number.isFinite(minutos) || minutos < 0) {
    return 0;
  }
  return minutos;
}

function obtenerResumen(tareas) {
  return tareas.reduce(
    (acc, tarea) => {
      const total = acc.total + 1;

      if (!tarea.completada) {
        return { ...acc, total };
      }

      const duracion = normalizarDuracion(tarea.duracionMinutos);

      return {
        total,
        completadas: acc.completadas + 1,
        minutosCompletadas: acc.minutosCompletadas + duracion,
      };
    },
    { total: 0, completadas: 0, minutosCompletadas: 0 }
  );
}
```

- **Comparativa**:
  - **Tiempo**: La IA acelera la escritura de patrones típicos (`reduce`, funciones de normalización).
  - **Calidad del código**: Más declarativo, fácil de extender (por ejemplo, para calcular promedios o agrupar por usuario).
  - **Comprensión**: Requiere entender `reduce` y el patrón de acumuladores inmutables; una vez entendido, facilita razonar sobre agregaciones.

---

### Resumen global de los tres experimentos

- **Calidad del código**:
  - **Sin IA**: Soluciones correctas pero algo verbosas, con menos validaciones y poco uso de patrones idiomáticos del lenguaje.
  - **Con IA**: Código más conciso, reutilizable y robusto (validaciones, tipos, estructuras más expresivas).

- **Comprensión del problema**:
  - En problemas simples, la comprensión es similar con y sin IA; la diferencia está en la calidad y en las técnicas usadas.
  - La IA ayuda a descubrir patrones y utilidades del lenguaje que un perfil junior podría no conocer aún, siempre que el desarrollador se detenga a leer y entender las sugerencias.

- **Conclusión general**:
  - **La IA actúa como acelerador y mentor**: ahorra tiempo en la escritura y sugiere mejoras de diseño, pero no sustituye la necesidad de entender el problema y revisar el código resultante.
  - **Riesgo principal**: aceptar soluciones sin comprenderlas; el valor real aparece cuando el desarrollador usa la IA para aprender y mejorar sus propias soluciones, no sólo para delegarlas.