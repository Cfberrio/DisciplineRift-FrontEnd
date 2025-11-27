"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AnimatedSection from "@/components/animated-section";
import SupabaseStatus from "@/components/supabase-status";
import {
  CheckCircle,
  Search,
  MapPin,
  Calendar,
  Mail,
  AlertCircle,
  TagIcon,
  ChevronDown,
  ChevronUp,
  LogIn,
  UserPlus,
  Loader2,
  CreditCard,
  User,
} from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// Types for the registration flow
interface School {
  id: string;
  name: string;
  location: string;
  logo?: string;
  teams: Team[];
}

interface Team {
  id: string;
  name: string;
  schoolId: string;
  schoolName: string;
  sport: string;
  ageGroup: string;
  skillLevel: string;
  sessions: Session[];
  coach: {
    name: string;
    email: string;
    phone: string;
  };
  price: number;
  description: string;
  participants: number;
  currentEnrollments: number;
  logo?: string;
}

interface Session {
  id: string;
  dayOfWeek: string;
  time: string;
  duration: string;
  location: string;
  startDate: string;
  endDate: string;
  totalSessions: number;
  trainingType?: string;
  formattedDate?: string;
  coachName?: string;
}

interface ParentRegistrationData {
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  childFirstName: string;
  childLastName: string;
  childBirthdate: string;
  childGrade: string;
  childDismissal: string;
  teacherName: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  selectedTeam: Team | null;
  medicalConditions: string;
  specialInstructions: string;
  registrationDate: string;
  status: "pending";
  paymentStatus: "unpaid";
  userId: string;
}

interface UserType {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function RegisterSection() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Search functionality for Step 1
  const [searchQuery, setSearchQuery] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [allSchoolsData, setAllSchoolsData] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Selected team for Step 2
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  // Authentication state

