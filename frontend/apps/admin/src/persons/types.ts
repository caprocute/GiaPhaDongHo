export type Gender = "M" | "F" | "U";
export type LifeStatus = "alive" | "deceased";
export type Privacy = "public" | "members" | "private";

export interface PersonRecord {
  id: string;
  code: string;
  fullName: string;
  tenHuy?: string;
  gender: Gender;
  lifeStatus: LifeStatus;
  generation?: number;
  /** ISO date yyyy-mm-dd */
  birthSolar?: string;
  deathSolar?: string;
  privacy: Privacy;
  notes?: string;
}
