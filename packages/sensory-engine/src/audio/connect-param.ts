import type { AudioNodeLike, AudioParamLike } from './contracts.js';

/** Web Audio permite conectar un nodo al parámetro de otro; se aísla aquí. */
export function connectToParam(source: AudioNodeLike, param: AudioParamLike): void {
  const connect = source.connect as unknown as (destination: AudioParamLike) => void;
  connect.call(source, param);
}
