import { SportTierSystem } from "./types"

export const volleyballTiers: SportTierSystem = {
  sportName: "Volleyball",
  sportEmoji: "🏐",
  tiers: [
    {
      tierNumber: 1,
      skills: [
        { id: "vb-t1-1", name: "Ready position" },
        { id: "vb-t1-2", name: "Passing & setting form" },
        { id: "vb-t1-3", name: "Motor coordination" },
        { id: "vb-t1-4", name: "Court orientation" },
      ],
    },
    {
      tierNumber: 2,
      skills: [
        { id: "vb-t2-1", name: "Passing & setting control" },
        { id: "vb-t2-2", name: "Serving basics" },
        { id: "vb-t2-3", name: "Basic rules" },
        { id: "vb-t2-4", name: '"Mine!"' },
      ],
    },
    {
      tierNumber: 3,
      skills: [
        { id: "vb-t3-1", name: "Serve Receive" },
        { id: "vb-t3-2", name: "Free-ball transitions" },
        { id: "vb-t3-3", name: "Attacking approach" },
        { id: "vb-t3-4", name: "Footwork coordination" },
      ],
    },
    {
      tierNumber: 4,
      skills: [
        { id: "vb-t4-1", name: "3-touch flow" },
        { id: "vb-t4-2", name: "Intro overhands" },
        { id: "vb-t4-3", name: "Consistent pass" },
        { id: "vb-t4-4", name: "Game scoring awareness" },
      ],
    },
    {
      tierNumber: 5,
      skills: [
        { id: "vb-t5-1", name: "Hitting power" },
        { id: "vb-t5-2", name: "Defensive play" },
        { id: "vb-t5-3", name: "Coverage & tips" },
        { id: "vb-t5-4", name: "Game strategy" },
      ],
    },
    {
      tierNumber: 6,
      skills: [
        { id: "vb-t6-1", name: "Setting combinations" },
        { id: "vb-t6-2", name: "Serve consistency" },
        { id: "vb-t6-3", name: "Offensive play" },
        { id: "vb-t6-4", name: "Leadership" },
      ],
    },
  ],
}
