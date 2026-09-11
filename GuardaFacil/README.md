GuardaFacil/
├── assets/                         # Imágenes e iconos de la aplicación
├── contextos/
│   └── AuthContexto.js             # Estado de autenticación compartido
├── navegacion/
│   └── NavegacionStack.js          # Stack principal de navegación
├── pantallas/
│   ├── HomeScreen.js                # Bienvenida pública
│   ├── LoginScreen.js               # Inicio de sesión
│   ├── RegistroScreen.js            # Creación de cuenta y perfil
│   ├── validacionesAuth.js          # Validaciones de Login y Registro
│   └── ListaScreen.js               # Pantalla home protegida
├── firebase/
│   └── firebaseConfig.js            # Inicialización de Firebase Auth y Firestore
├── App.js                           # Punto de entrada
├── app.json                         # Configuración de Expo
├── package.json                     # Dependencias y scripts
├── .gitignore
├── .env                             # Variables locales, no se versiona
└── README.md
```

## Requisitos

- Node.js LTS y npm.
- Una cuenta de Firebase con Authentication habilitado.
- Expo Go, un emulador Android o un simulador iOS.

## Instalación

Desde `GuardaFacil` instala las dependencias:

```bash
npm install
```

Configura un archivo `.env` en la raíz con las credenciales de Firebase:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=tu-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-messaging-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=tu-app-id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=tu-measurement-id
```

El archivo `.env` está excluido del repositorio. No publiques credenciales reales.

## Ejecutar

```bash
npx expo start
npm run android
npm run ios
npm run web
npm run lint
```

La aplicación usa `App.js` como entrada, `NavigationContainer` como contenedor raíz y `NavegacionStack` para mostrar Home, Login y Registro cuando no hay sesión, y `Lista` cuando el usuario está autenticado. Los datos adicionales del registro se guardan en `users/{uid}` de Cloud Firestore; las contraseñas solo son gestionadas por Firebase Authentication.