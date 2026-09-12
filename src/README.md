# BolsilloAlDía

Aplicación móvil de finanzas personales y metas de ahorro para estudiantes, construida con React Native (Expo) y Firebase.

**Proyecto de Aula N.º 5** · Desarrollo de Aplicaciones Móviles · Tecnológico de Antioquia
**Grupo 7** · Rama de trabajo: `grupo7`
**Estado:** primer entregable en desarrollo

---

## Equipo

- Juan Andrés Taborda Rodríguez
- Juan David Franco Yepes
- Emmanuel Vidal Anaya
- Johan Alexander Mejía Tamayo
- Sara Mejía Jimenez 

---

## El problema

Los estudiantes no saben en qué se les va el dinero. Llevan las cuentas de memoria, abandonan las aplicaciones de registro por pereza y los gastos pequeños —el pasaje, el tinto, la fotocopia— desaparecen sin dejar rastro hasta que el presupuesto ya no cuadra.

BolsilloAlDía ataca ese problema reduciendo al mínimo el esfuerzo de registrar un movimiento, haciendo visible el efecto acumulado de los gastos pequeños y protegiendo el dinero que el usuario ya destinó a otra cosa.

El planteamiento no es una suposición. Sale de tres entrevistas semiestructuradas realizadas el 3 de septiembre de 2026 en la biblioteca del Tecnológico de Antioquia, con estudiantes de Criminalística, Ingeniería de Software y Psicología. La documentación completa está en [`docs/investigacion/`](docs/investigacion/README.md).

### Hallazgos que originan el producto

| ID | Hallazgo | Frecuencia | Deriva en |
|---|---|---|---|
| H-01 | El estudiante no sabe en qué se va el dinero y usa la memoria | — | RF-MOV-01 / RF-RES-01 |
| H-02 | Los gastos ocurren sin señal y deben registrarse sin conexión | — | RNF-OFF-01 / RNF-SIN-01 |
| H-03 | Separa dinero mentalmente, pero los gastos pequeños consumen lo que creía disponible | 3/3 | **FE-01** |
| H-04 | Necesita acompañamiento preventivo, pero las notificaciones excesivas provocan abandono | 3/3 | **FE-02** |

### Comprometido para las siguientes entregas

- **FE-01 · Bolsillos virtuales y saldo realmente disponible** (segundo entregable). Reservar dinero sin registrarlo como gasto y mostrar `saldoLibre = saldoGeneral − saldoReservado`.
- **FE-02 · Asistente de hábitos con recomendaciones contextuales** (tercer entregable). Reglas transparentes sobre movimientos reales, con frecuencia controlada por el usuario.

---

## Estado del primer entregable

| ID | Función | Estado |
|---|---|---|
| RF-AUT-01 | Registro de usuario con validación y mensajes de error claros | Implementado |
| RF-AUT-02 | Inicio y cierre de sesión, con sesión persistente | Implementado |
| RF-UX-01 | Navegación estable por pestañas | Implementado |
| RF-CAT-01 | Crear y listar categorías | Pantalla provisional |
| RF-MET-01 | Crear y listar metas | Pantalla provisional |
| RF-MOV-01 | Registrar movimientos | Pantalla provisional |
| RF-MOV-02 | Listar movimientos del usuario | Pendiente |
| RF-RES-01 | Resumen de ingresos, gastos y saldo | Pendiente |

Las capturas del estado actual están en [`docs/investigacion/capturas/`](docs/investigacion/capturas/README.md).

---

## Tecnologías

| Componente | Herramienta |
|---|---|
| Framework | Expo SDK 57 · React Native 0.86 |
| Lenguaje | JavaScript |
| Navegación | React Navigation 7 (Native Stack + Bottom Tabs) |
| Autenticación | Firebase Authentication (correo y contraseña) |
| Base de datos | Cloud Firestore |
| Persistencia de sesión | AsyncStorage |
| Iconografía | @expo/vector-icons (Ionicons) |
| Fechas | day.js |
| Identificadores | react-native-uuid |

---

