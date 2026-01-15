import { SportTierSystem } from "./types"

export const tennisTiers: SportTierSystem = {
  sportName: "Tennis",
  sportEmoji: "🎾",
  tiers: [
    {
      tierNumber: 1,
      skills: [
        { id: "tn-t1-1", name: "Ready position" },
        { id: "tn-t1-2", name: "Motor coordination" },
        { id: "tn-t1-3", name: "Court orientation" },
        { id: "tn-t1-4", name: "Racket parts and grip" },
      ],
    },
    {
      tierNumber: 2,
      skills: [
        { id: "tn-t2-1", name: "Split step" },
        { id: "tn-t2-2", name: "Forehand basics" },
        { id: "tn-t2-3", name: "Backhand basics" },
        { id: "tn-t2-4", name: "Intro targeting" },
      ],
    },
    {
      tierNumber: 3,
      skills: [
        { id: "tn-t3-1", name: "Footwork and recovery" },
        { id: "tn-t3-2", name: "Directional control" },
        { id: "tn-t3-3", name: "Timing & rhythm" },
        { id: "tn-t3-4", name: "Volley basics" },
      ],
    },
    {
      tierNumber: 4,
      skills: [
        { id: "tn-t4-1", name: "Underhand serves" },
        { id: "tn-t4-2", name: "Match etiquette" },
        { id: "tn-t4-3", name: "Scoring basics" },
        { id: "tn-t4-4", name: "Return form" },
      ],
    },
    {
      tierNumber: 5,
      skills: [
        { id: "tn-t5-1", name: "Overhand serves" },
        { id: "tn-t5-2", name: "Serve and returns" },
        { id: "tn-t5-3", name: "Approach shots" },
        { id: "tn-t5-4", name: "Down-the-line" },
        { id: "tn-t5-5", name: "Cross-court" },
      ],
    },
    {
      tierNumber: 6,
      skills: [
        { id: "tn-t6-1", name: "Serve and returns" },
        { id: "tn-t6-2", name: "Rally patterns" },
        { id: "tn-t6-3", name: "Sportsmanship" },
        { id: "tn-t6-4", name: "Leadership" },
      ],
    },
  ],
}
