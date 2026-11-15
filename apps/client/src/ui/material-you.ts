import { type AndroidDynamicColors, parseAndroidDynamicColors } from '@mesa-viva/design-system';

interface AndroidBridge {
  readonly materialYou?: unknown;
}

/** Lee la paleta que inyecta el puente Kotlin de Android 12+ si existe. */
export function nativeDynamicColors(target: unknown = globalThis): AndroidDynamicColors | null {
  try {
    const bridge = (target as { MesaVivaAndroid?: AndroidBridge }).MesaVivaAndroid;
    const json = bridge?.materialYou;
    return typeof json === 'string' ? parseAndroidDynamicColors(json) : null;
  } catch {
    return null;
  }
}
