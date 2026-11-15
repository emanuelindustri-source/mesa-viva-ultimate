// Capa pura del motor 2.5D: matemáticas, layout, sensores y estado.
// PixiJS y GSAP viven en el subpath "./pixi" para no cargar GPU en Node/CI.

export type { AtlasCell, AtlasPlan, AtlasPlanOptions, AtlasSheetPlan } from './atlas/plan.js';
export { assetsById, planAtlas, selectAtlasAssets, themeAtlasKey } from './atlas/plan.js';
export type { SvgCellRequest, SvgDimensions } from './atlas/svg.js';
export { fitInside, svgCellDataUri, svgCellDocument, svgToDataUri } from './atlas/svg.js';
export type { CameraRigOptions } from './camera/camera-rig.js';
export { CameraRig } from './camera/camera-rig.js';
export type { CameraPreset } from './camera/presets.js';
export { CAMERA_PRESETS, cameraForFormat, gyroParallax } from './camera/presets.js';
export type { PlanePoint, ProjectedPoint, ProjectorOptions } from './camera/projector.js';
export { Projector } from './camera/projector.js';
export type { DragGestureOptions, GestureEndResult, GestureVelocity, PointerSample } from './drag/gesture.js';
export { DragGesture } from './drag/gesture.js';
export type { DragFrame, DragPhysicsConfig, DragShadow, DragVelocity } from './drag/physics.js';
export {
  computeDragFrameInto,
  createDragFrame,
  DEFAULT_DRAG_PHYSICS,
  dragFrameFor,
  landingFor,
  sampleLanding,
} from './drag/physics.js';
export type { ParticleBehavior, ParticleProfile } from './effects/particles.js';
export { particleBudget, particleProfile } from './effects/particles.js';
export type { CellCenter, CellHit, GridLayout, GridSpec } from './entities/board-layout.js';
export { BOARD_PRESETS, cellCenter, createGridLayout, nearestCell, snapToCell } from './entities/board-layout.js';
export type { ChipDenomination, ChipStack, ChipStackLayout, ChipStackOptions } from './entities/chips.js';
export { CHIP_DENOMINATIONS, chipStackLayout, dominantChipColor } from './entities/chips.js';
export type { DiceRollPlan, DieValue, PipPosition } from './entities/dice.js';
export { clampDie, diceRollPlan, PIP_LAYOUTS, rollDie } from './entities/dice.js';
export type { DominoPip } from './entities/domino-pips.js';
export { dominoPips } from './entities/domino-pips.js';
export type { FanOptions, FanSlot } from './entities/fan-layout.js';
export { fanLayout, HAND_FAN_DEFAULTS, reorderFan } from './entities/fan-layout.js';
export type { GlossTier, RankGloss } from './entities/rank-gloss.js';
export { glossForRank, seatFrameForRank } from './entities/rank-gloss.js';
export type { SeatLayoutOptions, SeatSlot, SeatTable } from './entities/seats.js';
export { boardRotationForViewer, normalizeDegrees, seatForPlayer, seatLayout } from './entities/seats.js';
export type { StageLayout, StageLayoutOptions, StagePane } from './layout/stage-layout.js';
export { paneAt, stageLayoutFor, TABLE_HALF_HEIGHT, TABLE_HALF_WIDTH } from './layout/stage-layout.js';
export { dampFactor, easeOutBack, easeOutCubic, lerp, moveTowards, smoothstep } from './math/easing.js';
export type { SeededRandom } from './math/random.js';
export { createSeededRandom } from './math/random.js';
export type { LandingFrame, LandingOptions, SpringConfig, SpringState } from './math/spring.js';
export {
  LANDING_SPRING,
  landingHeightAt,
  simulateLanding,
  stepSpring,
} from './math/spring.js';
export { clamp, lerpVec3, ZERO_VEC3 } from './math/vec3.js';
export type {
  CapacitorListenerHandle,
  CapacitorMotionPayload,
  CapacitorMotionPlugin,
  CapacitorPermissionsResult,
  CapacitorRotationRate,
  CapacitorSourceOptions,
  CapacitorVector,
} from './motion/capacitor.js';
export {
  createCapacitorMotionSource,
  normalizeCapacitorPayload,
} from './motion/capacitor.js';
export type { FaceDownSnapshot, ShakeResult } from './motion/gestures.js';
export { FaceDownDetector, ShakeDetector } from './motion/gestures.js';
export type { MotionEngineOptions } from './motion/sensor-engine.js';
export { MotionSensorEngine } from './motion/sensor-engine.js';
export { clampTilt, TiltSmoother, tiltReading, tiltToLight } from './motion/tilt.js';
export type {
  AccelerationSample,
  MotionConfig,
  MotionFrame,
  MotionPermission,
  MotionSample,
  MotionSource,
  MotionStatus,
  RotationRateSample,
  TiltReading,
} from './motion/types.js';
export {
  DEFAULT_MOTION_CONFIG,
} from './motion/types.js';
export type { FrameBudget, FrameExtra, FrameSummary } from './perf/frame-monitor.js';
export { FrameMonitor, frameBudget, meetsBudget } from './perf/frame-monitor.js';
export type { DrawCallEstimate, TextureMemoryEstimate } from './perf/memory.js';
export { estimateAtlasMemory, estimateDrawCalls } from './perf/memory.js';
export type { QualitySettings, QualityTier } from './perf/quality.js';
export { chooseQuality, qualitySettings } from './perf/quality.js';
export type { FocusDirection, FocusItem, FocusOptions } from './picking/navigation.js';
export { firstFocus, nextFocus } from './picking/navigation.js';
export type { HitTarget } from './picking/picking.js';
export { boundingRect, pickTopmost, pointInRotatedRect, pointInsideBounds } from './picking/picking.js';
export type { PoolBudget, PoolKind, PoolQuality } from './pool/budgets.js';
export { POOL_BUDGETS, poolBudget } from './pool/budgets.js';
export type { PoolOptions, PoolStats } from './pool/object-pool.js';
export { ObjectPool } from './pool/object-pool.js';
export type { ViewportSize } from './render/culling.js';
export { countVisible, isOnScreen } from './render/culling.js';
export type { MotionLevel, RenderBackend, RenderCapabilities, RenderPlan } from './render/mode.js';
export { detectRenderCapabilities, planRender } from './render/mode.js';
export {
  snapshotFromBlackjack,
  snapshotFromCaida,
  snapshotFromColors,
  snapshotFromDomino,
} from './state/adapters.js';
export type {
  BoardKind,
  BoardSnapshot,
  CardDeck,
  CardSnapshot,
  CardZone,
  ChipSnapshot,
  DiceSnapshot,
  SeatSnapshot,
  TableSnapshot,
  TileSnapshot,
  TokenSnapshot,
} from './state/snapshot.js';
export {
  countFacedown,
  EMPTY_BOARD,
  emptySnapshot,
  viewerSeatIndex,
} from './state/snapshot.js';
export type { Vec3 } from './version.js';
export { ENGINE_25D_VERSION } from './version.js';
