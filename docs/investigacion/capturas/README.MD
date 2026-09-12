# Capturas de la aplicación

Evidencia visual del primer entregable de BolsilloAlDía, tomada sobre la aplicación en ejecución con Expo Go. Las imágenes siguen el recorrido real del usuario: primero el acceso, después las secciones internas y, al final, la consola de Firebase que respalda la persistencia.

Las pantallas de Movimientos, Categorías y Metas aparecen en su versión provisional. Su función está definida en la [matriz de trazabilidad](../matriz-trazabilidad.pdf) y se implementa sobre esta misma navegación.

## Figura 1 · Crear cuenta

![Formulario de registro de usuario]

Formulario de registro con nombre, correo y contraseña. Corresponde a RF-AUT-01. La cuenta se crea en Firebase Authentication y, en el mismo paso, se guarda el perfil en la colección `users` usando el UID como identificador del documento. Los errores de Firebase se traducen a mensajes en español antes de mostrarse.

## Figura 2 · Iniciar sesión

![Pantalla de inicio de sesión]

Acceso con correo y contraseña, correspondiente a RF-AUT-02. Al autenticarse, el listener `onAuthStateChanged` actualiza el contexto de sesión y la navegación cambia sola a la barra de pestañas: no hay una llamada manual de navegación después del login.

## Figura 3 · Movimientos

![Pestaña de movimientos]

Primera pestaña de la aplicación. Ocupa esa posición porque registrar un gasto es la acción más frecuente y responde al hallazgo P-01, el abandono del registro por fricción. Aquí se implementarán RF-MOV-01 y RF-MOV-02.

## Figura 4 · Categorías

![Pestaña de categorías]

Sección destinada a crear y listar las categorías de ingreso y gasto del usuario autenticado, según RF-CAT-01.

## Figura 5 · Metas

![Pestaña de metas]

Sección destinada a las metas de ahorro, con monto objetivo y fecha límite, según RF-MET-01.

## Figura 6 · Perfil

![Pantalla de perfil con el correo de la sesión]

Muestra el correo de la sesión activa y permite cerrar sesión. Sirve como verificación visual de que el contexto de autenticación expone al usuario correcto. Al cerrar sesión, el usuario pasa a `null` y la aplicación regresa sola a la pila de acceso.

## Figura 7 · Consola de Firebase

![Consola de Firebase con el usuario registrado]

Usuario creado desde la aplicación, visible en Firebase Authentication con su UID. Es la evidencia de que el registro no se resuelve solo en la interfaz: la cuenta existe en el proyecto y su identificador es el que vincula todos los datos del usuario en Firestore.

---

Fuente: capturas tomadas por el equipo sobre la aplicación en ejecución. No contienen credenciales reales ni datos de terceros. Las claves visibles en la consola de Firebase, en caso de aparecer, no son secretas: viajan dentro de la aplicación compilada y la seguridad del proyecto depende de las reglas de Firestore.