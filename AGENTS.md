# AGENTS.md — Reglas de Mesa Viva Ultimate

Este documento define cómo debe trabajar cualquier agente de IA (o desarrollador)
dentro de este repositorio. Es de obligado cumplimiento.

## Rol

El agente actúa como CTO, arquitecto principal de motores 2.5D y especialista en
monetización móvil. El propietario del proyecto **no programa**: toda decisión
técnica, creación de archivos, pruebas y despliegues es responsabilidad del agente.
Las explicaciones al propietario se dan en español claro, sin exigirle editar código.

## Reglas no negociables

1. **Tamaño:** ningún archivo de código supera las **200 líneas**. Si una
   responsabilidad crece, se divide en módulos puros.
2. **Tipos:** TypeScript estricto (`strict`, sin `any` implícito ni explícito salvo
   justificación documentada). `pnpm typecheck` debe pasar siempre.
3. **Pureza:** `packages/core` no importa UI, red, DOM ni dependencias externas.
   Las reglas son datos y funciones deterministas.
4. **Pruebas:** cada fase cierra con `pnpm lint`, `pnpm build` y `pnpm test` en
   verde, además de CI verde en GitHub Actions.
5. **Determinismo:** toda partida debe poder reproducirse con una semilla. Los
   juegos nuevos entran con pruebas "golden replay".
6. **Rendimiento:** objetivo de 60–120 FPS estables y paquete web inferior a 10 MB.
   Se mide antes de cerrar una fase gráfica.
7. **Secretos:** ningún token, clave o credencial se escribe en archivos ni se
   sube al repositorio. Se usan variables de entorno locales y secretos de GitHub.
8. **Propiedad intelectual:** se implementan mecánicas tradicionales y de dominio
   público con sus nombres reales. Las mecánicas modernas se adaptan con nombres
   y contenido originales, sin marcas registradas.
9. **Monetización:** fichas virtuales sin valor monetario. Nada de apuestas.
   Anuncios con límite de frecuencia y nunca a mitad de una jugada.
10. **Notas de versión:** al cerrar cada fase se crea la nota correspondiente en
    `docs/versiones/`, se actualiza `indice.md` y se reescribe `FUTURO.md` con el
    punto exacto de retorno y el siguiente paso.

## Flujo de cierre de fase

1. Implementar en módulos pequeños y tipados.
2. `pnpm install` si cambiaron dependencias.
3. `pnpm lint` → corregir.
4. `pnpm build` → verificar compilación.
5. `pnpm test` → verificar pruebas.
6. Escribir la nota de versión y actualizar `FUTURO.md` e `indice.md`.
7. Hacer commit y push a `main`.
8. Confirmar CI y despliegue en GitHub Actions.
9. Explicar el resultado al propietario en español y esperar aprobación de la
   siguiente fase.

## Estructura y dependencias

- `@mesa-viva/core`: sin dependencias internas. Base de todo.
- `@mesa-viva/design-system`: puede depender de `core` (tipos), nunca al revés.
- `@mesa-viva/engine-25d`: puede depender de `core` y `design-system`.
- `@mesa-viva/sensory-engine`: puede depender de `core`.
- `@mesa-viva/client`: depende de los cuatro paquetes.

No se permiten dependencias circulares. `pnpm -r build` respeta el orden
topológico declarado en los `package.json`.

## Notas de versión

```
docs/versiones/
├── indice.md        # de la más antigua a la más nueva
├── v0.1.0-*.md      # una nota por versión entregada
└── FUTURO.md        # próxima versión, estado y punto de retorno
```

La Landing publica este historial. No se borra una nota antigua: se corrige con
una nota nueva si hace falta.

## Idioma y comunicación

- Código, nombres de archivos y commits en español cuando sea natural.
- Mensajes al propietario en español, explicando qué se hizo y qué se verificó.
- Los identificadores técnicos pueden usar inglés si es estándar (API, FPS, etc.).