## Cómo ejecutar el proyecto

### Requisitos previos

- Node.js 18 o superior
- Git
- La aplicación **Expo Go** instalada en un celular Android o iOS
- El celular y el computador conectados a la misma red Wi-Fi

### Pasos

```bash
# 1. Clonar el repositorio y ubicarse en la rama del equipo
git clone https://github.com/DanteMontecristo/Grupo7.git
cd Grupo7
git switch grupo7

# 2. Instalar las dependencias
npm install

# 3. Configurar las variables de entorno
cp .env.example .env
#    Abrir .env y reemplazar los valores con los del proyecto de Firebase

# 4. Levantar el servidor de desarrollo
npx expo start
```

Escanear el código QR con Expo Go (Android) o con la cámara (iOS).

### Variables de entorno

El archivo `.env` no se versiona. Los valores se obtienen en la consola de Firebase, en **Configuración del proyecto → Tus apps → app web**.

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

El prefijo `EXPO_PUBLIC_` es obligatorio para que Expo inyecte las variables en el bundle. Estas claves no son secretas: viajan dentro de la aplicación compilada y cualquiera puede extraerlas. La seguridad del proyecto no depende de ocultarlas, sino de las reglas de Firestore.

### Credenciales de prueba

Para revisar la aplicación sin crear una cuenta:

```
Correo:     (correo de prueba)
Contraseña: (contraseña de prueba)
```

---

## Estructura del proyecto

```
App.js                            Punto de entrada: SafeAreaProvider + AuthProvider
index.js                          Registro del componente raíz (Expo)

src/
├── config/
│   └── firebaseConfig.js         Inicializa Firebase, auth (con persistencia) y Firestore
├── context/
│   └── authContext.js            Estado global de sesión mediante onAuthStateChanged
├── navigation/
│   ├── navigationStack.js        Decide qué stack montar según exista sesión
│   ├── authStack.js              Login y Registro
│   └── navigationTabs.js         Movimientos, Categorías, Metas y Perfil
├── screens/
│   ├── loginScreen.js            Inicio de sesión (RF-AUT-02)
│   ├── singUpScreen.js           Creación de cuenta (RF-AUT-01)
│   ├── profileScreen.js          Correo de la sesión y cierre de sesión
│   ├── movementsScreen.js        Provisional (RF-MOV-01 / RF-MOV-02)
│   ├── goalsScreen.js            Provisional (RF-MET-01)
│   └── category/
│       └── categoryScreen.js     Provisional (RF-CAT-01)
└── services/
    └── authServices.js           Única capa que habla con Firebase Auth y Firestore

docs/investigacion/               Evidencias de la investigación de campo
├── capturas/                     Capturas de la aplicación
├── entrevistas/                  Transcripciones y guion aplicado
├── fotografias/                  Registro fotográfico del trabajo de campo
├── video/                        Material audiovisual y autorizaciones
└── editables/                    Versiones Word de los documentos
```

### Decisiones de arquitectura

**Las pantallas nunca hablan con Firebase.** Toda lectura y escritura pasa por `src/services/`. Cuando se implemente el modo sin conexión del segundo entregable, la cola de sincronización se incorpora dentro de esos servicios sin modificar una sola pantalla.

**La navegación responde al estado, no a llamadas manuales.** `navigationStack.js` monta las pestañas o la pila de acceso según exista sesión. Sin sesión, las pantallas privadas no existen en el árbol de componentes, de modo que resulta imposible alcanzarlas.

**La sesión sobrevive al cierre de la aplicación.** `initializeAuth` se configura con `getReactNativePersistence(AsyncStorage)` en lugar de usar `getAuth()`. Un estado de carga evita que la pantalla de acceso parpadee mientras Firebase verifica si hay sesión guardada.

**Los errores de Firebase se traducen antes de mostrarse.** `mensajeError()` convierte códigos como `auth/invalid-credential` en frases comprensibles, según exige RF-AUT-01.

---

## Modelo de datos

Colecciones planas en Firestore. Cada documento guarda el identificador de su propietario.

