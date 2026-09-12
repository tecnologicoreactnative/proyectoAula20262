# Investigación de campo · BolsilloAlDía

En esta carpeta reunimos el trabajo de campo que orienta la aplicación del proyecto de Desarrollo Móvil. Entrevistamos a tres estudiantes del TdeA para conocer cómo organizan sus gastos, qué les dificulta ahorrar y qué esperarían de una aplicación de finanzas personales.

**Encuentro:** 3 de septiembre de 2026, 2:00 p. m., biblioteca del Tecnológico de Antioquia.  
**Entrevistador:** Juan David Franco Yepes.

## Equipo

* Juan Andrés Taborda Rodríguez
* Juan David Franco Yepes
* Emmanuel Vidal
* Johan Alexander Mejía Tamayo
* Sara Mejía

## Documentos principales

|Documento|Para qué sirve|
|-|-|
|[Informe de hallazgos](informe-hallazgos.pdf)|Presenta el problema, el método, los hallazgos, la matriz y la conclusión en dos páginas.|
|[Ficha de observación](ficha-observacion.pdf)|Registra el encuentro, los métodos relatados y las cuatro fotografías con sus participantes.|
|[Análisis de entrevistas](analisis-entrevistas.pdf)|Explica las diferencias entre los participantes y las decisiones del equipo.|
|[Matriz de trazabilidad](matriz-trazabilidad.pdf)|Relaciona evidencia, requisitos, entregables y pruebas.|
|[Parámetros y backlog](parametros-app-y-backlog.pdf)|Define reglas propuestas, datos, prioridades y ejemplos de prueba.|
|[Tres entrevistas y tabla comparativa](entrevistas/Transcripciones_Tres_Entrevistas.docx)|Permite consultar las preguntas, repreguntas y respuestas completas.|
|[Guion aplicado](entrevistas/Guion_Entrevista_BolsilloAlDia.docx)|Conserva las doce preguntas y organiza apoyos para nuevas entrevistas.|

Las versiones Word del informe, ficha, análisis, matriz y parámetros están en [editables](editables/). Las respuestas originales se conservan en TXT junto a las transcripciones depuradas.

## Participantes y entrevistas

|Participante|Programa y semestre|Registro|
|-|-|-|
|Santiago Román|Profesional en Criminalística, segundo semestre|[Transcripción](entrevistas/Transcripcion_Santiago_Roman.docx) · [TXT original](entrevistas/Santiago_Roman_original.txt)|
|Miguel|Ingeniería de Software, cuarto semestre|[Transcripción](entrevistas/Transcripcion_Miguel.docx) · [TXT original](entrevistas/Miguel_original.txt)|
|Camila|Psicología, segundo semestre|[Transcripción](entrevistas/Transcripcion_Maria_Camila.docx) · [TXT original](entrevistas/Maria_Camila_original.txt)|

Los nombres de archivo de Camila conservan la denominación de la fuente para facilitar su ubicación. En el texto se usa Camila, como la identifica el equipo.

## Decisiones que salen del trabajo de campo

Los tres participantes mencionan pereza para registrar y dificultades con gastos pequeños o inesperados. Las entrevistas también muestran distintas formas de separar dinero y preferencias diferentes sobre los avisos. A partir de esto proponemos:

* **H-03 / FE-01: bolsillos virtuales y saldo realmente disponible.** Separa las reservas del dinero libre; no mueve dinero bancario. Se implementará en la segunda entrega.
* **H-04 / FE-02: asistente de hábitos con recomendaciones contextuales.** Explica patrones de los registros y permite ajustar la frecuencia de los avisos. Se implementará y validará en la tercera entrega.

La primera entrega requiere además autenticación, creación y listado de categorías y metas, y registro y listado de movimientos. Esta carpeta documenta la investigación y las decisiones; la implementación y sus pruebas se verifican en el código de la aplicación.

## Evidencias y lectura del material

* [Cuatro fotografías y pies de foto](fotografias/README.md).
* [Registro de autorizaciones y enlaces audiovisuales](video/README.md).

Las entrevistas se depuraron para mejorar la lectura sin ampliar las respuestas. Los corchetes señalan pasajes incompletos o notas de revisión. El análisis y los ejemplos numéricos son aportes del equipo y se presentan separados de los testimonios. Los hábitos financieros recogidos son experiencias relatadas durante el encuentro.

La muestra es exploratoria: permite definir requisitos iniciales, pero no representa estadísticamente al conjunto de estudiantes del TdeA. Las pruebas con usuarios previstas para las siguientes entregas permitirán revisar las decisiones de diseño.

## Control de publicación

Antes de publicar las imágenes y los testimonios, completar la constancia de autorización de Juan David y los enlaces verificables de las autorizaciones registradas. El permiso recogido en el guion se refiere al uso académico: confirmar con los participantes el alcance si el repositorio será público. Los videos pesados se enlazan; no se incorporan los originales 4K al historial Git.

El documento oficial del proyecto exige investigación en `/docs/investigacion`, enlazada desde el README principal, y aportes verificables de los integrantes en el branch asignado.

## Herramientas en uso

La entrevista se grabó en la biblioteca de la institución con un Samsung Galaxy S26 Ultra, aprovechando el micrófono del propio teléfono para capturar el audio con claridad en un entorno con ruido. El mismo dispositivo sirvió también como bitácora: en el bloc de notas se anotaron, en el momento, ideas, citas y detalles que no convenía dejar solo en la grabación.

La edición se realizó en un ordenador de escritorio. Ahí se revisó el material, se ordenó el relato y se preparó la versión final. CapCut Pro se usó para recortar, dar ritmo y presentar el contenido de forma más limpia. Los \*\*asistentes de inteligencia artificial\*\* ayudaron a organizar la información, estructurar el texto y automatizar tareas repetitivas de redacción y revisión.

El resto fue extra: auriculares para revisar el audio con calma, transferencia de archivos entre el teléfono y el computador, copias de seguridad en la nube y ajustes menores de formato. Nada de eso sustituye el registro original; solo sirvió para dejar el material ordenado y listo para leerse o publicarse.

