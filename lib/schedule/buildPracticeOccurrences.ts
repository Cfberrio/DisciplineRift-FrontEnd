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

// Default timezone for Miami, FL (Eastern Time Zone)
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

    // Parse dates using explicit timezone handling to avoid date shifting
    // Split the date string and create Date objects more explicitly
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    
    // Create dates in Miami timezone (Eastern Time) to avoid timezone conversion issues
    // Using 12:00 PM to ensure we're in the middle of the day and avoid edge cases
    const start = new Date();
    start.setFullYear(startYear, startMonth - 1, startDay);
    start.setHours(12, 0, 0, 0); // Set to noon to avoid timezone edge cases
    
    const end = new Date();
    end.setFullYear(endYear, endMonth - 1, endDay);
    end.setHours(12, 0, 0, 0); // Set to noon to avoid timezone edge cases
    const exceptionsSet = new Set(exceptions);
    
    // NEW LOGIC: Find the first occurrence that matches the desired days
    // If startDate doesn't match the target day, look backward first
    const actualStartDate = new Date(start);
    const currentDayOfWeek = actualStartDate.getDay();
    
    // Check if the start date matches any of the target days
    const isStartDateValid = targetDays.includes(currentDayOfWeek);
    
    if (!isStartDateValid) {
      // Look backward up to 7 days to find a matching day
      let foundValidStart = false;
      for (let i = 1; i <= 7; i++) {
        const testDate = new Date(start);
        testDate.setDate(testDate.getDate() - i);
        
        if (targetDays.includes(testDate.getDay())) {
          actualStartDate.setDate(actualStartDate.getDate() - i);
          foundValidStart = true;
          console.log(`[PRACTICE_OCCURRENCES] 🔄 Adjusted start date from ${startDate} to ${actualStartDate.getFullYear()}-${String(actualStartDate.getMonth() + 1).padStart(2, '0')}-${String(actualStartDate.getDate()).padStart(2, '0')} to match ${daysOfWeek.join(', ')}`);
          break;
        }
      }
      
      // If no valid day found backward, look forward (original behavior)
      if (!foundValidStart) {
        for (let i = 1; i <= 7; i++) {
          const testDate = new Date(start);
          testDate.setDate(testDate.getDate() + i);
          
          if (targetDays.includes(testDate.getDay())) {
            actualStartDate.setDate(actualStartDate.getDate() + i);
            console.log(`[PRACTICE_OCCURRENCES] ⏭️ Adjusted start date forward from ${startDate} to ${actualStartDate.getFullYear()}-${String(actualStartDate.getMonth() + 1).padStart(2, '0')}-${String(actualStartDate.getDate()).padStart(2, '0')} to match ${daysOfWeek.join(', ')}`);
            break;
          }
        }
      }
    }
    
    const sessions: PracticeOccurrence[] = [];
    const currentDate = new Date(actualStartDate);
    currentDate.setHours(12, 0, 0, 0); // Ensure time is set to noon to avoid timezone issues
    let sessionCounter = 0;
    
    // Calculate max sessions more accurately
    // Get total days in range and calculate potential sessions
    const totalDays = Math.ceil((end.getTime() - actualStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1; // +1 to include end date
    const potentialSessions = Math.ceil(totalDays / 7) * targetDays.length + 2; // Add buffer for edge cases
    const maxSessions = Math.min(50, potentialSessions);

    while (currentDate <= end && sessionCounter < maxSessions) {
      const dayOfWeek = currentDate.getDay();
      // Create ISO date string manually to ensure consistency
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const currentDateISO = `${year}-${month}-${day}`;

      if (targetDays.includes(dayOfWeek) && !exceptionsSet.has(currentDateISO)) {
        const dayName =
          Object.keys(dayMap).find((key) => dayMap[key] === dayOfWeek) ||
          "Unknown";

        // Format for English (Team Details UI) - Use Miami timezone (Eastern Time)
        const formattedDate = new Intl.DateTimeFormat("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "America/New_York"
        }).format(currentDate);

        // Format for English (Email) - Use Miami timezone (Eastern Time) with consistent date
        const formattedDateES = new Intl.DateTimeFormat("en-US", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
          timeZone: "America/New_York"
        }).format(currentDate);

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
