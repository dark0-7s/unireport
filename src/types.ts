export type EventType =
  | "Conference"
  | "Workshop"
  | "Seminar"
  | "Hackathon"
  | "Social"
  | "Exhibition"
  | "Meeting";

export const PRESET_TAGS = [
  "Academic",
  "Urgent",
  "Internal",
  "External",
  "Confidential",
  "Annual",
  "Symposium",
  "Featured",
] as const;

export interface EventDetails {
  name: string;
  date: string;
  location: string;
  organizerName: string;
  organizerEmail?: string;
  organization?: string;
  eventType: EventType;
  department?: string;
  targetAudience?: string;
  website?: string;
}

export interface AttendanceData {
  totalAttendees: number;
  isApproximate?: boolean;
  notes?: string;
  studentCount?: number;
  facultyCount?: number;
  externalCount?: number;
  virtualAttendees?: number;
  satisfactionRating?: number;
}

export interface SummaryData {
  rawNotes: string;
  polishedText: string;
  finalizedText: string;
  tone: "Formal" | "Executive" | "Concise" | "Highlights";
  regenerateCount: number;
  isFinalized: boolean;
  lastPolishedAt?: string;
}

export interface Guest {
  id: string;
  name: string;
  designation?: string;
  organization?: string;
  role: "Keynote" | "Speaker" | "Panelist" | "Chief Guest" | "Judge" | "Organizer";
  bio?: string;
  bioRegenerateCount?: number;
  avatarUrl?: string;
}

export interface ReportImage {
  id: string;
  url: string;
  caption: string;
  isCover?: boolean;
}

export interface SponsorItem {
  id: string;
  name: string;
  logoUrl?: string;
  tier?: "Platinum" | "Gold" | "Silver" | "Partner";
  amount?: string;
}

export interface AwardItem {
  id: string;
  title: string;
  recipientName: string;
  category?: string;
  prize?: string;
}

// 1. Conference & Seminar: Academic Accreditation & Outcome-Based Education (OBE)
export interface AccreditationData {
  programName?: string;
  courseOutcomeMapping?: string;
  programOutcomes?: string;
  bloomsLevel?: "L1 - Remember" | "L2 - Understand" | "L3 - Apply" | "L4 - Analyze" | "L5 - Evaluate" | "L6 - Create";
  targetAudienceType?: string;
  feedbackAverageRating?: number;
  feedbackSummary?: string;
  hodSignOffApproved?: boolean;
  hodName?: string;
  hodTitle?: string;
  approvalDate?: string;
}

// 2. Hackathon: Innovation, Tracks, Prizes, Sponsors & Repo links
export interface HackathonData {
  problemStatements?: string[];
  submissionCount?: number;
  shortlistedCount?: number;
  techTracks?: string[];
  awards?: AwardItem[];
  sponsors?: SponsorItem[];
  githubRepoOrDevpost?: string;
}

// 3. Meeting: Minutes, Resolutions & Action Items
export interface MeetingActionItem {
  id: string;
  action: string;
  assignedTo: string;
  deadline: string;
  status: "Pending" | "In Progress" | "Completed";
}

export interface MeetingData {
  meetingType?: "Department Board" | "Curriculum Committee" | "Student Council" | "Advisory Board" | "Faculty Senate" | "General Committee";
  presidedBy?: string;
  agendaItems?: string[];
  resolutionsPassed?: string[];
  actionItems?: MeetingActionItem[];
  nextMeetingDate?: string;
}

// 4. Workshop: Hands-on Lab, Toolchain & Skill Evaluation
export interface WorkshopData {
  skillLevel?: "Beginner" | "Intermediate" | "Advanced";
  softwareToolsUsed?: string[];
  handsOnExercises?: string[];
  certificationOffered?: boolean;
  preAssessmentAverage?: number;
  postAssessmentAverage?: number;
  takeHomeDeliverable?: string;
}

// 5. Exhibition & Social: Footfall, Stalls & Highlights
export interface ExhibitionData {
  stallsOrBoothsCount?: number;
  highlightExhibits?: string[];
  estimatedFootfall?: number;
  mediaCoverageLinks?: string;
  bestExhibitAward?: string;
}

