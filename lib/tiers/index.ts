import { SportTierSystem } from "./types"
import { volleyballTiers } from "./volleyball"
import { tennisTiers } from "./tennis"
import { pickleballTiers } from "./pickleball"

// Export types
export * from "./types"

// Sport tier systems registry
const tierSystems: Record<string, SportTierSystem> = {
  volleyball: volleyballTiers,
  tennis: tennisTiers,
  pickleball: pickleballTiers,
}

/**
 * Get tier system configuration for a specific sport
 * @param sportName - Name of the sport (case-insensitive)
 * @returns SportTierSystem or null if sport not found
 */
export function getTierSystemBySport(sportName: string): SportTierSystem | null {
  const normalizedName = sportName.toLowerCase().trim()
  return tierSystems[normalizedName] || null
}

/**
 * Get all available sports with tier systems
 * @returns Array of available sport names
 */
export function getAvailableSports(): string[] {
  return Object.keys(tierSystems)
}

/**
 * Check if a sport has a tier system configured
 * @param sportName - Name of the sport
 * @returns boolean
 */
export function hasTierSystem(sportName: string): boolean {
  const normalizedName = sportName.toLowerCase().trim()
  return normalizedName in tierSystems
}
