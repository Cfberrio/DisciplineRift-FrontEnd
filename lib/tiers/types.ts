// Tier System Types for Sport Profiles

export interface TierSkill {
  id: string
  name: string
  description?: string
}

export interface Tier {
  tierNumber: number
  tierName?: string
  skills: TierSkill[]
}

export interface SportTierSystem {
  sportName: string
  sportEmoji: string
  tiers: Tier[]
}

export type SkillStatus = "Not Started" | "Developing" | "Consistent"

export interface SkillWithStatus extends TierSkill {
  status: SkillStatus
  tierNumber: number
}
