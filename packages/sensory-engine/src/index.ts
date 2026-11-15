export type {
  AudioBufferLike,
  AudioBufferSourceLike,
  AudioContextFactory,
  AudioContextLike,
  AudioDestinationLike,
  AudioListenerLike,
  AudioNodeLike,
  AudioParamLike,
  AudioScheduledSourceLike,
  BiquadFilterLike,
  ChannelMergerNodeLike,
  CompressorNodeLike,
  ConvolverNodeLike,
  DelayNodeLike,
  GainNodeLike,
  OscillatorNodeLike,
  PannerNodeLike,
  StereoPannerNodeLike,
  WaveShaperNodeLike,
} from './audio/contracts.js';
export type { EffectDefinition, EffectId, EffectSynthesisOptions } from './audio/effect-sounds.js';
export { EFFECT_DEFINITIONS, EFFECT_IDS, effectDefinition } from './audio/effect-sounds.js';
export type { EffectPlayback, EffectPlayOptions, EffectStats } from './audio/effects.js';
export { SpatialEffectPlayer } from './audio/effects.js';
export type { AudioBusLevels, AudioBusName, AudioGraphOptions } from './audio/graph.js';
export { AudioGraph } from './audio/graph.js';
export type {
  AudioAnalysis,
  OfflineAudioContextFactory,
  OfflineAudioContextLike,
  OfflinePreviewOptions,
  OfflinePreviewResult,
} from './audio/offline.js';
export { analyzeBuffer, defaultOfflineFactory, renderSensoryPreview } from './audio/offline.js';
export type { AudioRuntimeOptions } from './audio/runtime.js';
export { AudioRuntime, defaultAudioContextFactory } from './audio/runtime.js';
export type {
  SpatialAudioOptions,
  SpatialMode,
  SpatialOutput,
  SpatialOutputOptions,
  SpatialSource,
  SpatialSourceKind,
  SpatialStats,
} from './audio/spatial.js';
export { SpatialAudioEngine } from './audio/spatial.js';
export type { CardSpatialLayout, SeatSpatialLayout, TableSpatialLayout } from './audio/spatial-layout.js';
export { cardArcLayout, centerCardPosition, seatRingLayout } from './audio/spatial-layout.js';
export type { TriggerReport, TriggerSample } from './bench.js';
export { pcmMemoryBytes, SENSORY_BUDGET, SensoryBenchmark } from './bench.js';
export { composeLongForm, eventCounts, MAX_LONG_BARS, MIN_LONG_BARS, performanceDensity, scoreDensity, sectionAtBeat } from './composer/compose.js';
export { buildChords, buildSections, chordAtBeat, chordMidiTones, midiForDegree, nearestChordMidi } from './composer/harmony.js';
export type { MotifTransform } from './composer/motifs.js';
export { buildMotifs, motifDuration, motifTransformAt, transformMotif } from './composer/motifs.js';
export { densityForState, derivePerformanceState, energyForState, stateLabel } from './composer/performance.js';
export type { ChordSlot, ComposeOptions, ComposerInstrument, ComposerLead, LongFormScore, LongFormSection, Motif, MotifCell, PerformanceState, PlayerMusicalState, ScoreEvent, ScorePercussion } from './composer/types.js';
export type { SensoryEventDefinition } from './events.js';
export { SENSORY_EVENT_CATALOG, sensoryEvent } from './events.js';
export type { NativeHapticBridge } from './haptics/capacitor.js';
export { createCapacitorHapticsBridge } from './haptics/capacitor.js';
export { HapticEngine } from './haptics/engine.js';
export { HAPTIC_PATTERNS, HAPTIC_PRIMITIVE_SPECS, hapticPattern, pulseDuration, toVibrationPattern } from './haptics/patterns.js';
export type {
  CapacitorHapticsPlugin,
  CapacitorImpactStyle,
  HapticCapabilities,
  HapticEngineOptions,
  HapticPattern,
  HapticPlayback,
  HapticPulse,
  HapticSource,
  VibrateFn,
} from './haptics/types.js';
export { detectWebVibration } from './haptics/web.js';
export type { KarplusOptions } from './instruments/karplus.js';
export { KarplusSynth } from './instruments/karplus.js';
export { DoubleBassSynth, MarimbaSynth, StringsSynth } from './instruments/low-and-strings.js';
export type { OrchestraEvent } from './instruments/orchestra.js';
export { OrganicOrchestra } from './instruments/orchestra.js';
export { BeatboxSynth, LatinPercussionSynth } from './instruments/percussion.js';
export { RhodesSynth } from './instruments/rhodes.js';
export type { BeatboxKind, InstrumentName, InstrumentNote, InstrumentVoice, PercussionKind, VoiceNodes } from './instruments/types.js';
export { AdaptiveMusicDirector } from './music/director.js';
export { FESTIVAL_PROFILES, festivalMusicId, festivalProfile, isThemedFestival, THEMED_FESTIVAL_IDS } from './music/festivals.js';
export type { ScheduledMusicVoice } from './music/note-synth.js';
export { MusicNoteSynth } from './music/note-synth.js';
export type { BarPattern, BarPatterns } from './music/patterns.js';
export { buildBarPatterns, midiToFrequency, noteFrequency, notesAt, STEPS_PER_BAR, swingDelay } from './music/patterns.js';
export {
  dominantStem,
  effectiveStemGain,
  STEM_DEFINITIONS,
  sortedStemsByGain,
  stemDefinition,
  stemGainAt,
  stemMix,
} from './music/stems.js';
export { deriveTension, PHASE_TENSION_WEIGHTS, smoothTension, tensionFromScore, tensionLabel } from './music/tension.js';
export type {
  AccentKind,
  FestivalId,
  FestivalProfile,
  InstrumentKind,
  MusicDirectorOptions,
  MusicDirectorStatus,
  MusicPhase,
  NoteEvent,
  StemDefinition,
  StemId,
  TensionInput,
  TensionSnapshot,
} from './music/types.js';
export { FESTIVAL_IDS, STEM_IDS } from './music/types.js';
export type { BinauralBand, BinauralBandSpec } from './output/binaural-layer.js';
// Banda sonora profesional multicanal
export { BINAURAL_BANDS, BinauralLayer } from './output/binaural-layer.js';
export type { ChannelStrip } from './output/channel-bank.js';
export { ChannelBank } from './output/channel-bank.js';
export { channelIndexForZone, MODE_LAYOUTS, outputStatus, resolveOutputMode, zonePan, zonePosition } from './output/layouts.js';
export { createWoodRoomImpulse, impulseRms } from './output/room-impulse.js';
export type { MultiChannelOptions } from './output/router.js';
export { MultiChannelRouter } from './output/router.js';
export type { StudioMasterOptions, StudioMasterStatus } from './output/studio-master.js';
export { StudioMasterBus } from './output/studio-master.js';
export type { InstrumentBus, InstrumentRoute, InstrumentTarget, LayoutDefinition, OutputMode, OutputStatus, ResolvedOutputMode, SpeakerZone } from './output/types.js';
export { SensorySession } from './session.js';
export type {
  SensoryEvent,
  SensoryPlayResult,
  SensorySessionOptions,
  SensorySessionStatus,
} from './session-types.js';
export type { HarmonicSfxKind, HarmonicSfxPlayback } from './soundtrack/harmonic-sfx.js';
export { chordToneMidis, HarmonicSfxPlayer, tuneSfxMidi } from './soundtrack/harmonic-sfx.js';
export type { ScoreSchedulerOptions } from './soundtrack/scheduler.js';
export { ScoreScheduler } from './soundtrack/scheduler.js';
export type { MusicEngineMode, SoundtrackControllerOptions } from './soundtrack/soundtrack-controller.js';
export { SoundtrackController } from './soundtrack/soundtrack-controller.js';
export { SoundtrackEngine } from './soundtrack/soundtrack-engine.js';
export { SpatialLayoutController } from './soundtrack/spatial-layout-controller.js';
export type { PlayerStateInput, SoundtrackOptions, SoundtrackStatus } from './soundtrack/types.js';
export type { TableStageSensoryCallbacks, TableStageSensoryOptions } from './table-bridge.js';
export { createTableSensoryHooks } from './table-bridge.js';
export type {
  AudioEngineState,
  AudioEngineStatus,
  SensoryPreferences,
  Vec3,
} from './types.js';
export {
  clamp,
  clamp01,
  DEFAULT_PREFERENCES,
  lerp,
  mergePreferences,
  normalizePreferences,
} from './types.js';
export type { HapticGesture, HapticPrimitive } from './version.js';
export { AUDIO_SAMPLE_RATE, HAPTIC_GESTURES, HAPTIC_PRIMITIVES, SENSORY_ENGINE_VERSION, SENSORY_FEATURES } from './version.js';
export { midiHz, VOCAL_FORMANTS, vocalFormants } from './vocal/formants.js';
export type { FormantSpec, VocalNote, VocalVoice, VocalVowel } from './vocal/types.js';
export type { VocalHumOptions } from './vocal/vocal-hum-synth.js';
export { VocalHumSynth } from './vocal/vocal-hum-synth.js';