export interface Report {
  id: string;
  userId: string;
  title: string;
  status: "draft" | "completed";
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  customTemplateId?: string;
  templateVersionUsed?: number;
  content: {
    eventDetails: EventDetails;
    attendance: AttendanceData;
    summary: SummaryData;
    guests: Guest[];
    images: ReportImage[];
    sponsors?: SponsorItem[];
    awards?: AwardItem[];
    // Specialized modules exclusive to their respective EventType
    accreditation?: AccreditationData; // Conference & Seminar
    hackathon?: HackathonData;         // Hackathon
    meeting?: MeetingData;             // Meeting
    workshop?: WorkshopData;           // Workshop
    exhibition?: ExhibitionData;       // Exhibition & Social
    customFields?: Record<string, string>;
  };
}

export type ChatRole =
  | "documentarian"
  | "formatter"
  | "analyst"
  | "speaker_specialist";

export type GeminiModel =
  | "gemini-3.8-flash"
  | "gemini-3.5-flash"
  | "gemini-3.1-flash-lite"
  | "gemini-3.1-pro-preview";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export interface ChatSession {
  roleId: ChatRole;
  model: GeminiModel;
  messages: ChatMessage[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  organization?: string;
  avatar?: string;
  photoURL?: string;
  provider?: "google" | "local" | "email";
  emailVerified?: boolean;
  reportOrder?: string[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  category: "Academic" | "Social" | "Workplace" | "Conference";
  description: string;
  iconName: "book-open" | "users" | "briefcase" | "presentation" | "award";
  badgeColor: string;
  highlights: string[];
  defaultContent: {
    title: string;
    eventDetails: Partial<EventDetails>;
    attendance: Partial<AttendanceData>;
    summary: Partial<SummaryData>;
    guests: Guest[];
  };
}

export type CustomTemplateType = "pre-built" | "builder" | "custom_html" | "latex_transformed";

export type LogoPosition = "left" | "center" | "right";

export type SectionId =
  | "event_details"
  | "summary"
  | "attendance"
  | "guests"
  | "images"
  | "sponsors"
  | "awards"
  | "metrics"
  | "timeline"
  | "custom";

export interface CustomField {
  id: string;
  label: string;
  value: string;
  type: "text" | "number" | "url" | "textarea";
}

export interface CustomTemplateLayout {
  headerStyle: "classic" | "minimal" | "bold" | "academic" | "split";
  pageOrientation: "portrait" | "landscape";
  sectionSpacing: "compact" | "normal" | "relaxed";
  sectionOrder?: SectionId[];
  enabledSections?: Record<string, boolean>;
}

export interface CustomTemplateMargins {
  preset: "standard" | "compact" | "wide" | "custom";
  top: number; // mm
  bottom: number; // mm
  left: number; // mm
  right: number; // mm
}

export interface CustomTemplateTypography {
  fontFamily: "helvetica" | "times" | "courier";
  fontScale: "compact" | "standard" | "large";
  primaryColor: string; // hex (e.g. #312e81)
  accentColor: string; // hex (e.g. #4f46e5)
  headingCase: "uppercase" | "capitalize" | "normal";
}

export interface CustomTemplateWatermark {
  mode: "text" | "logo" | "none";
  preset: "official" | "confidential" | "draft" | "custom";
  customText?: string;
  logoUrl?: string;
  opacity: number;
  rotation: number;
  showSeal: boolean;
  removeUniReportBranding: boolean;
}

export interface CustomTemplate {
  id: string;
  name: string;
  description: string;
  category: "Academic" | "Corporate" | "Workshop" | "Conference" | "Custom";
  version: number;
  createdAt: string;
  updatedAt: string;
  isCustom: boolean;
  type?: CustomTemplateType;
  layout?: CustomTemplateLayout;
  margins?: CustomTemplateMargins;
  typography?: CustomTemplateTypography;
  watermarkConfig?: CustomTemplateWatermark;
  latexCode?: string;
  htmlTemplate?: string;
  sections?: {
    id: SectionId;
    title: string;
    enabled: boolean;
    order: number;
  }[];
  styles?: {
    primaryColor: string;
    fontFamily: string;
    headerStyle: "classic" | "minimal" | "bold" | "modern";
    showCoverImage: boolean;
    showSignatures: boolean;
    showWatermark: boolean;
  };
  sponsors?: SponsorItem[];
  awards?: AwardItem[];
  defaultContent?: Partial<Report["content"]>;
}
