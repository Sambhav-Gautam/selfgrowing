// Basic Identifiers
export type ID = string;

// The Grid World
export type CellType = 'grass' | 'road' | 'water' | 'wall' | 'stone' | 'sand' | 'forest';

export interface GridCell {
  x: number;
  y: number;
  type: CellType;
  ownerId?: ID; // Person or Government/Institution
  buildingId?: ID;
}

export interface Building {
  id: ID;
  type: 'house' | 'school' | 'hospital' | 'jail' | 'farm' | 'shop' | 'police_station' | 'government' | 'commercial' | 'park';
  x: number;
  y: number;
  ownerId?: ID;
  employees: ID[];
  level: number;
}

// Agents
export type Gender = 'male' | 'female';

export interface Person {
  id: ID;
  name: string;
  age: number;
  yearBorn: number; // For tracking exact age
  isAlive: boolean;
  gender: Gender;

  // Position & Motion
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  state: 'idle' | 'moving' | 'working' | 'sleeping' | 'protesting' | 'imprisoned';

  // Stats
  stats: {
    wealth: number;
    influence: number; // 0-100
    reputation: number; // -100 to 100
    happiness: number; // 0-100
    crimePropensity: number; // 0-100
    fertility: number; // 0-100
  };

  // Needs (0-100, 0 is critical)
  needs: {
    food: number;
    safety: number;
    social: number;
    rest: number;
  };

  // Relationships (Adjacency List simplified)
  relationships: Record<ID, Relationship>;

  // Family
  parents: ID[];
  children: ID[];
  partner?: ID;

  // Economy
  job?: Job;
  residenceId?: ID;

  // Visuals & Genetics
  visuals: VisualTraits;
}

export interface Job {
  title: 'Farmer' | 'Guard' | 'Laborer' | 'Merchant' | 'Unemployed';
  salary: number; // Daily
  employerId?: ID; // Building or Govt
  buildingId?: ID;
}

export interface VisualTraits {
  skinColor: string; // Hex
  hairColor: string; // Hex
  height: number; // 0.8 - 1.2 multiplier
  bodyType: 'thin' | 'average' | 'stocky';
}

export interface Relationship {
  targetId: ID;
  type: 'friend' | 'enemy' | 'family' | 'partner';
  value: number; // -100 to 100
}

// World State
export interface WorldState {
  people: Record<ID, Person>;
  grid: GridCell[][]; // 200x200 grid
  buildings: Record<ID, Building>;
  institutions: Record<ID, Institution>;
  time: {
    year: number;
    week: number;
    day: number;
    hour: number;
    isNight: boolean;
  };
  weather: 'clear' | 'rain' | 'snow';
  events: GameEvent[];

  // Global Stats
  lists: {
    govtFunds: number;
    taxRate: number;
  };
}

export interface SystemContext {
  isNewDay: boolean;
  isNewWeek: boolean;
  isNewYear: boolean;
}

export interface Institution {
  id: ID;
  name: string;
  type: 'government' | 'religion' | 'business';
  leaderId?: ID;
  members: ID[];
}

export interface GameEvent {
  id: ID;
  type: 'birth' | 'death' | 'attack' | 'socialize' | 'construction' | 'protest' | 'arrest';
  description: string;
  date: { year: number, week: number };
  involvedIds: ID[];
  location?: { x: number, y: number };
}
