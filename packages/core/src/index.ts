// Motor universal

export type { BotLevel } from './ai/types.js';
// Bots
export { BOT_LEVELS, chooseBest } from './ai/types.js';
// Catálogo
export { findGameMeta, GAME_CATALOG, gamesByFamily } from './catalog.js';
export { canonicalJson } from './economy/canonical.js';
export type { MissionClaim } from './economy/claims.js';
export { claimableMissions, claimMission } from './economy/claims.js';
export { hmacSha256Hex, timingSafeEqualHex } from './economy/crypto/hmac.js';
export { sha256Hex } from './economy/crypto/sha256.js';
// Economía de largo plazo
export { addDays, dayKey, previousDay, weekKey } from './economy/date.js';
export {
  advanceMission,
  createDailyMissions,
  createWeeklyMission,
  DAILY_TEMPLATES,
  isMissionClaimable,
  WEEKLY_TEMPLATES,
} from './economy/missions.js';
export {
  createProfile,
  LEVEL_UP_CHIPS,
  normalizeProfile,
  PROFILE_VERSION,
  STARTING_CHIPS,
} from './economy/profile.js';
export type { LevelInfo, ProfileProgress } from './economy/progression.js';
export {
  grantXp,
  levelFromXp,
  profileProgress,
  RANKS,
  rankForLevel,
  totalXpForLevel,
  xpForLevel,
} from './economy/progression.js';
export { applyMatch, baseMatchReward, DAILY_CHIP_CAP, DAILY_XP_CAP } from './economy/rewards.js';
export type { SignedSave } from './economy/save.js';
export {
  decodeSignedSave,
  encodeSignedSave,
  signProfile,
  verifySignedSave,
} from './economy/save.js';
export { equipCosmetic, findCosmetic, ownedCosmetics, purchaseCosmetic, SHOP_ITEMS } from './economy/shop.js';
export type { StreakClaim } from './economy/streak.js';
export { claimDailyStreak } from './economy/streak.js';
export type {
  CosmeticCategory,
  CosmeticItem,
  CosmeticRarity,
  DailyMissions,
  DailyProgress,
  MatchApplication,
  MatchOutcomeInput,
  MatchReward,
  Mission,
  MissionKind,
  PlayerProfile,
  PlayerStats,
  RankId,
  StreakState,
  WeeklyMissionState,
} from './economy/types.js';
export { actionKey, sameAction } from './engine/action-key.js';
export { IllegalActionError, InvalidConfigError } from './engine/errors.js';
export type { Rng } from './engine/rng.js';
export { createRng } from './engine/rng.js';
export type { ActionChooser, PlayReport } from './engine/runtime.js';
export { act, playToEnd } from './engine/runtime.js';
export type {
  BotPolicy,
  GameConfig,
  GameFamily,
  GameMeta,
  GameMode,
  GameOptions,
  GameResult,
  IGameModule,
  PlayerConfig,
  PlayerId,
} from './engine/types.js';
export { chooseBlackjackAction } from './games/blackjack/ai.js';
export { legalBlackjackActions } from './games/blackjack/flow.js';// Blackjack 21
export { BLACKJACK_META, blackjackModule } from './games/blackjack/module.js';
export { blackjackResult } from './games/blackjack/rules.js';
export { createBlackjackState } from './games/blackjack/setup.js';
export type {
  BlackjackAction,
  BlackjackPhase,
  BlackjackPlayer,
  BlackjackState,
  HandOutcome,
  HandStatus,
} from './games/blackjack/types.js';
export type { BlackjackView } from './games/blackjack/view.js';
export { chooseCaidaAction } from './games/caida/ai.js';
export { detectHandCanto } from './games/caida/cantos.js';
// Caída Venezolana
export { CAIDA_META, caidaModule } from './games/caida/module.js';
export { caidaResult, legalCaidaActions } from './games/caida/rules.js';
export { createCaidaState } from './games/caida/setup.js';
export type {
  CaidaAction,
  CaidaCanto,
  CaidaCantoKind,
  CaidaPhase,
  CaidaPlayer,
  CaidaRoundSummary,
  CaidaState,
} from './games/caida/types.js';
export type { CaidaView } from './games/caida/view.js';
export { chooseChessAction } from './games/chess/ai.js';
// Ajedrez de Club
export { CHESS_META, chessModule } from './games/chess/module.js';
export { chessResult, legalChessActions } from './games/chess/rules.js';
export { createChessState } from './games/chess/setup.js';
export type {
  ChessAction,
  ChessColor,
  ChessKind,
  ChessMove,
  ChessPiece,
  ChessPlayer,
  ChessPromotion,
  ChessState,
  ChessView,
} from './games/chess/types.js';
export { chooseColorsAction } from './games/colores/ai.js';
// Cartas de Colores
export { COLORS_META, colorsModule } from './games/colores/module.js';
export { colorsResult, legalColorsActions } from './games/colores/rules.js';
export { createColorsState } from './games/colores/setup.js';
export type {
  ColorsAction,
  ColorsCard,
  ColorsColor,
  ColorsPhase,
  ColorsPlayer,
  ColorsRoundSummary,
  ColorsState,
  ColorsSymbol,
} from './games/colores/types.js';
export { COLORS } from './games/colores/types.js';
export type { ColorsView } from './games/colores/view.js';
export { chooseDominoAction } from './games/domino/ai.js';
// Dominó Venezolano
export { DOMINO_META, dominoModule } from './games/domino/module.js';
export { dominoResult, legalDominoActions } from './games/domino/rules.js';
export { createDominoState } from './games/domino/setup.js';
export { createDominoSet, tilePips } from './games/domino/tiles.js';
export type {
  DominoAction,
  DominoMode,
  DominoPhase,
  DominoPlacement,
  DominoPlayer,
  DominoRoundSummary,
  DominoState,
} from './games/domino/types.js';
export type { DominoView } from './games/domino/view.js';
export type { GameId, GameSummary } from './version.js';
export { CORE_VERSION } from './version.js';
