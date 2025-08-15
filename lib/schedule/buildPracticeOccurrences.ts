// Shared utility for calculating practice occurrences
// Used by both UI (Team Details) and email templates to ensure consistency

export interface PracticeOccurrence {
  id: string;
  date: Date;
  dayOfWeek: string;
  time: string;
  duration: string;
  location: string;
  coachName: string;
  formattedDate: string;
  formattedDateES: string; // Spanish format for emails
}

export interface PracticeScheduleParams {
  startDate: string;
  endDate: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  location: string;
  coachName: string;
  timezone?: string;
  exceptions?: string[]; // ISO date strings to exclude
}

// Default timezone for Miami, FL
const DEFAULT_TIMEZONE = 'America/New_York';

// Helper function to calculate duration between two times
function calculateDuration(startTime: string, endTime: string): string {
  try {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + (startMin || 0);
    const endMinutes = endHour * 60 + (endMin || 0);
    
    const durationMinutes = endMinutes - startMinutes;
    
    if (durationMinutes <= 0) return '1.5 hours';
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}.${Math.round((minutes / 60) * 10)} hours`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minutes`;
    }
  } catch (error) {
    return '1.5 hours';
  }
}

// Main function to build practice occurrences (matches existing logic)
export function buildPracticeOccurrences(params: PracticeScheduleParams): PracticeOccurrence[] {
  try {
    const {
      startDate,
      endDate,
      daysOfWeek,
      startTime,
      endTime,
      location,
      coachName,
      timezone = DEFAULT_TIMEZONE,
      exceptions = []
    } = params;

    if (
      !startDate ||
      !endDate ||
      !Array.isArray(daysOfWeek) ||
      daysOfWeek.length === 0
    ) {
      return [];
    }

    // Pre-calculate time string and duration
    const timeString = `${startTime || "3:00 PM"} - ${endTime || "4:30 PM"}`;
    const durationString = calculateDuration(startTime, endTime);
    const locationString = location || "TBD";
    const coachNameString = coachName || "TBD";

    const dayMap: { [key: string]: number } = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const targetDays = daysOfWeek
      .map((day) => dayMap[day.trim()])
      .filter((day) => day !== undefined);

    if (targetDays.length === 0) {
      return [];
    }

    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T23:59:59");
    const exceptionsSet = new Set(exceptions);
    
    const sessions: PracticeOccurrence[] = [];
    const currentDate = new Date(start);
    let sessionCounter = 0;
    const maxSessions = Math.min(
      50,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7))
    );

    while (currentDate <= end && sessionCounter < maxSessions) {
      const dayOfWeek = currentDate.getDay();
      const currentDateISO = currentDate.toISOString().split("T")[0];

      if (targetDays.includes(dayOfWeek) && !exceptionsSet.has(currentDateISO)) {
        const dayName =
          Object.keys(dayMap).find((key) => dayMap[key] === dayOfWeek) ||
          "Unknown";

        // Format for English (Team Details UI)
        const formattedDate = currentDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        // Format for English (Email) - Miami timezone
        const formattedDateES = currentDate.toLocaleDateString("en-US", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
          timeZone: timezone
        });

        sessions.push({
          id: `session-${sessionCounter++}-${currentDateISO}`,
          date: new Date(currentDate),
          dayOfWeek: dayName,
          time: timeString,
          duration: durationString,
          location: locationString,
          coachName: coachNameString,
          formattedDate,
          formattedDateES,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return sessions;
  } catch (error) {
    console.error(
      "[PRACTICE_OCCURRENCES] ❌ Error calculating practice occurrences:",
      error
    );
    return [];
  }
}

// Helper function to format time in English
export function formatTimeES(timeString: string): string {
  try {
    const [startTime, endTime] = timeString.split(' - ');
    
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const min = minutes || '00';
      
      if (hour === 0) return `12:${min} AM`;
      if (hour < 12) return `${hour}:${min} AM`;
      if (hour === 12) return `12:${min} PM`;
      return `${hour - 12}:${min} PM`;
    };

    return `${formatTime(startTime)} – ${formatTime(endTime)}`;
  } catch (error) {
    return timeString;
  }
}

// Function to format a complete practice occurrence for email
export function formatPracticeOccurrenceForEmail(
  occurrence: PracticeOccurrence,
  timezone: string = DEFAULT_TIMEZONE
): string {
  const timeFormatted = formatTimeES(occurrence.time);
  return `${occurrence.formattedDateES} · ${timeFormatted}`;
}
