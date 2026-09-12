export function validarCorreo(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
}

export function validarRegistro(datos) {
  const errores = {};

  if (!datos.nombreCompleto.trim()) errores.nombreCompleto = 'Escribe tu nombre completo.';
  if (!/^\d{6,12}$/.test(datos.cedula.trim())) errores.cedula = 'Usa solo números (entre 6 y 12 dígitos).';
  if (!/^\d{7,15}$/.test(datos.telefono.trim())) errores.telefono = 'Usa solo números (entre 7 y 15 dígitos).';
  if (!validarCorreo(datos.correo)) errores.correo = 'Escribe un correo válido.';
  if (!datos.direccion.trim()) errores.direccion = 'Escribe tu dirección.';
  if (datos.contrasena.length < 6) errores.contrasena = 'Usa al menos 6 caracteres.';
  if (datos.confirmarContrasena !== datos.contrasena) errores.confirmarContrasena = 'Las contraseñas no coinciden.';

  return errores;
}