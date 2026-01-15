import { SportTierSystem } from "./types"

export const pickleballTiers: SportTierSystem = {
  sportName: "Pickleball",
  sportEmoji: "🏓",
  tiers: [
    {
      tierNumber: 1,
      skills: [
        { id: "pb-t1-1", name: "Ready position" },
        { id: "pb-t1-2", name: "Paddle parts and grip" },
        { id: "pb-t1-3", name: "Hand-eye coordination" },
        { id: "pb-t1-4", name: "Court orientation" },
      ],
    },
    {
      tierNumber: 2,
      skills: [
        { id: "pb-t2-1", name: "Forehand basics" },
        { id: "pb-t2-2", name: "Backhand basics" },
        { id: "pb-t2-3", name: "Underhand serve" },
        { id: "pb-t2-4", name: "Basic rules" },
      ],
    },
    {
      tierNumber: 3,
      skills: [
        { id: "pb-t3-1", name: "Split step" },
        { id: "pb-t3-2", name: "Footwork mechanics" },
        { id: "pb-t3-3", name: "Dink basics" },
        { id: "pb-t3-4", name: "Deep shots" },
      ],
    },
    {
      tierNumber: 4,
      skills: [
        { id: "pb-t4-1", name: "Intro volleys" },
        { id: "pb-t4-2", name: "Transition footwork" },
        { id: "pb-t4-3", name: "Game scoring" },
        { id: "pb-t4-4", name: "Kitchen rules" },
      ],
    },
    {
      tierNumber: 5,
      skills: [
        { id: "pb-t5-1", name: "Attacking play" },
        { id: "pb-t5-2", name: "Lobs and overheads" },
        { id: "pb-t5-3", name: "Down-the-line" },
        { id: "pb-t5-4", name: "Cross-court" },
      ],
    },
    {
      tierNumber: 6,
      skills: [
        { id: "pb-t6-1", name: "Serve and returns" },
        { id: "pb-t6-2", name: "Transitions" },
        { id: "pb-t6-3", name: "Sportsmanship" },
        { id: "pb-t6-4", name: "Leadership" },
      ],
    },
  ],
}
