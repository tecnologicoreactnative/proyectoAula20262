# PrestaLab

Sistema de gestión de préstamos de laboratorio.

## Descripción

Sistema para gestionar el préstamo de elementos de laboratorio, permitiendo préstamos internos y externos con control de tiempos y sanciones.

## Configuración

La aplicación usa Firebase y necesita estas variables de entorno para iniciar
la autenticación y Firestore:

1. Crea una aplicación web en tu proyecto de Firebase.
2. Copia `.env.example` como `.env`.
3. Completa los valores de la configuración de Firebase en `.env`.
4. Habilita Authentication (proveedor Email/Password) y crea la base de datos
   de Firestore.
5. Reinicia Expo después de modificar `.env`:

```bash
npm start -- --clear
```

Las variables `EXPO_PUBLIC_*` se incluyen en el cliente móvil; no coloques
claves privadas o credenciales de cuentas de servicio en `.env`.

## Documentación

- [Requisitos del Sistema](docs/investigacion/Requisitos_Sistema.docx)
- [Matriz de Trazabilidad](docs/investigacion/Matriz_Trazabilidad.docx)

## Estructura del proyecto

```
PrestaLab-app/
├── docs/
│   └── investigacion/
│       ├── Requisitos_Sistema.docx
│       └── Matriz_Trazabilidad.docx
├── src/
├── App.js
└── package.json
```