| Colección | Campos | Estado |
|---|---|---|
| `users` | `uid`, `name`, `email`, `createdAt` | Implementada |
| `categorias` | `id`, `userId`, `nombre`, `tipo`, `createdAt` | Pendiente |
| `metas` | `id`, `userId`, `nombre`, `montoObjetivo`, `montoActual`, `fechaLimite`, `estado`, `createdAt` | Pendiente |
| `movimientos` | `id`, `userId`, `monto`, `tipo`, `categoriaId`, `fecha`, `nota`, `createdAt`, `localId`, `syncStatus` | Pendiente |

### Fórmulas

```
saldoGeneral   = Σ ingresos − Σ gastos
saldoReservado = Σ saldos de bolsillos reservados activos     (FE-01)
saldoLibre     = saldoGeneral − saldoReservado                (FE-01)
```

Los montos se almacenarán como enteros en centavos: un gasto de $2.500 se guarda como `250000`. Evita los errores de redondeo del punto flotante, que en una aplicación financiera terminan produciendo saldos que no cuadran.

---

## Seguridad

Las reglas de Firestore garantizan que un usuario solo lea y escriba documentos cuyo propietario coincida con su UID, que un movimiento no pueda apuntar a una categoría de otro usuario, y que los montos negativos o iguales a cero se rechacen en el servidor y no solo en el formulario.

### Pruebas previstas

| Caso | Condición | Resultado esperado |
|---|---|---|
| Aislamiento | Dos usuarios con datos | Ninguno lee ni modifica los datos del otro |
| Monto inválido | Monto cero o negativo | No persiste y muestra un error |
| Categoría ajena | `categoriaId` de otro usuario | La regla deniega la escritura |
| Sesión persistente | Cerrar y reabrir la aplicación | Entra directo, sin volver a pedir credenciales |

---

## Documentación de la investigación

| Documento | Contenido |
|---|---|
| [Índice de la investigación](docs/investigacion/README.md) | Equipo, participantes, método y decisiones |
| [Informe de hallazgos](docs/investigacion/informe-hallazgos.pdf) | Problema, hallazgos, decisiones funcionales y backlog |
| [Matriz de trazabilidad](docs/investigacion/matriz-trazabilidad.pdf) | Hallazgo → evidencia → decisión → requisito verificable |
| [Parámetros y backlog](docs/investigacion/parametros-app-y-backlog.pdf) | Modelo de datos, fórmulas y criterios de aceptación |
| [Análisis de entrevistas](docs/investigacion/analisis-entrevistas.pdf) | Diferencias entre participantes y decisiones del equipo |
| [Ficha de observación](docs/investigacion/ficha-observacion.pdf) | Registro del encuentro de campo |
| [Fotografías](docs/investigacion/fotografias/README.md) | Cuatro imágenes con sus pies de foto |
| [Autorizaciones y video](docs/investigacion/video/README.md) | Constancias de uso de imagen y material audiovisual |
| [Capturas de la aplicación](docs/investigacion/capturas/README.md) | Evidencia visual del estado actual |

### Regla de consistencia

Los códigos `H-03`, `H-04`, `FE-01` y `FE-02` se mantienen idénticos en el informe, el backlog, este README, las historias de usuario, los mensajes de commit y la sustentación. Si la observación aporta un hallazgo nuevo, se añade como evidencia complementaria sin alterar la trazabilidad existente.

La muestra es exploratoria: permite definir requisitos iniciales, pero no representa estadísticamente al conjunto de estudiantes del TdeA.

---

## Flujo de trabajo

El repositorio es un fork del repositorio del curso. El equipo trabaja sobre la rama `grupo7` y entrega mediante un Pull Request abierto contra el repositorio original.

```bash
git switch grupo7
git pull                  # siempre antes de empezar a trabajar
# ...cambios...
git add .
git commit -m "feat: descripción del cambio"
git push origin grupo7
```

Cada integrante configura su identidad para que sus commits queden asociados a su cuenta de GitHub:

```bash
git config user.name "Nombre"
git config user.email "correo-de-github"
```