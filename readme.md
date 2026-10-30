# FEBACIP · Simulador de donaciones

Proyecto final de JavaScript: elegí asociaciones civiles, armá tus aportes y confirmá una donación simulada. No procesa pagos, no envía mensajes y no requiere registro.


## Recorrido

1. Buscá por nombre o localidad y filtrá por categoría.
2. Sumá una o varias asociaciones. Cada aporte empieza en $1.000.
3. Modificá los montos (pesos enteros entre $100 y $1.000.000) o quitá aportes. Una asociación no se duplica.
4. Revisá el resumen y confirmá con SweetAlert2. Cancelar conserva la selección.
5. Consultá el comprobante y el total acumulado en el historial. Al confirmar se vacían los aportes pendientes.
6. Recargá la página: se conservan la selección y el historial. Podés vaciar aportes o borrar historial por separado, con confirmación.

## Requisitos de la consigna

| Requisito | Implementación |
| --- | --- |
| DOM y eventos | Tarjetas, filtros, montos editables y comprobantes; eventos `click`, `input` y `change`. |
| JSON y Fetch | Catálogo de objetos en `data.json`; estado vacío en `estado-inicial.json`. Ambos se cargan con Fetch. No hay catálogos de objetos escritos en JavaScript. |
| Funciones de orden superior | `filter` para búsquedas y bajas, `find` para asociaciones, `map` para transformar aportes, `forEach` para renderizar y `reduce` para totales. |
| Storage | Estado versionado en `febacip.donaciones.v1`. Se recupera, valida y actualiza con `JSON.parse` / `JSON.stringify`. Las operaciones de borrado conservan las otras secciones y las claves ajenas. |
| Operadores avanzados | Destructuring, spread, ternarios y OR lógico en validaciones y controles. |
| Asincronismo | `async/await`, `Promise.all`, comprobación de `respuesta.ok` y `try/catch/finally` con estado de carga y reintento. |
| Librería externa | SweetAlert2 para revisar, confirmar y cancelar operaciones. No se utilizan `prompt`, `alert` ni `confirm` nativos. |
| Circuito completo | Selección → edición → resumen → confirmación simulada → comprobante → historial persistido. |
| Código claro | Nombres semánticos y funciones separadas por responsabilidad; se eliminaron archivos duplicados sin uso. |

Los aportes y comprobantes nuevos se generan con las interacciones del usuario: son datos dinámicos, serializados como JSON en localStorage. Los datos iniciales provienen de archivos JSON mediante Fetch. Un sitio estático no puede sobrescribir esos archivos desde el navegador.

## Archivos

- `index.html`: estructura semántica y controles.
- `css/styles.css`: diseño adaptable a escritorio y móvil.
- `js/main.js`: carga, validación, DOM, cálculos, persistencia y confirmaciones.
- `data.json`: seis asociaciones civiles.
- `estado-inicial.json`: selección e historial iniciales vacíos.

## Manejo de errores

Si falla el catálogo o el estado inicial, se ofrece reintentar. Si el almacenamiento contiene datos inválidos, se informa y se inicia una selección vacía. Si una escritura falla, no se confirma el cambio ni se anuncia una donación exitosa. El estado completo se guarda en una única escritura para evitar separar el comprobante del vaciado de aportes. Si no carga SweetAlert2, se informa en pantalla y se deshabilitan las operaciones que requieren sus confirmaciones.

El historial se conserva únicamente en este navegador y origen. No es un comprobante de pago real ni se sincroniza entre dispositivos.

