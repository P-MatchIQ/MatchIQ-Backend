export function validateRegister({ email, password, confirmPassword }) {
  if (!email || !password || !confirmPassword) {
    throw new Error('Todos los campos son obligatorios');
  }

  if (password.length < 6) {
    throw new Error('La contraseña debe tener mínimo 6 caracteres');
  }

  if (password !== confirmPassword) {
    throw new Error('Las contraseñas no coinciden');
  }
}