  const [authEmail, setAuthEmail] = useState("");
  const [authOtp, setAuthOtp] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiresIn, setOtpExpiresIn] = useState<string>("");

  // Registration data
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [existingStudents, setExistingStudents] = useState<any[]>([]);
  const [selectedExistingStudent, setSelectedExistingStudent] = useState<any>(null);
  const [isNewStudent, setIsNewStudent] = useState(true);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    percentage: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  // Newsletter subscription state
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(true);
  
  // Terms and conditions acceptance state (required) - pre-selected by default
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const [formData, setFormData] = useState<ParentRegistrationData>({
    parentFirstName: "",
    parentLastName: "",
    parentEmail: "",
    parentPhone: "",
    childFirstName: "",
    childLastName: "",
    childBirthdate: "",
    childGrade: "",
    childDismissal: "",
    teacherName: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    selectedTeam: null,
    medicalConditions: "",
    specialInstructions: "",
    registrationDate: "",
    status: "pending",
    paymentStatus: "unpaid",
    userId: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [message, setMessage] = useState<string | null>(null);
  const [isEmailConfirmationSent, setIsEmailConfirmationSent] = useState(false);

  // Load existing students for the parent
  const loadExistingStudents = async (parentId: string) => {
    try {
      console.log("🔄 Loading existing students for parent:", parentId);
      const response = await fetch(`/api/students/by-parent?parentId=${parentId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Loaded existing students:", data.students);
        setExistingStudents(data.students || []);
      } else {
        console.error("❌ Error loading students");
        setExistingStudents([]);
      }
    } catch (error) {
      console.error("❌ Error loading existing students:", error);
      setExistingStudents([]);
    }
  };

  // Check for existing session on component mount
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        if (!isMounted) return;

        setIsCheckingSession(true);
        console.log("🔄 Checking for existing session...");

        // Check if Supabase is configured
        if (
          !process.env.NEXT_PUBLIC_SUPABASE_URL ||
          !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ) {
          console.warn("⚠️ Supabase not configured, skipping session check");
          setIsCheckingSession(false);
          return;
        }

        // Set a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn("⚠️ Session check timeout, setting to false");
            setIsCheckingSession(false);
          }
        }, 5000); // 5 second timeout

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        // Clear timeout if we get a response
        clearTimeout(timeoutId);

        if (!isMounted) return;

        if (sessionError) {
          console.error("❌ Session error:", sessionError);
          setIsCheckingSession(false);
          return;
        }

        if (session?.user) {
          console.log("✅ Found existing session:", session.user.id);

          try {
            // Use a shorter timeout for the database query
            const controller = new AbortController();
            const dbTimeoutId = setTimeout(() => controller.abort(), 3000);

            const { data: parentData, error: parentError } = await supabase
              .from("parent")
              .select("*")
              .eq("parentid", session.user.id)
              .abortSignal(controller.signal)
              .single();

            clearTimeout(dbTimeoutId);

            if (!isMounted) return;

            if (!parentError && parentData) {
              const user: UserType = {
                id: session.user.id,
                email: session.user.email || "",
                firstName: parentData.firstname || "",
                lastName: parentData.lastname || "",
                phone: parentData.phone || "",
              };
              setCurrentUser(user);
              setFormData((prev) => ({
                ...prev,
                userId: user.id,
                parentEmail: user.email,
                parentFirstName: user.firstName,
                parentLastName: user.lastName,
                parentPhone: user.phone,
              }));
              // Load existing students for this parent
              await loadExistingStudents(user.id);
              console.log("✅ User data loaded from parent record");
            } else {
              console.log("⚠️ Parent record not found, using auth metadata");
              // Parent record doesn't exist, but user is logged in
              const user: UserType = {
                id: session.user.id,
                email: session.user.email || "",
                firstName: session.user.user_metadata?.firstName || "",
                lastName: session.user.user_metadata?.lastName || "",
                phone: session.user.user_metadata?.phone || "",
              };
              setCurrentUser(user);
              setFormData((prev) => ({
                ...prev,
                userId: user.id,
                parentEmail: user.email,
                parentFirstName: user.firstName,
                parentLastName: user.lastName,
                parentPhone: user.phone,
              }));
              // Load existing students for this parent
              await loadExistingStudents(user.id);
              console.log("✅ User data loaded from auth metadata");
            }
          } catch (dbError) {
            if (!isMounted) return;

            console.error("❌ Database error, using fallback:", dbError);
            // Fallback to auth metadata if database query fails
            const user: UserType = {
              id: session.user.id,
              email: session.user.email || "",
              firstName: session.user.user_metadata?.firstName || "",
              lastName: session.user.user_metadata?.lastName || "",
              phone: session.user.user_metadata?.phone || "",
            };
            setCurrentUser(user);
            setFormData((prev) => ({
              ...prev,
              userId: user.id,
              parentEmail: user.email,
              parentFirstName: user.firstName,
              parentLastName: user.lastName,
              parentPhone: user.phone,
            }));
            // Load existing students for this parent
            await loadExistingStudents(user.id);
            console.log("✅ User data loaded from auth metadata (fallback)");
          }
        } else {
          console.log("ℹ️ No existing session found");
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("❌ Error checking session:", error);
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    }

    checkSession();

    // Cleanup function
    return () => {
      isMounted = false;
    };

    // Simplified auth state listener - only handle logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log("🔄 Auth state changed:", event, session?.user?.id);

      // Only handle logout to clear state - login is handled manually
      if (event === "SIGNED_OUT") {
        setCurrentUser(null);
        setFormData((prev) => ({
          ...prev,
          userId: "",
          parentEmail: "",
          parentFirstName: "",
          parentLastName: "",
          parentPhone: "",
        }));
        console.log("ℹ️ Auth state change - user logged out");
      }
      // Note: We don't handle SIGNED_IN here to avoid conflicts with manual login flow
    });

    return () => subscription.unsubscribe();
  }, []);

  // Helper function to get sport priority for sorting (higher number = higher priority)
  const getSportPriority = (sport: string): number => {
    const normalizedSport = (sport || "").toLowerCase();
    if (normalizedSport.includes("pickleball") || normalizedSport === "pickleball") return 3;
    if (normalizedSport.includes("tennis") || normalizedSport === "tennis") return 2;
    if (normalizedSport.includes("volleyball") || normalizedSport === "volleyball") return 1;
    return 0; // Other sports go last
  };

  // Transform database data to component format
  const transformSchoolData = (dbSchools: any[]): School[] => {
    if (!Array.isArray(dbSchools)) {
      console.warn("Invalid schools data received:", dbSchools);
      return [];
    }

    return dbSchools.map((school) => {
      const teams = school.teams?.map((team: any) => ({
        id: team.teamid || "",
        name: team.name || "Unknown Team",
        schoolId: school.schoolid || "",
        schoolName: school.name || "Unknown School",
        sport: team.sport || "Volleyball",
        ageGroup: "12-18",
        skillLevel: "All Levels",
        price: team.price || 299,
        description: team.description || "Elite training program",
        participants: team.participants || 20,
        currentEnrollments: team.currentEnrollments || 0,
        logo: team.logo || undefined,
        coach: {
          name: team.session?.[0]?.staff?.name || "TBD",
          email: team.session?.[0]?.staff?.email || "",
          phone: team.session?.[0]?.staff?.phone || "",
        },
        sessions:
          team.session?.flatMap((session: any) => {
            const individualSessions = session.individualSessions || [];
            if (individualSessions.length === 0) {
              // Create default sessions if none exist
              return [
                {
                  id: `default-${session.sessionid || "session"}`,
                  dayOfWeek: "Monday",
                  time: "3:00 PM - 4:30 PM",
                  duration: "1h 30m",
                  location: school.location || "TBD",
                  startDate:
                    session.startdate ||
                    new Date().toISOString().split("T")[0],
                  endDate:
                    session.enddate ||
                    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0],
                  totalSessions: 12,
                  formattedDate: "Mondays, starting soon",
                  coachName: session.staff?.name || "TBD",
                  trainingType: "General Training",
                },
              ];
            }
            return individualSessions.map((indSession: any) => ({
              id: indSession.id || "",
              dayOfWeek: indSession.dayOfWeek || "",
              time: indSession.time || "",
              duration: indSession.duration || "",
              location: indSession.location || "",
              startDate: session.startdate || "",
              endDate: session.enddate || "",
              totalSessions: individualSessions.length,
              formattedDate: indSession.formattedDate || "",
              coachName: indSession.coachName || "",
              trainingType: "General Training",
            }));
          }) || [],
      })) || [];

      // Sort teams by sport: volleyball, tennis, pickleball, others
      const sortedTeams = teams.sort((a, b) => {
        return getSportPriority(b.sport) - getSportPriority(a.sport);
      });

      return {
        id: school.schoolid || "",
        name: school.name || "Unknown School",
        location: school.location || "Unknown Location",
        logo: school.teams?.[0]?.logo || `/placeholder.svg?height=48&width=48&text=${encodeURIComponent(
          school.name || "School"
        )}`,
        teams: sortedTeams,
      };
    });
  };

  // Load all data on component mount
  useEffect(() => {
    async function loadAllData() {
      setIsInitialLoading(true);
      setSearchError(null);

      try {
        console.log("[CLIENT] 🔄 Fetching schools data...");
        const response = await fetch("/api/schools/all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("[CLIENT] Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("[CLIENT] ❌ Response not OK:", errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log("[CLIENT] ✅ Loaded schools data:", data);

        const transformedData = transformSchoolData(data.schools || []);
        console.log("[CLIENT] ✅ Transformed schools data:", transformedData);

        setAllSchoolsData(transformedData);
      } catch (error) {
        console.error("[CLIENT] ❌ Error loading all data:", error);
        setSearchError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while loading schools data."
        );

        // Set mock data as fallback
        console.log("[CLIENT] 🔄 Using mock data as fallback...");
        const mockData = [
          {
            id: "mock-school-1",
            name: "Lincoln High School",
            location: "Springfield, IL",
            logo: "/placeholder.svg?height=60&width=60&text=Lincoln",
            teams: [
              {
                id: "mock-team-1",
                name: "Varsity Volleyball",
                schoolId: "mock-school-1",
                schoolName: "Lincoln High School",
                sport: "Volleyball",
                ageGroup: "14-18",
                skillLevel: "Advanced",
                price: 299,
                description: "Elite high school volleyball training program",
                participants: 20,
                currentEnrollments: 5,
                coach: {
                  name: "Coach Johnson",
                  email: "coach.johnson@lincoln.edu",
                  phone: "(555) 123-4567",
                },
                sessions: [
                  {
                    id: "mock-session-1",
                    dayOfWeek: "Monday",
                    time: "3:00 PM - 4:30 PM",
                    duration: "1h 30m",
                    location: "Lincoln High School Gym",
                    startDate: "2024-02-01",
                    endDate: "2024-05-01",
                    totalSessions: 12,
                    formattedDate: "Mondays, starting February 1st",
                    coachName: "Coach Johnson",
                    trainingType: "General Training",
                  },
                ],
              },
            ],
          },
        ];
        setAllSchoolsData(mockData);
      } finally {
        setIsInitialLoading(false);
      }
    }

    loadAllData();
  }, []);

  // Filter data when search query changes
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === "") {
      setFilteredSchools([]);
      setHasSearched(false);
      return;
    }

    setHasSearched(true);
    setIsLoadingSchools(true);

    try {
      const filtered = allSchoolsData
        .filter((school) => {
          const schoolMatches =
            (school.name || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            (school.location || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase());

          const teamMatches = school.teams.some(
            (team: any) =>
              (team.name || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              (team.description || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
          );

          return schoolMatches || teamMatches;
        })
        .map((school) => {
          const schoolMatches =
            (school.name || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            (school.location || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase());

          if (schoolMatches) {
            // Sort teams by sport even if school matches
            const sortedTeams = [...school.teams].sort((a, b) => {
              return getSportPriority(b.sport) - getSportPriority(a.sport);
            });
            
            return {
              ...school,
              teams: sortedTeams,
            };
          }

          // Filter teams and sort by sport
          const filteredTeams = school.teams.filter(
            (team: any) =>
              (team.name || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              (team.description || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
          );

          const sortedTeams = filteredTeams.sort((a, b) => {
            return getSportPriority(b.sport) - getSportPriority(a.sport);
          });

          return {
            ...school,
            teams: sortedTeams,
          };
        });

      setSchools(filtered);
      setFilteredSchools(filtered);
    } catch (error) {
      console.error("Error filtering:", error);
      setSearchError("Error filtering schools");
    } finally {
      setIsLoadingSchools(false);
    }
  }, [searchQuery, allSchoolsData]);

  const handleTeamSelect = (team: Team) => {
    console.log("Selected team:", team);
    setSelectedTeam(team);
    setFormData((prev) => ({ ...prev, selectedTeam: team }));
    setErrors({});
    setShowAllSessions(false);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAuthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "authEmail") setAuthEmail(value);
    if (name === "authOtp") setAuthOtp(value);
    setAuthError(null);
  };

  const validateAuthForm = (): boolean => {
    const newAuthErrors: Record<string, string> = {};

    if (!authEmail.trim()) newAuthErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(authEmail))
      newAuthErrors.email = "Invalid email format";

    setErrors(newAuthErrors);
    return Object.keys(newAuthErrors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!authEmail.trim()) {
      setAuthError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(authEmail)) {
      setAuthError("Invalid email format");
      return;
    }

    setIsAuthLoading(true);
    setAuthError(null);

    try {
      console.log("🔄 Sending OTP to:", authEmail);

      const response = await fetch("/api/auth/send-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send login code");
      }

      setOtpSent(true);
      setOtpExpiresIn(data.expiresIn || "10 minutes");
      setAuthError(null);
      setMessage("Login code sent successfully. Please check your email.");
    } catch (error) {
      console.error("❌ Error sending OTP:", error);
      setAuthError(
        error instanceof Error ? error.message : "Failed to send login code"
      );
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!authOtp.trim()) {
      setAuthError("Please enter the login code");
      return;
    }

    if (!/^\d{6}$/.test(authOtp)) {
      setAuthError("Login code must be 6 digits");
      return;
    }

    setIsAuthLoading(true);
    setAuthError(null);

    try {
      console.log("🔄 Verifying OTP for:", authEmail);

      const response = await fetch("/api/auth/verify-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, otp: authOtp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid login code");
      }

      if (!data.user) {
        throw new Error("No user data received from server");
      }

      // Create user object from response
      const user: UserType = {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phone: data.user.phone,
      };

      console.log("✅ Usuario autenticado:", user.email);

      // Set Supabase session with timeout
      if (data.session) {
        try {
          console.log("🔄 Estableciendo sesión en Supabase...");
          const sessionPromise = supabase.auth.setSession(data.session);
          const sessionTimeoutId = setTimeout(() => {
            console.warn("⚠️ Session set timeout, continuing anyway");
          }, 3000);

          await Promise.race([
            sessionPromise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Session timeout")), 3000)
            ),
          ]);

          clearTimeout(sessionTimeoutId);
          console.log("✅ Sesión establecida en Supabase");
        } catch (sessionError) {
          console.warn("⚠️ Error setting session, continuing:", sessionError);
          // Continue even if session setting fails
        }
      }

      // Update user state and form data immediately
      setCurrentUser(user);
      setFormData((prev) => ({
        ...prev,
        userId: user.id,
        parentEmail: user.email,
        parentFirstName: user.firstName,
        parentLastName: user.lastName,
        parentPhone: user.phone,
      }));

      // Load existing students for this parent
      await loadExistingStudents(user.id);

      // Clear any auth errors and reset OTP state
      setAuthError(null);
      setOtpSent(false);
      setAuthOtp("");

      // Show success message
      setMessage(`¡Bienvenido, ${user.firstName || user.email}!`);

      console.log("🔄 Procediendo al siguiente paso...");

      // Go directly to step 4 (Parent Info) after successful login
      setIsAuthLoading(false);
      setStep(4);

      // Scroll to top after a brief delay for better UX
      setTimeout(() => {
        document
          .getElementById("register")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);

      return;
    } catch (error) {
      console.error("❌ Error verifying OTP:", error);
      setAuthError(
        error instanceof Error ? error.message : "Invalid login code"
      );
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRegister = async () => {
    // Registration is now the same as login - just send OTP
    await handleSendOTP();
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setMessage(null);
      setAuthError(null);
      console.log("✅ User logged out");
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 2 && !selectedTeam) {
      newErrors.team = "Please select a team to proceed.";
      setErrors(newErrors);
      return false;
    }
    if (currentStep === 3 && !currentUser) {
      newErrors.auth = "Please log in or create an account to continue.";
      setAuthError("Please log in or create an account to continue.");
      setErrors(newErrors);
      return false;
    }
    if (currentStep === 4) {
      if (!formData.parentFirstName.trim())
        newErrors.parentFirstName = "Parent first name is required";
      if (!formData.parentLastName.trim())
        newErrors.parentLastName = "Parent last name is required";
      if (!formData.parentEmail.trim())
        newErrors.parentEmail = "Parent email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.parentEmail))
        newErrors.parentEmail = "Invalid email format";
      if (!formData.parentPhone.trim())
        newErrors.parentPhone = "Parent phone is required";
      else if (!/^\d{10}$/.test(formData.parentPhone.replace(/\D/g, "")))
        newErrors.parentPhone = "Invalid 10-digit phone";

      if (!formData.childFirstName.trim())
        newErrors.childFirstName = "Child first name is required";
      if (!formData.childLastName.trim())
        newErrors.childLastName = "Child last name is required";
      if (!formData.childBirthdate)
        newErrors.childBirthdate = "Child date of birth is required";
          if (!formData.childGrade.trim())
      newErrors.childGrade = "Child grade is required";
    if (!formData.childDismissal.trim())
      newErrors.childDismissal = "Child dismissal is required";

      if (!formData.emergencyContactName.trim())
        newErrors.emergencyContactName = "Emergency contact name is required";
      if (!formData.emergencyContactPhone.trim())
        newErrors.emergencyContactPhone = "Emergency contact phone is required";
      else if (
        !/^\d{10}$/.test(formData.emergencyContactPhone.replace(/\D/g, ""))
      )
        newErrors.emergencyContactPhone = "Invalid 10-digit phone";
      if (!formData.emergencyContactRelation.trim())
        newErrors.emergencyContactRelation =
          "Emergency contact relation is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = async () => {
    if (validateStep(step)) {
      // Si estamos pasando al paso 4 (información de padre e hijo), autocompletar información del usuario
      if (step === 3 && currentUser) {
        // Autocompletar información del padre con los datos del usuario autenticado
        setFormData((prev) => ({
          ...prev,
          parentFirstName: currentUser.firstName || "",
          parentLastName: currentUser.lastName || "",
          parentEmail: currentUser.email || "",
          parentPhone: currentUser.phone || "",
        }));
      }

      // Si estamos pasando del step 5 (Review) al step 6 (Payment) y el usuario marcó el checkbox de newsletter
      if (step === 5 && subscribeToNewsletter && currentUser) {
        try {
          // Guardar en la tabla Newsletter usando el email del usuario autenticado, el nombre del padre y el sport del team
          const response = await fetch("/api/send-parent-guide", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: currentUser.email,
              name: formData.parentFirstName,
              sport: formData.selectedTeam?.sport || null,
            }),
          });

          const result = await response.json();
          
          if (response.ok && result.success) {
            console.log("✅ Newsletter subscription saved successfully");
          } else {
            console.error("❌ Failed to save newsletter subscription:", result.message);
          }
        } catch (error) {
          console.error("❌ Error saving newsletter subscription:", error);
          // No mostramos error al usuario, solo logueamos
        }
      }

      setStep((prev) => prev + 1);
      setTimeout(() => {
        document
          .getElementById("register")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
    setTimeout(() => {
      document
        .getElementById("register")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    try {
      setIsSubmitting(true);
      setSubmissionError(null);

      // El registro de padre se maneja automáticamente en el endpoint /api/register

      const submissionData = {
        ...formData,
        registrationDate: new Date().toISOString(),
        selectedExistingStudent: isNewStudent ? null : selectedExistingStudent,
        isNewStudent: isNewStudent,
      };

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // If student is already enrolled and paid for this specific team, show special message
        if (errorData.alreadyPaid) {
          setSubmissionError(
            "This student is already enrolled and has paid for this specific team. You can register the same student for different teams, but not twice for the same team. Please check your dashboard or contact support if you need assistance."
          );
          return;
        }

        // If team is full, show special message and go back to team selection
        if (errorData.teamFull) {
          setSubmissionError(
            `This team is currently full (${errorData.currentEnrollments}/${errorData.maxParticipants} spots). Please go back and select a different team.`
          );
          // Optionally go back to step 2 to select a different team
          setTimeout(() => {
            setStep(2);
            document
              .getElementById("register")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 3000);
          return;
        }
        
        throw new Error(errorData.message || "Registration failed.");
      }

      const responseData = await response.json();
      setRegistrationResult(responseData);
      
      // If this is an existing enrollment (payment retry), show special message
      if (responseData.isExistingEnrollment) {
        setMessage("Enrollment found! You can now proceed to complete your payment.");
      }
      
      setStep((prev) => prev + 1);
      document
        .getElementById("register")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      setSubmissionError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simplified payment handler that always uses direct redirect
  const handlePayment = async () => {
    if (!selectedTeam || !registrationResult) return;

    try {
      setIsProcessingPayment(true);
      setSubmissionError(null);

      console.log("🔄 Creating Checkout Session...");

      // Create Checkout Session on the server
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedTeam.id,
          enrollmentId: registrationResult.enrollmentId,
          amount: calculateFinalPrice(),
          description: `${selectedTeam.name} - ${selectedTeam.schoolName}`,
          couponCode: appliedCoupon?.code || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Unable to start payment");
      }

      const data = await res.json();
      console.log("✅ Checkout session response:", data);

      // Development fallback
      if (data.isDevelopment) {
        console.log("🛠 Development mode – skipping real checkout.");
        setTimeout(() => {
          setStep(7);
          document
            .getElementById("register")
            ?.scrollIntoView({ behavior: "smooth" });
        }, 1500);
        return;
      }

      // Always use direct redirect to Stripe Checkout
      if (data.url) {
        console.log("🔄 Redirecting to Stripe Checkout:", data.url);
        // Use window.location.href for immediate redirect
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL provided by server");
      }
    } catch (error) {
      console.error("❌ Payment error:", error);
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "An unexpected payment error occurred"
      );
      setIsProcessingPayment(false);
    }
    // Note: Don't set setIsProcessingPayment(false) here if redirect is successful
    // because the page will be redirected away
  };

  const returnToHome = () => {
    window.location.href = "/";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDescription = (description: string) => {
    if (!description) return "";
    return description.split('.').filter(part => part.trim() !== '').join('\n');
  };

  // Coupon validation and application
  const validateCoupon = (code: string): { isValid: boolean; percentage: number } => {
    const normalizedCode = code.trim().toUpperCase();
    
    switch (normalizedCode) {
      case 'HALLO':
        return { isValid: true, percentage: 12 };
      case 'DISCIPLINE':
        return { isValid: true, percentage: 15 };
      case 'SIBLING':
        return { isValid: true, percentage: 10 };
      case 'FACULTY':
        return { isValid: true, percentage: 12 };
      case '50':
        return { isValid: true, percentage: 50 };
      case 'TRELLIS':
        return { isValid: true, percentage: 100 };
      default:
        return { isValid: false, percentage: 0 };
    }
  };

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (appliedCoupon) {
      setCouponError("Coupon already applied");
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError("");

    try {
      const validation = validateCoupon(couponCode);
      
      if (!validation.isValid) {
        setCouponError("Invalid coupon code");
        return;
      }

      if (!selectedTeam) {
        setCouponError("Something went wrong. Please try again");
        return;
      }

      const basePrice = selectedTeam.price;
      const discountAmount = Math.round(basePrice * (validation.percentage / 100) * 100) / 100;

      setAppliedCoupon({
        code: couponCode.trim().toUpperCase(),
        discount: discountAmount,
        percentage: validation.percentage
      });

      setCouponCode("");
      setCouponError("");
    } catch (error) {
      setCouponError("Something went wrong. Please try again");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const calculateFinalPrice = (): number => {
    if (!selectedTeam) return 0;
    
    const basePrice = selectedTeam.price;
    if (!appliedCoupon) return basePrice;
    
    const finalPrice = Math.max(0, basePrice - appliedCoupon.discount);
    return Math.round(finalPrice * 100) / 100;
  };

  return (
    <section className="py-20 bg-white" id="register">
      <div className="container px-4">
        <AnimatedSection animation="fade-down" className="text-center">
          <div className="mb-4 flex justify-center">
            <Image
              src="/REGISTERNOW.png"
              alt="Register Now"
              width={2400}
              height={720}
              className="w-auto h-auto max-w-full max-h-[28rem] xs:max-h-[32rem] sm:max-h-[40rem] md:max-h-[48rem] lg:max-h-[56rem]"
            />
          </div>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-16">
            Find your school and team to get started with registration.
          </p>
        </AnimatedSection>

        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="flex justify-between mb-12 px-2 sm:px-0 gap-2 sm:gap-3">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div key={s} className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-base ${
                    step >= s ? "" : "bg-gray-300"
                  }`}
                  style={{ backgroundColor: step >= s ? '#0085B7' : undefined }}
                >
                  {s}
                </div>
                <span
                  className={`mt-1 sm:mt-2 text-[0.65rem] sm:text-sm text-center leading-tight px-0 ${
                    step >= s ? "font-medium" : "text-gray-500"
                  }`}
                  style={{ color: step >= s ? '#0085B7' : undefined }}
                >
                  {s === 1
                    ? "Search"
                    : s === 2
                    ? "Select Team"
                    : s === 3
                    ? "Account"
                    : s === 4
                    ? "Parent Info"
                    : s === 5
                    ? "Review"
                    : s === 6
                    ? "Payment"
                    : "Confirmation"}
                </span>
              </div>
            ))}
          </div>

          {/* Step 1: Search Schools/Teams */}
          {step === 1 && (
            <AnimatedSection animation="fade-up">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl ethnocentric-title-blue mb-6" style={{ color: '#0085B7' }}>
                  Find Your School or Team
                </h3>
                <div className="relative mb-6">
                  
                  <input
                    type="text"
                    placeholder="Search for your school or team..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dr-blue focus:border-dr-blue text-gray-900 text-lg"
                  />
                </div>
                {hasSearched && (
                  <>
                    {searchError && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        <p className="font-semibold">Connection Error</p>
                        <p className="text-sm">{searchError}</p>
                        <p className="text-sm mt-2">
                          Showing sample data for demonstration purposes.
                        </p>
                      </div>
                    )}
                    {isInitialLoading && (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dr-blue mx-auto"></div>
                        <p className="mt-2 text-gray-600">
                          Loading schools and teams...
                        </p>
                      </div>
                    )}
                    {isLoadingSchools && (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dr-blue mx-auto"></div>
                        <p className="mt-2 text-gray-600">Searching...</p>
                      </div>
                    )}
                    {!isLoadingSchools && !isInitialLoading && (
                      <div className="space-y-6">
                        {filteredSchools.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-600">
                              No schools or teams found matching "{searchQuery}"
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              Try a different search term or browse all schools
                            </p>
                          </div>
                        ) : (
                          filteredSchools.map((school) => (
                            <div
                              key={school.id}
                              className="border border-gray-200 rounded-lg p-6"
                            >
                              <div className="flex items-center mb-4">
                                <div className="w-12 h-12 flex-shrink-0 mr-4">
                                  <Image
                                    src={
                                      school.logo ||
                                      "/placeholder.svg?height=48&width=48&text=School"
                                    }
                                    alt={school.name}
                                    width={48}
                                    height={48}
                                    className="rounded-lg object-cover w-full h-full"
                                  />
                                </div>
                                <div>
                                  <h4 
                                    className="text-xl font-bold text-dr-blue cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => {
                                      setSelectedSchoolId(school.id);
                                      const teamsSection = document.getElementById(`school-teams-${school.id}`);
                                      if (teamsSection) {
                                        teamsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                      }
                                    }}
                                  >
                                    {school.name}
                                  </h4>
                                  <p className="text-gray-600 flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {school.location}
                                  </p>
                                </div>
                              </div>
                              <div id={`school-teams-${school.id}`} className="space-y-3">
                                {school.teams.map((team) => (
                                  <div
                                    key={team.id}
                                    className="p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                    style={{
                                      backgroundColor: selectedSchoolId === school.id 
                                        ? 'rgba(0, 133, 183, 0.1)' 
                                        : '#f9fafb'
                                    }}
                                    onClick={() => {
                                      handleTeamSelect(team);
                                      nextStep();
                                    }}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <h5 className="font-semibold text-dr-blue">
                                          {team.name}
                                        </h5>
                                        <div className="text-sm text-gray-600 mb-2 whitespace-pre-line">
                                          {formatDescription(team.description)}
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                          <span className="bg-white px-2 py-1 rounded">
                                            {team.skillLevel}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="text-right ml-4">
                                        <div className="text-2xl font-bold text-dr-blue">
                                          ${team.price}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          per season
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </AnimatedSection>
          )}

          {/* Step 2: Team Details */}
          {step === 2 && selectedTeam && (
            <AnimatedSection animation="fade-up">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl ethnocentric-title-blue mb-6">
                  Team Details
                </h3>
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-dr-blue">
                        {selectedTeam.name}
                      </h4>
                      <p className="text-gray-600">{selectedTeam.schoolName}</p>
                      <div className="text-sm text-gray-600 mt-2 whitespace-pre-line">
                        {formatDescription(selectedTeam.description)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-dr-blue">
                        ${selectedTeam.price}
                      </div>
                      <div className="text-sm text-gray-600">per season</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Skill Level:</span>{" "}
                      {selectedTeam.skillLevel}
                    </div>
                    <div>
                      <span className="font-semibold">Coach:</span>{" "}
                      {selectedTeam.coach.name}
                    </div>
                    <div>
                      <span className="font-semibold">Status:</span>{" "}
                      <span className={`${
                        selectedTeam.currentEnrollments >= selectedTeam.participants
                          ? "text-red-600 font-medium"
                          : "text-green-600"
                      }`}>
                        {selectedTeam.currentEnrollments >= selectedTeam.participants
                          ? "Registration Full"
                          : "Available"
                        }
                      </span>
                    </div>
                  </div>
                  {selectedTeam.currentEnrollments >= selectedTeam.participants && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center text-red-700">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span className="font-medium">Team is Full</span>
                      </div>
                      <p className="text-sm text-red-600 mt-1">
                        This team has reached its maximum capacity. Please select a different team or check back later for availability.
                      </p>
                    </div>
                  )}
                </div>
                <div className="mb-6">
                  <h5 className="font-semibold text-dr-blue mb-3">
                    Training Sessions
                  </h5>
                  <div className="space-y-3">
                    {selectedTeam.sessions
                      .slice(
                        0,
                        showAllSessions ? selectedTeam.sessions.length : 3
                      )
                      .map((session) => (
                        <div
                          key={session.id}
                          className="bg-white border border-gray-200 p-4 rounded-lg"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-dr-blue">
                                {session.dayOfWeek} - {session.time}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                <Calendar className="inline h-4 w-4 mr-1" />
                                {session.formattedDate ||
                                  `${formatDate(
                                    session.startDate
                                  )} - ${formatDate(session.endDate)}`}
                              </div>
                              <div className="text-sm text-gray-600">
                                <MapPin className="inline h-4 w-4 mr-1" />
                                {session.location}
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-600">
                              <div>Duration: {session.duration}</div>
                              <div>Coach: {session.coachName}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  {selectedTeam.sessions.length > 3 && (
                    <button
                      onClick={() => setShowAllSessions(!showAllSessions)}
                      className="mt-3 text-dr-blue hover:text-blue-700 text-sm font-medium flex items-center"
                    >
                      {showAllSessions ? (
                        <>
                          Show Less <ChevronUp className="ml-1 h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Show All {selectedTeam.sessions.length} Sessions{" "}
                          <ChevronDown className="ml-1 h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    className="flex-1 bg-transparent"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    disabled={selectedTeam.currentEnrollments >= selectedTeam.participants}
                    className={`flex-1 ${
                      selectedTeam.currentEnrollments >= selectedTeam.participants
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-dr-blue hover:bg-blue-700"
                    }`}
                  >
                    {selectedTeam.currentEnrollments >= selectedTeam.participants 
                      ? "Team Full - Cannot Continue" 
                      : "Continue"
                    }
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* Step 3: Authentication */}
          {step === 3 && (
            <AnimatedSection animation="fade-up">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl ethnocentric-title-blue mb-6">
                  Account Required
                </h3>
                <p className="text-gray-600 mb-6">
                  To complete your registration, you need to log in to your
                  account or create a new one.
                </p>

                {/* Supabase Status Check */}
                <SupabaseStatus showOnlyErrors={true} />

                {/* Show session check loading */}
                {isCheckingSession && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-dr-blue" />
                    <p className="text-gray-600 mb-4">
                      Verificando tu sesión...
                    </p>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log(
                            "🔄 Usuario saltó manualmente la verificación de sesión"
                          );
                          setIsCheckingSession(false);
                        }}
                        className="text-sm mr-2"
                      >
                        Saltar & Continuar
                      </Button>
                      <p className="text-xs text-gray-500">
                        Si esto toma mucho tiempo, puedes continuar y iniciar
                        sesión manualmente
                      </p>
                    </div>
                  </div>
                )}

                {/* Show already logged in message */}
                {!isCheckingSession && currentUser && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <p className="font-semibold text-green-800">
                          Already Logged In
                        </p>
                        <p className="text-green-700">
                          You are already logged in as {currentUser.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show login status during authentication */}
                {isAuthLoading && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Loader2 className="h-5 w-5 text-blue-600 mr-3 animate-spin" />
                        <div>
                          <p className="font-semibold text-blue-800">
                            Iniciando Sesión...
                          </p>
                          <p className="text-blue-700 text-sm">
                            Verificando tus credenciales y configurando tu
                            sesión...
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsAuthLoading(false);
                          setAuthError("Login cancelado por el usuario");
                          console.log("🔄 Usuario canceló el login");
                        }}
                        className="text-blue-700 border-blue-300 hover:bg-blue-100"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Show login/register form only if not logged in */}
                {!isCheckingSession && !currentUser && (
                  <>
                    {/* Simple OTP Authentication */}
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-semibold text-dr-blue mb-2">
                        🔐 Secure Login
                      </h4>
                      <p className="text-sm text-gray-600">
                        Enter your email to receive a secure login code
                      </p>
                    </div>

                    {/* Common Fields */}
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <Input
                          name="authEmail"
                          type="email"
                          value={authEmail}
                          onChange={handleAuthChange}
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>
                      {otpSent ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Login Code
                          </label>
                          <Input
                            name="authOtp"
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={authOtp}
                            onChange={handleAuthChange}
                            maxLength={6}
                            className={errors.otp ? "border-red-500" : ""}
                          />
                          {errors.otp && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.otp}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 mt-1">
                            Code expires in {otpExpiresIn}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-4">
                            We'll send a login code to your email
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Messages */}
                {authError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <AlertCircle className="inline h-4 w-4 mr-2" />
                    {authError}
                  </div>
                )}

                {message && (
                  <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
                    <CheckCircle className="inline h-4 w-4 mr-2" />
                    {message}
                  </div>
                )}

                {isEmailConfirmationSent && (
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-6">
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Check Your Email</p>
                        <p className="text-sm mt-1">
                          We've sent a confirmation link to{" "}
                          <strong>{authEmail}</strong>. Please check your email
                          and click the link to verify your account.
                        </p>
                        <p className="text-sm mt-2">
                          After confirming your email, you'll be automatically
                          logged in and can continue with registration.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    className="flex-1 bg-transparent"
                  >
                    Back
                  </Button>

                  {!isCheckingSession && currentUser ? (
                    <div className="flex gap-2 flex-1">
                      <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="flex-1 bg-transparent"
                      >
                        Logout
                      </Button>
                      <Button
                        onClick={nextStep}
                        className="flex-1 bg-dr-blue hover:bg-blue-700"
                      >
                        Continue
                      </Button>
                    </div>
                  ) : !isCheckingSession && !isEmailConfirmationSent ? (
                    otpSent ? (
                      <Button
                        onClick={handleVerifyOTP}
                        disabled={isAuthLoading}
                        className="flex-1 bg-dr-blue hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {isAuthLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span className="hidden sm:inline">Verifying Code...</span>
                            <span className="sm:hidden">Verifying...</span>
                          </>
                        ) : (
                          <>
                            <LogIn className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-base">Verify Code & Continue</span>
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSendOTP}
                        disabled={isAuthLoading}
                        className="flex-1 bg-dr-blue hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {isAuthLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span className="hidden sm:inline">Sending Code...</span>
                            <span className="sm:hidden">Sending...</span>
                          </>
                        ) : (
                          <>
                            <Mail className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-base">Send Access Code</span>
                          </>
                        )}
                      </Button>
                    )
                  ) : null}
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* Step 4: Parent and Child Information */}
          {step === 4 && (
            <AnimatedSection animation="fade-up">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl ethnocentric-title-blue mb-6">
                  Parent and Child Information
                </h3>

                {/* Existing Students Selection */}
                {existingStudents.length > 0 && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-lg font-semibold text-dr-blue mb-3">
                      Students Already Registered
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      You can register an existing child for a new team or add a new child to your account.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Student Option
                        </label>
                        <select
                          value={selectedExistingStudent ? selectedExistingStudent.studentid : 'new'}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === 'new') {
                              setIsNewStudent(true);
                              setSelectedExistingStudent(null);
                              // Clear child form data
                              setFormData(prev => ({
                                ...prev,
                                childFirstName: "",
                                childLastName: "",
                                childBirthdate: "",
                                childGrade: "",
                                childDismissal: "",
                                teacherName: "",
                                emergencyContactName: "",
                                emergencyContactPhone: "",
                                emergencyContactRelation: ""
                              }));
                            } else {
                              const student = existingStudents.find(s => s.studentid === value);
                              if (student) {
                                setIsNewStudent(false);
                                setSelectedExistingStudent(student);
                                // Fill form with existing student data
                                setFormData(prev => ({
                                  ...prev,
                                  childFirstName: student.firstname,
                                  childLastName: student.lastname,
                                  childBirthdate: student.dob,
                                  childGrade: student.grade.toString(),
                                  childDismissal: student.StudentDismisall || "",
                                  teacherName: student.teacher || "",
                                  emergencyContactName: student.ecname,
                                  emergencyContactPhone: student.ecphone,
                                  emergencyContactRelation: student.ecrelationship
                                }));
                              }
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-dr-blue focus:border-dr-blue bg-white"
                        >
                          <option value="new">Register a new child</option>
                          {existingStudents.map((student) => (
                            <option key={student.studentid} value={student.studentid}>
                              {student.firstname} {student.lastname} - Grade {student.grade} (DOB: {new Date(student.dob).toLocaleDateString()})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {selectedExistingStudent && (
                        <div className="p-3 bg-white rounded-lg border border-blue-200">
                          <div className="text-sm text-gray-700">
                            <div className="font-medium text-gray-900 mb-2">
                              Selected: {selectedExistingStudent.firstname} {selectedExistingStudent.lastname}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                              <div>Grade: {selectedExistingStudent.grade}</div>
                              <div>DOB: {new Date(selectedExistingStudent.dob).toLocaleDateString()}</div>
                              {selectedExistingStudent.ecname && (
                                <div className="sm:col-span-2">Emergency Contact: {selectedExistingStudent.ecname}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Parent Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-dr-blue mb-4">
                      Parent/Guardian Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <Input
                          name="parentFirstName"
                          value={formData.parentFirstName}
                          onChange={handleChange}
                          className={
                            errors.parentFirstName ? "border-red-500" : ""
                          }
                        />
                        {errors.parentFirstName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.parentFirstName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <Input
                          name="parentLastName"
                          value={formData.parentLastName}
                          onChange={handleChange}
                          className={
                            errors.parentLastName ? "border-red-500" : ""
                          }
                        />
                        {errors.parentLastName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.parentLastName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <Input
                          name="parentEmail"
                          type="email"
                          value={formData.parentEmail}
                          onChange={handleChange}
                          className={errors.parentEmail ? "border-red-500" : ""}
                        />
                        {errors.parentEmail && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.parentEmail}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <Input
                          name="parentPhone"
                          value={formData.parentPhone}
                          onChange={handleChange}
                          placeholder="(555) 123-4567"
                          className={errors.parentPhone ? "border-red-500" : ""}
                        />
                        {errors.parentPhone && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.parentPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Child Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-dr-blue mb-4">
                      Child Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <Input
                          name="childFirstName"
                          value={formData.childFirstName}
                          onChange={handleChange}
                          className={
                            errors.childFirstName ? "border-red-500" : ""
                          }
                        />
                        {errors.childFirstName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.childFirstName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <Input
                          name="childLastName"
                          value={formData.childLastName}
                          onChange={handleChange}
                          className={
                            errors.childLastName ? "border-red-500" : ""
                          }
                        />
                        {errors.childLastName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.childLastName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth
                        </label>
                        <Input
                          name="childBirthdate"
                          type="date"
                          value={formData.childBirthdate}
                          onChange={handleChange}
                          className={
                            errors.childBirthdate ? "border-red-500" : ""
                          }
                        />
                        {errors.childBirthdate && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.childBirthdate}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Grade
                        </label>
                        <select
                          name="childGrade"
                          value={formData.childGrade}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-dr-blue focus:border-dr-blue ${
                            errors.childGrade
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select Grade</option>
                          {Array.from({ length: 6 }, (_, i) => (
                            <option
                              key={i}
                              value={i === 0 ? "K" : i.toString()}
                            >
                              {i === 0 ? "Kindergarten" : `Grade ${i}`}
                            </option>
                          ))}
                        </select>
                        {errors.childGrade && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.childGrade}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Child's dismissal
                        </label>
                        <select
                          name="childDismissal"
                          value={formData.childDismissal}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-dr-blue focus:border-dr-blue ${
                            errors.childDismissal
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select dismissal type</option>
                          <option value="After care">After care</option>
                          <option value="Car Rider">Car Rider</option>
                          <option value="Walker">Walker</option>
                        </select>
                        {errors.childDismissal && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.childDismissal}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teacher's Name
                        </label>
                        <Input
                          name="teacherName"
                          value={formData.teacherName}
                          onChange={handleChange}
                          placeholder="Enter teacher's name"
                          className={
                            errors.teacherName ? "border-red-500" : ""
                          }
                        />
                        {errors.teacherName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.teacherName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h4 className="text-lg font-semibold text-dr-blue mb-4">
                      Emergency Contact
                    </h4>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact Source
                      </label>
                      <select
                        value={
                          formData.emergencyContactName === `${formData.parentFirstName} ${formData.parentLastName}` && 
                          formData.emergencyContactPhone === formData.parentPhone ? 'parent' : 'different'
                        }
                        onChange={(e) => {
                          if (e.target.value === 'parent') {
                            setFormData(prev => ({
                              ...prev,
                              emergencyContactName: `${prev.parentFirstName} ${prev.parentLastName}`,
                              emergencyContactPhone: prev.parentPhone,
                              emergencyContactRelation: "Parent"
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              emergencyContactName: "",
                              emergencyContactPhone: "",
                              emergencyContactRelation: ""
                            }));
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-dr-blue focus:border-dr-blue bg-white"
                      >
                        <option value="parent">Same as parent/guardian</option>
                        <option value="different">Different emergency contact</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name
                        </label>
                        <Input
                          name="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={handleChange}
                          className={
                            errors.emergencyContactName ? "border-red-500" : ""
                          }
                        />
                        {errors.emergencyContactName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.emergencyContactName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <Input
                          name="emergencyContactPhone"
                          value={formData.emergencyContactPhone}
                          onChange={handleChange}
                          placeholder="(555) 123-4567"
                          className={
                            errors.emergencyContactPhone ? "border-red-500" : ""
                          }
                        />
                        {errors.emergencyContactPhone && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.emergencyContactPhone}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Relationship
                        </label>
                        <select
                          name="emergencyContactRelation"
                          value={formData.emergencyContactRelation}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-dr-blue focus:border-dr-blue ${
                            errors.emergencyContactRelation
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select Relationship</option>
                          <option value="Parent">Parent</option>
                          <option value="Guardian">Guardian</option>
                          <option value="Grandparent">Grandparent</option>
                          <option value="Aunt/Uncle">Aunt/Uncle</option>
                          <option value="Family Friend">Family Friend</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.emergencyContactRelation && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.emergencyContactRelation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Optional Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-dr-blue mb-4">
                      Additional Information (Optional)
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Medical Conditions
                        </label>
                        <textarea
                          name="medicalConditions"
                          value={formData.medicalConditions}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Please list any medical conditions, allergies, or medications we should be aware of..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-dr-blue focus:border-dr-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Special Instructions
                        </label>
                        <textarea
                          name="specialInstructions"
                          value={formData.specialInstructions}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Any special instructions or additional information for coaches..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-dr-blue focus:border-dr-blue"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="outline"
                      className="flex-1 bg-transparent"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-dr-blue hover:bg-blue-700 whitespace-nowrap px-3 sm:px-4 text-sm sm:text-base"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Continue to Review"
                      )}
                    </Button>
                  </div>
                </form>

                {submissionError && (
                  <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <AlertCircle className="inline h-4 w-4 mr-2" />
                    {submissionError}
                  </div>
                )}
              </div>
            </AnimatedSection>
          )}

          {/* Step 5: Review */}
          {step === 5 && selectedTeam && registrationResult && (
            <AnimatedSection animation="fade-up">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl ethnocentric-title-blue mb-6">
                  Review Your Registration
                </h3>
                <div className="space-y-6">
                  {/* Team Information */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-dr-blue mb-3">
                      Selected Team
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Team:</span>{" "}
                        {selectedTeam.name}
                      </div>
                      <div>
                        <span className="font-medium">School:</span>{" "}
                        {selectedTeam.schoolName}
                      </div>
                      <div>
                        <span className="font-medium">Coach:</span>{" "}
                        {selectedTeam.coach.name}
                      </div>
                      <div>
                        <span className="font-medium">Price:</span> $
                        {selectedTeam.price}
                      </div>
                    </div>
                  </div>

                  {/* Registration Information */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-dr-blue mb-3">
                      Registration Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Parent:</span>{" "}
                        {formData.parentFirstName} {formData.parentLastName}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span>{" "}
                        {formData.parentEmail}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span>{" "}
                        {formData.parentPhone}
                      </div>
                      <div>
                        <span className="font-medium">Child:</span>{" "}
                        {formData.childFirstName} {formData.childLastName}
                      </div>
                      <div>
                        <span className="font-medium">Grade:</span>{" "}
                        {formData.childGrade}
                      </div>
                      <div>
                        <span className="font-medium">Child's dismissal:</span>{" "}
                        {formData.childDismissal}
                      </div>
                      <div>
                        <span className="font-medium">Emergency Contact:</span>{" "}
                        {formData.emergencyContactName} (
                        {formData.emergencyContactRelation})
                      </div>
                    </div>
                  </div>

                  {/* Coupon Section */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-dr-blue mb-3">
                      Coupon Code
                    </h4>
                    
                    {!appliedCoupon ? (
                      <div className="space-y-3">
                        <div className="flex flex-col md:flex-row gap-3">
                          <div className="flex-1">
                            <Input
                              type="text"
                              placeholder="Enter your coupon"
                              value={couponCode}
                              onChange={(e) => {
                                setCouponCode(e.target.value);
                                setCouponError("");
                              }}
                              className="w-full"
                              disabled={isApplyingCoupon}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  applyCoupon();
                                }
                              }}
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={applyCoupon}
                            disabled={isApplyingCoupon || !couponCode.trim()}
                            className="bg-dr-blue hover:bg-blue-700 px-4 py-2 text-sm md:px-3 md:py-1.5 md:text-sm w-full md:w-auto"
                          >
                            {isApplyingCoupon ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </>
                            ) : (
                              "Add"
                            )}
                          </Button>
                        </div>
                        
                        {couponError && (
                          <div className="text-red-600 text-sm flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {couponError}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center text-green-700">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            <span className="font-medium">{appliedCoupon.code}</span>
                            <span className="ml-2 text-sm">({appliedCoupon.percentage}% off)</span>
                          </div>
                          <Button
                            type="button"
                            onClick={removeCoupon}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Remove coupon
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-dr-blue mb-3">
                      Payment Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Price</span>
                        <span>${selectedTeam.price}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({appliedCoupon.percentage}%)</span>
                          <span>-${appliedCoupon.discount}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${calculateFinalPrice()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Success Message */}
                  <div className={`border px-4 py-3 rounded ${
                    registrationResult.isExistingEnrollment 
                      ? "bg-blue-100 border-blue-400 text-blue-700"
                      : "bg-green-100 border-green-400 text-green-700"
                  }`}>
                    <CheckCircle className="inline h-4 w-4 mr-2" />
                    {registrationResult.isExistingEnrollment 
                      ? "Enrollment found! You can now complete your payment."
                      : "Registration submitted successfully!"
                    } Your enrollment ID is:{" "}
                    <strong>{registrationResult.enrollmentId}</strong>
                  </div>

                  {/* Newsletter Subscription Checkbox */}
                  <div className="bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded-lg">
                    <div 
                      className="flex items-start gap-3 cursor-pointer"
                      onClick={() => setSubscribeToNewsletter(!subscribeToNewsletter)}
                    >
                      <div 
                        className="mt-0.5 flex-shrink-0 border-2 rounded transition-all"
                        style={{
                          width: '18px',
                          height: '18px',
                          minWidth: '18px',
                          minHeight: '18px',
                          borderColor: subscribeToNewsletter ? '#0085B7' : '#D1D5DB',
                          backgroundColor: subscribeToNewsletter ? '#0085B7' : 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {subscribeToNewsletter && (
                          <svg 
                            width="12" 
                            height="12" 
                            viewBox="0 0 12 12" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path 
                              d="M10 3L4.5 8.5L2 6" 
                              stroke="white" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-gray-700 leading-relaxed flex-1" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                        <span className="font-semibold text-dr-blue">Subscribe and send me value</span> - season launches, downloadable parent guides, and event invites.
                      </span>
                    </div>
                  </div>

                  {/* Terms and Conditions Checkbox (Required) */}
                  <div className="bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded-lg">
                    <div 
                      className="flex items-start gap-3 cursor-pointer"
                      onClick={() => setAcceptedTerms(!acceptedTerms)}
                    >
                      <div 
                        className="mt-0.5 flex-shrink-0 border-2 rounded transition-all"
                        style={{
                          width: '18px',
                          height: '18px',
                          minWidth: '18px',
                          minHeight: '18px',
                          borderColor: acceptedTerms ? '#0085B7' : '#D1D5DB',
                          backgroundColor: acceptedTerms ? '#0085B7' : 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {acceptedTerms && (
                          <svg 
                            width="12" 
                            height="12" 
                            viewBox="0 0 12 12" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path 
                              d="M10 3L4.5 8.5L2 6" 
                              stroke="white" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-gray-700 leading-relaxed flex-1" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                        Yes, I've read the{" "}
                        <a
                          href="/privacy-policy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-dr-blue hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Privacy Policy
                        </a>
                        {" "}and agree to the{" "}
                        <a
                          href="/terms-of-use"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-dr-blue hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Site Terms of Use
                        </a>
                        {" "}and{" "}
                        <a
                          href="/sms-terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-dr-blue hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          SMS Terms of Use
                        </a>
                        <span className="block text-xs text-gray-500 mt-1">
                          Message &amp; data rates may apply.
                        </span>
                      </span>
                    </div>
                    {!acceptedTerms && (
                      <p className="text-red-600 text-xs mt-2 ml-9">
                        * Required to continue
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      className="flex-1 bg-transparent"
                    >
                      Back to Edit
                    </Button>
                    <Button
                      onClick={nextStep}
                      disabled={!acceptedTerms}
                      className="flex-1 bg-dr-blue hover:bg-blue-700 whitespace-nowrap px-3 sm:px-4 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* Step 6: Payment */}
          {step === 6 && selectedTeam && registrationResult && (
            <AnimatedSection animation="fade-up">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl ethnocentric-title-blue mb-6">
                  Payment
                </h3>
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h4 className="font-semibold text-dr-blue mb-3">
                    Payment Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>
                        {selectedTeam.name} - {selectedTeam.schoolName}
                      </span>
                      <span>${selectedTeam.price}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({appliedCoupon.code} - {appliedCoupon.percentage}%)</span>
                        <span>-${appliedCoupon.discount}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${calculateFinalPrice()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-center mb-6">
                  <p className="text-gray-600 mb-4">
                    Click below to proceed to secure payment processing.
                  </p>
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessingPayment}
                    className="bg-dr-blue hover:bg-blue-700 px-8 py-3"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay ${calculateFinalPrice()}
                      </>
                    )}
                  </Button>
                </div>
                {submissionError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <AlertCircle className="inline h-4 w-4 mr-2" />
                    {submissionError}
                  </div>
                )}
                <div className="flex gap-4">
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    className="flex-1 bg-transparent"
                  >
                    Back
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* Step 7: Confirmation */}
          {step === 7 && selectedTeam && registrationResult && (
            <AnimatedSection animation="fade-up">
              <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                </div>
                <h3 className="text-3xl ethnocentric-title-blue mb-4">
                  Registration Complete!
                </h3>
                <p className="text-xl text-gray-700 mb-6">
                  Welcome to {selectedTeam.name}! Your registration has been
                  successfully processed.
                </p>
                <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left">
                  <h4 className="font-semibold text-dr-blue mb-3">
                    What's Next?
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      • You'll receive a confirmation email with all the details
                    </li>
                    <li>
                      • The coach will contact you before the first session
                    </li>
                    <li>
                      • Check your parent dashboard for updates and schedules
                    </li>
                    <li>
                      • Bring water bottle and appropriate athletic wear to
                      sessions
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={returnToHome}
                    className="w-full bg-dr-blue hover:bg-blue-700"
                  >
                    Return to Home
                  </Button>
                  <Button
                    onClick={() => (window.location.href = "/dashboard")}
                    variant="outline"
                    className="w-full"
                  >
                    View Parent Dashboard
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>
    </section>
  );
}
