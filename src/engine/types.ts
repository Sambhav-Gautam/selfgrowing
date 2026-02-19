export type ID = string;

export interface Person {
  id: ID;
  name: string;
  age: number; // in years (approx) or weeks
  isAlive: boolean;
  gender: 'male' | 'female';
  locationId: ID;
  stats: {
    wealth: number;
    influence: number;
    reputation: number;
  };
  relationships: Record<ID, Relationship>;
  needs: {
    food: number;
    safety: number;
    status: number;
  };
}

export interface Relationship {
  targetId: ID;
  type: 'trust' | 'hate' | 'fear' | 'family';
  value: number; // -100 to 100, where 0 is neutral
}

export interface Location {
  id: ID;
  name: string;
  description: string;
  connections: ID[]; // Connected Location IDs
  coordinates: { x: number; y: number; z: number };
}

export interface Institution {
  id: ID;
  name: string;
  type: 'government' | 'religion' | 'military' | 'guild';
  roles: Role[];
}

export interface Role {
  id: ID;
  name: string;
  power: number; // Level of influence this role grants
  holderId: ID | null;
}

export interface WorldState {
  people: Record<ID, Person>;
  locations: Record<ID, Location>;
  institutions: Record<ID, Institution>;
  time: {
    year: number;
    week: number;
  };
  events: GameEvent[];
}

export interface GameEvent {
  id: ID;
  type: string;
  description: string;
  date: { year: number; week: number };
  involvedIds: ID[];
}
