/**
 * @file shim.js
 * @description Polyfill preventivo para el entorno de desarrollo en Expo SDK 54 / Metro.
 * Evita el error 'cannot read property protocol of undefined' en HMRClient.setup
 * cuando React Native define global.window pero window.location no está presente en entornos móviles.
 */

if (typeof globalThis !== 'undefined') {
  if (!globalThis.location) {
    const defaultLocation = {
      protocol: 'http:',
      host: 'localhost:8081',
      hostname: 'localhost',
      port: '8081',
      href: 'http://localhost:8081/',
      pathname: '/',
      search: '',
      hash: '',
    };
    try {
      globalThis.location = defaultLocation;
    } catch (_) {}
    if (globalThis.window && !globalThis.window.location) {
      try {
        globalThis.window.location = defaultLocation;
      } catch (_) {}
    }
  }
}
