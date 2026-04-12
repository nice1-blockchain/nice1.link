export const EOSIO_NAME_REGEX = /^[a-z1-5.]{1,12}$/;

export const validateEosioName = (name: string): string | null => {
  if (!name) return 'El nombre es obligatorio';
  if (name.length > 12) return 'Máximo 12 caracteres';
  if (!EOSIO_NAME_REGEX.test(name)) return 'Solo letras minúsculas (a-z) y números del 1 al 5, sin espacios';
  if (name.endsWith('.')) return 'No puede terminar en punto';
  return null;
};
