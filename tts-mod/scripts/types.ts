// Card data types from cards.json
export interface Card {
  id: string;
  number: number;
  sort_by: number;
  name: string;
  variant: string;
  illustrators?: string[];
  rarity?: string;
  set_ids: string[];
  type?: string;
  cost?: Array<{ total: string; aura: string }>;
  lp?: string;
  traits?: string[];
  terra?: Array<{ attack: string; icon: string; lp: string }>;
  metadata?: {
    discovered?: string;
    gps?: string;
    weight?: string;
    height?: string;
    length?: string;
  };
  effect?: string;
  zoo_attack?: Array<{
    name: string;
    status?: string[];
    multiplier?: string;
    damage?: string;
    bonus?: string;
    effect?: string;
  }>;
  description?: string;
  image: string;
  thumb: string;
  limit?: number;
  strength?: Array<{ type?: string[]; value?: string }>;
}

export interface SetInfo {
  id: string;
  series_short_name: string;
  short_name: string;
  name: string;
  card_back: {
    url: string;
    text?: string;
    illustrator?: string;
  };
  total_cards_count: number;
}

// TTS JSON types
export interface TTSTransform {
  posX: number;
  posY: number;
  posZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
}

export interface TTSColor {
  r: number;
  g: number;
  b: number;
}

export interface CustomDeckConfig {
  FaceURL: string;
  BackURL: string;
  NumWidth: number;
  NumHeight: number;
  BackIsHidden: boolean;
  UniqueBack: boolean;
  Type: number;
}

export interface TTSCard {
  GUID: string;
  Name: string;
  Transform: TTSTransform;
  Nickname: string;
  Description: string;
  GMNotes: string;
  AltLookAngle?: TTSTransform;
  ColorDiffuse: TTSColor;
  LayoutGroupSortIndex: number;
  Value: number;
  Locked: boolean;
  Grid: boolean;
  Snap: boolean;
  IgnoreFoW: boolean;
  MeasureMovement: boolean;
  DragSelectable: boolean;
  Autoraise: boolean;
  Sticky: boolean;
  Tooltip: boolean;
  GridProjection: boolean;
  HideWhenFaceDown: boolean;
  Hands: boolean;
  CardID: number;
  SidewaysCard: boolean;
  CustomDeck: Record<string, CustomDeckConfig>;
  LuaScript: string;
  LuaScriptState: string;
  XmlUI: string;
}

export interface TTSDeck {
  GUID: string;
  Name: string;
  Transform: TTSTransform;
  Nickname: string;
  Description: string;
  GMNotes: string;
  AltLookAngle?: TTSTransform;
  ColorDiffuse: TTSColor;
  LayoutGroupSortIndex: number;
  Value: number;
  Locked: boolean;
  Grid: boolean;
  Snap: boolean;
  IgnoreFoW: boolean;
  MeasureMovement: boolean;
  DragSelectable: boolean;
  Autoraise: boolean;
  Sticky: boolean;
  Tooltip: boolean;
  GridProjection: boolean;
  HideWhenFaceDown: boolean;
  Hands: boolean;
  SidewaysCard: boolean;
  DeckIDs: number[];
  CustomDeck: Record<string, CustomDeckConfig>;
  ContainedObjects: TTSCard[];
  LuaScript: string;
  LuaScriptState: string;
  XmlUI: string;
}

export interface TTSSaveFile {
  SaveName: string;
  GameMode: string;
  Date: string;
  VersionNumber: string;
  GameType: string;
  GameComplexity: string;
  Tags: string[];
  Gravity: number;
  PlayArea: number;
  Table: string;
  Sky: string;
  Note: string;
  TabStates: Record<string, unknown>;
  LuaScript: string;
  LuaScriptState: string;
  XmlUI: string;
  ObjectStates: TTSDeck[];
}
