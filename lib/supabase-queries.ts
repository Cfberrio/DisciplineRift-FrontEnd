import { supabase } from "@/lib/supabase";
import type { Team, School } from "./supabase";
import { buildPracticeOccurrences } from "./schedule/buildPracticeOccurrences";

export async function getSchools() {
  try {
    const { data, error } = await supabase
      .from("school")
      .select("*")
      .order("name");

    if (error) {
      throw new Error(`Error fetching schools: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    throw error;
  }
}

export async function searchSchools(query: string) {
  try {
    if (!query.trim()) {
      return [];
    }

    const { data, error } = await supabase
      .from("school")
      .select("*")
      .ilike("name", `%${query}%`)
      .order("name")
      .limit(10);

    if (error) {
      throw new Error(`Error searching schools: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    throw error;
  }
}

export async function getTeamsBySchool(schoolId: string) {
  try {
    const { data, error } = await supabase
      .from("team")
      .select(
        `
        *,
        school:schoolid (
          schoolid,
          name,
          location
        ),
        session (
          sessionid,
          startdate,
          enddate,
          starttime,
          endtime,
          daysofweek,
          repeat,
          coachid,
          cancel,
          staff:coachid (
            id,
            name,
            email,
            phone
          )
        )
      `
      )
      .eq("schoolid", schoolId)
      .eq("isactive", true)
      .eq("isongoing", true)
      .order("name");

    if (error) {
      throw new Error(`Error fetching teams: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    throw error;
  }
}

export async function getAllTeams() {
  try {
    const { data, error } = await supabase
      .from("team")
      .select(
        `
        *,
        school:schoolid (
          schoolid,
          name,
          location
        ),
        session (
          sessionid,
          startdate,
          enddate,
          starttime,
          endtime,
          daysofweek,
          repeat,
          coachid,
          cancel,
          staff:coachid (
            id,
            name,
            email,
            phone
          )
        )
      `
      )
      .eq("isactive", true)
      .eq("isongoing", true)
      .order("name");

    if (error) {
      throw new Error(`Error fetching teams: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    throw error;
  }
}

export async function getAllSchoolsTeamsAndSessions(): Promise<{
  schools: Array<School & { teams: Team[] }>;
}> {
  try {
    console.log(
      "[QUERY] 🔄 Starting optimized getAllSchoolsTeamsAndSessions..."
    );

    // Step 1: Get only active schools with basic info
    const { data: schools, error: schoolsError } = await supabase
      .from("school")
      .select("schoolid, name, location")
      .order("name");

    if (schoolsError) {
      console.error("[QUERY] ❌ Error fetching schools:", schoolsError);
      throw new Error(`Database query failed: ${schoolsError.message}`);
    }

    if (!schools || schools.length === 0) {
      console.warn("[QUERY] ⚠️ No schools found in database");
      return { schools: [] };
    }

    console.log(`[QUERY] ✅ Found ${schools.length} schools`);

    // Step 2: Get only active AND ongoing teams with basic info
    const { data: teams, error: teamsError } = await supabase
      .from("team")
      .select(
        `
        teamid,
        schoolid,
        name,
        description,
        price,
        participants,
        isactive,
        isongoing,
        created_at,
        updated_at
      `
      )
      .eq("isactive", true)
      .eq("isongoing", true)
      .order("name");

    if (teamsError) {
      console.error("[QUERY] ❌ Error fetching teams:", teamsError);
      throw new Error(`Database query failed: ${teamsError.message}`);
    }

    console.log(`[QUERY] ✅ Found ${teams?.length || 0} active teams`);

    // Step 2.5: Get enrollment counts for all teams
    const teamIds = teams?.map((team) => team.teamid) || [];
    let enrollmentCounts: Map<string, number> = new Map();

    if (teamIds.length > 0) {
      const { data: enrollments, error: enrollmentError } = await supabase
        .from("enrollment")
        .select("teamid")
        .in("teamid", teamIds)
        .eq("isactive", true);

      if (!enrollmentError && enrollments) {
        // Count enrollments per team
        enrollments.forEach((enrollment) => {
          const currentCount = enrollmentCounts.get(enrollment.teamid) || 0;
          enrollmentCounts.set(enrollment.teamid, currentCount + 1);
        });
        console.log(`[QUERY] ✅ Counted enrollments for ${enrollmentCounts.size} teams`);
      }
    }

    // Step 3: Get sessions for active teams only
    let sessions: any[] = [];

    if (teamIds.length > 0) {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("session")
        .select(
          `
          sessionid,
          teamid,
          startdate,
          enddate,
          starttime,
          endtime,
          daysofweek,
          repeat,
          coachid,
          cancel
        `
        )
        .in("teamid", teamIds);

      if (!sessionsError && sessionsData) {
        sessions = sessionsData;
        console.log(`[QUERY] ✅ Found ${sessions.length} sessions`);
      }
    }

    // Step 4: Get coach data for sessions that have coaches
    const coachIds = [
      ...new Set(sessions.map((session) => session.coachid).filter(Boolean)),
    ];
    let coachData: any[] = [];

    if (coachIds.length > 0) {
      const { data: coaches, error: coachError } = await supabase
        .from("staff")
        .select("id, name, email, phone")
        .in("id", coachIds);

      if (!coachError && coaches) {
        coachData = coaches;
        console.log(`[QUERY] ✅ Found ${coaches.length} coaches`);
      }
    }

    const coachMap = new Map(coachData.map((coach) => [coach.id, coach]));

    // Step 5: Efficiently process and combine data
    const schoolMap = new Map(
      schools.map((school) => [school.schoolid, school])
    );
    const teamMap = new Map(teams?.map((team) => [team.teamid, team]) || []);
    const sessionMap = new Map();

    // Group sessions by team
    sessions.forEach((session) => {
      if (!sessionMap.has(session.teamid)) {
        sessionMap.set(session.teamid, []);
      }
      sessionMap.get(session.teamid).push(session);
    });

    // Build optimized result
    const filteredSchools = schools
      .map((school) => {
        // Get teams for this school
        const schoolTeams =
          teams?.filter((team) => team.schoolid === school.schoolid) || [];

        const teamsWithSessions = schoolTeams.map((team) => {
          const teamSessions = sessionMap.get(team.teamid) || [];

          const sessionsWithCoachInfo = teamSessions.map((session: any) => {
            const coachInfo = coachMap.get(session.coachid);

            // Parse days of week efficiently
            let parsedDaysOfWeek: string[] = [];
            try {
              if (typeof session.daysofweek === "string") {
                const rawValue = session.daysofweek.trim();
                if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
                  const innerContent = rawValue.slice(1, -1);
                  if (innerContent.trim()) {
                    parsedDaysOfWeek = innerContent
                      .split(",")
                      .map((day: string) => day.trim().replace(/['"]/g, ""))
                      .filter((day: string) => day.length > 0);
                  }
                } else if (rawValue.includes(",")) {
                  parsedDaysOfWeek = rawValue
                    .split(",")
                    .map((day: string) => day.trim());
                } else if (rawValue.length > 0) {
                  parsedDaysOfWeek = [rawValue];
                }
              } else if (Array.isArray(session.daysofweek)) {
                parsedDaysOfWeek = session.daysofweek;
              }
            } catch (parseError) {
              console.warn(
                "[QUERY] ⚠️ Error parsing days of week:",
                parseError
              );
              parsedDaysOfWeek = ["Monday", "Wednesday", "Friday"];
            }

            // Parse canceled dates from the cancel field
            let canceledDates: string[] = [];
            try {
              if (session.cancel && typeof session.cancel === 'string' && session.cancel.trim()) {
                // Handle different formats: JSON array, comma-separated, or single date
                const cancelString = session.cancel.trim();
                if (cancelString.startsWith('[') && cancelString.endsWith(']')) {
                  // JSON array format: ["2024-01-15", "2024-01-22"]
                  canceledDates = JSON.parse(cancelString);
                } else if (cancelString.includes(',')) {
                  // Comma-separated format: "2024-01-15,2024-01-22"
                  canceledDates = cancelString.split(',').map(date => date.trim()).filter(date => date.length > 0);
                } else {
                  // Single date format: "2024-01-15"
                  canceledDates = [cancelString];
                }
                console.log(`[QUERY] ✅ Found ${canceledDates.length} canceled dates for session ${session.sessionid}:`, canceledDates);
              }
            } catch (parseError) {
              console.warn(`[QUERY] ⚠️ Error parsing canceled dates for session ${session.sessionid}:`, parseError);
              canceledDates = [];
            }

            // Calculate individual sessions using shared utility
            const individualSessions = buildPracticeOccurrences({
              startDate: session.startdate,
              endDate: session.enddate,
              daysOfWeek: parsedDaysOfWeek,
              startTime: session.starttime,
              endTime: session.endtime,
              location: school.location,
              coachName: coachInfo?.name || "TBD",
              canceledDates: canceledDates
            });

            return {
              ...session,
              staff: coachInfo || {
                id: session.coachid,
                name: "TBD",
                email: "",
                phone: "",
              },
              parsedDaysOfWeek: parsedDaysOfWeek,
              individualSessions: individualSessions,
            };
          });

          return {
            ...team,
            session: sessionsWithCoachInfo,
            currentEnrollments: enrollmentCounts.get(team.teamid) || 0,
          };
        });

        return {
          schoolid: school.schoolid,
          name: school.name,
          location: school.location,
          teams: teamsWithSessions,
        };
      })
      .filter((school) => school.teams.length > 0);

    console.log(
      `[QUERY] ✅ Processed ${filteredSchools.length} schools with active teams`
    );

    return {
      schools: filteredSchools,
    };
  } catch (error) {
    console.error("[QUERY] ❌ Error in getAllSchoolsTeamsAndSessions:", error);

    // Return mock data if database fails
    console.log("[QUERY] 🔄 Returning mock data as fallback...");
    return {
      schools: [
        {
          schoolid: "mock-school-1",
          name: "Lincoln High School",
          location: "Springfield, IL",
          teams: [
            {
              teamid: "mock-team-1",
              schoolid: "mock-school-1",
              name: "Varsity Volleyball",
              description: "Elite high school volleyball training program",
              price: 299,
              participants: 0,
              isactive: true,
              isongoing: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              session: [
                {
                  sessionid: "mock-session-1",
                  startdate: "2024-02-01",
                  enddate: "2024-05-01",
                  starttime: "15:00",
                  endtime: "16:30",
                  daysofweek: "Monday,Wednesday,Friday",
                  repeat: "weekly",
                  coachid: "mock-coach-1",
                  staff: {
                    id: "mock-coach-1",
                    name: "Coach Johnson",
                    email: "coach.johnson@lincoln.edu",
                    phone: "(555) 123-4567",
                  },
                  parsedDaysOfWeek: ["Monday", "Wednesday", "Friday"],
                  individualSessions: [],
                },
              ],
            },
          ],
        },
      ],
    };
  }
}

// Individual sessions calculation is now handled by buildPracticeOccurrences
// from lib/schedule/buildPracticeOccurrences.ts

// Duration calculation is now handled by buildPracticeOccurrences

export async function filterSchoolsAndTeams(
  allSchools: Array<School & { teams: Team[] }>,
  query: string
): Promise<{ schools: Array<School & { teams: Team[] }> }> {
  try {
    if (!query.trim()) {
      return { schools: allSchools };
    }

    const searchTerm = query.toLowerCase().trim();

    const filteredSchools = allSchools
      .map((school) => {
        const schoolMatches =
          school.name.toLowerCase().includes(searchTerm) ||
          school.location.toLowerCase().includes(searchTerm);

        const matchingTeams = school.teams.filter(
          (team: any) =>
            team.name.toLowerCase().includes(searchTerm) ||
            team.description.toLowerCase().includes(searchTerm)
        );

        if (schoolMatches) {
          return {
            ...school,
            teams: school.teams,
          };
        } else if (matchingTeams.length > 0) {
          return {
            ...school,
            teams: matchingTeams,
          };
        }

        return null;
      })
      .filter((school) => school !== null) as Array<School & { teams: Team[] }>;

    return {
      schools: filteredSchools,
    };
  } catch (error) {
    console.error("[FILTER] ❌ Error filtering schools and teams:", error);
    return { schools: [] };
  }
}

export async function getTeamsWithSchoolsAndSessions(): Promise<Team[]> {
  try {
    const result = await getAllSchoolsTeamsAndSessions();
    const allTeams: Team[] = [];

    result.schools.forEach((school) => {
      school.teams.forEach((team) => {
        allTeams.push({
          ...team,
          school: {
            schoolid: school.schoolid,
            name: school.name,
            location: school.location,
          },
        });
      });
    });

    return allTeams;
  } catch (error) {
    console.error(
      "[TEAMS] ❌ Error getting teams with schools and sessions:",
      error
    );
    return [];
  }
}

export async function searchTeamsAndSchools(
  query: string
): Promise<{ schools: Array<School & { teams: Team[] }> }> {
  const allData = await getAllSchoolsTeamsAndSessions();
  return filterSchoolsAndTeams(allData.schools, query);
}

export async function getTeamById(teamId: string): Promise<Team | null> {
  try {
    const { data, error } = await supabase
      .from("team")
      .select(
        `
        *,
        school:schoolid (
          schoolid,
          name,
          location
        ),
        session (
          sessionid,
          startdate,
          enddate,
          starttime,
          endtime,
          daysofweek,
          repeat,
          coachid,
          cancel,
          staff:coachid (
            id,
            name,
            email,
            phone
          )
        )
      `
      )
      .eq("teamid", teamId)
      .single();

    if (error) {
      console.error("[TEAM] ❌ Error fetching team by ID:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("[TEAM] ❌ Error in getTeamById:", error);
    return null;
  }
}
