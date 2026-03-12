# Reflexión sobre el uso de IA en el desarrollo de Taskflow
 
---

## En qué tareas la IA me ha ayudado más

La IA ha sido especialmente útil en las partes del proyecto donde la lógica es repetitiva pero precisa: generar la estructura inicial de funciones como `renderUserActivities()` o `syncComposerTagsUI()`, donde el patrón es claro pero escribirlo a mano consume tiempo sin aportar aprendizaje real. También ha acelerado mucho la escritura de JSDoc, que es necesaria pero mecánica.

En el lado del CSS, Tailwind tiene una curva de memorización considerable. Pedirle a la IA como traspasar los estilos CSS nativos a los estilos de Tailwind ha ayudado considerablemente.

Por lo general, lo que mas ayuda en cuanto a código es que la IA te da un "template" de código muy rápidamente y se puede iterar sobre el, lo que ahorra mucho tiempo de desarrollo y documentación. Cabe añadir que normalmente la IA es autoexplicativa en el código que aporta.
 
---

## Casos donde la IA ha fallado o ha generado código incorrecto

El caso más claro fue con el comportamiento del `blur` en la edición inline del título. La IA propuso una solución que funcionaba en apariencia, pero cuando el usuario pulsaba `Escape` el evento `blur` se disparaba igualmente después, confirmando un cambio que debería haberse cancelado. El flag `isCancelled` lo resolví yo; la IA no anticipó la secuencia real de eventos del navegador.

También hubo problemas con Tailwind v4. La IA seguía sugiriendo sintaxis de v3 (`@apply` con clases que ya no existían tal cual, o configuración en `tailwind.config.js`) porque la mayoría de su entrenamiento viene de v3. Cada vez que el output era inesperado, tenía que contrastar con la documentación oficial.

En general, sin supervisión real, la IA tiende a tener momentos de lucidez y falta de consistencia. En algunos snippets me da código de CSS nativo y en otros me da las clases de Tailwind, en momentos se piensa que estoy hosteando la web en un servidor de Express. Lo más frustrante es cuando sin solicitarlo, refactoriza funciones o código que funciona perfectamente fuera del scope de la consulta.

---

## Riesgos de depender demasiado de la IA

El riesgo más inmediato es perder la capacidad de leer el propio código. Cuando un bloque lo genera la IA, cualquier bug en él se convierte en una caja negra. Preguntas a la IA para arreglarlo, te da otra solución que tampoco entiendes del todo, y entras en un ciclo donde el código crece pero tu comprensión no.

Hay también un riesgo más sutil: la IA es muy buena en converger hacia soluciones estándar. Eso está bien la mayor parte del tiempo, pero puede atajar decisiones de diseño que merecen ser pensadas. Si siempre aceptas la primera propuesta razonable, el proyecto acaba pareciéndose a todos los demás proyectos.

A largo plazo, el mayor peligro es no desarrollar el criterio para evaluar si una solución es buena. La IA puede generar código que funciona, que pasa los tests y que tiene buen aspecto, pero que introduce deuda técnica, viola el principio de responsabilidad única o simplemente no encaja con la arquitectura que quieres. Detectar eso requiere experiencia propia, y esa experiencia solo se construye programando, equivocándose y corrigiendo con documentación adecuada.

En IDEs como Cursor, hay límites en el uso del agente de IA. Crear una sobredependencia con este agente podría resultar en no poder seguir utilizando el IDE ya que no ofrece nada destacable frente a otras soluciones.
 
---

## Cuándo prefiero programar sin asistencia

Cuando estoy aprendiendo algo nuevo de verdad. Si la IA me da la respuesta, me saltó el proceso de razonamiento que es exactamente donde ocurre el aprendizaje. Entender por qué ocurre el problema es más valioso que tener un workaround funcionando en treinta segundos.

También prefiero trabajar solo cuando el problema es pequeño y bien definido. El tiempo de formular el prompt, revisar la respuesta y adaptarla al contexto del proyecto suele ser mayor que el de escribirlo directamente.

Y en decisiones de arquitectura. Cómo organizar el estado, qué separar en funciones, qué nombrar de qué manera: esas decisiones reflejan cómo pienso sobre el problema. Delegarlas en la IA produce código que funciona pero que no siento mío, lo que dificulta mantenerlo después.