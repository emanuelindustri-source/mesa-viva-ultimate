/**
 * Clave canónica de una acción para comparar acciones legales sin depender
 * del orden de las propiedades. Las acciones de los juegos son objetos planos.
 */
export function actionKey(action: unknown): string {
  if (action === null || typeof action !== 'object') {
    return JSON.stringify(action) ?? 'null';
  }
  const record = action as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(record).sort()) {
    sorted[key] = record[key];
  }
  return JSON.stringify(sorted);
}

export function sameAction(a: unknown, b: unknown): boolean {
  return actionKey(a) === actionKey(b);
}
