import { Report, User } from "../types";

const REPORTS_STORAGE_KEY = "unireport_reports_v3";
const CURRENT_USER_KEY = "unireport_current_user_v3";

export const DEFAULT_USER: User = {
  id: "usr_organizer",
  name: "Event Organizer",
  email: "organizer@university.edu",
  organization: "Department of Academic Affairs",
  provider: "local",
};

export const INITIAL_SAMPLE_REPORTS: Report[] = [
  {
    id: "rep_sample_annual_summit",
    userId: DEFAULT_USER.id,
    title: "Annual Tech Summit 2026",
    status: "completed",
    tags: ["External", "Urgent"],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    content: {
      eventDetails: {
        name: "Annual Tech Summit 2026",
        date: "2026-09-15",
        location: "University Grand Hall & Auditorium B",
        organizerName: "Event Coordinator",
        organizerEmail: "organizer@university.edu",
        organization: "Department of Computer Science & Engineering",
        eventType: "Conference",
        department: "Computer Science",
        targetAudience: "Undergraduate & Graduate Students, Faculty, Industry Partners",
        website: "https://summit.university.edu",
      },
      attendance: {
        totalAttendees: 485,
        isApproximate: false,
        notes: "Exceeded initial room capacity estimate of 400. Standing room only for morning keynote. High engagement throughout all three breakout tracks.",
        studentCount: 310,
        facultyCount: 45,
        externalCount: 130,
        virtualAttendees: 150,
        satisfactionRating: 4.8,
      },
      summary: {
        rawNotes: `• 485 in-person attendees from 18 universities and regional tech hubs
• Keynote on Responsible Generative Intelligence by Dr. Jane Smith from MIT
• 3 parallel breakout tracks: Artificial Intelligence, Distributed Systems, and Cybersecurity
• 24 student research poster presentations evaluated by industry committee
• 6 industry partners sponsored student awards totaling $15,000
• Highly positive feedback from faculty advisors and industry delegates`,
        polishedText:
          "The Annual Tech Summit 2026 convened 485 in-person attendees and 150 virtual delegates representing 18 academic institutions and regional technology leaders. Anchored by a distinguished keynote on Responsible Generative Intelligence delivered by Dr. Jane Smith of MIT, the conference featured three specialized technical tracks spanning Artificial Intelligence, Distributed Systems, and Cybersecurity. Twenty-four student research posters were evaluated by a senior industry jury, culminating in $15,000 in competitive student scholarship awards sponsored by corporate partners. The summit demonstrated exceptional administrative rigor, reinforced inter-institutional collaboration, and established an authoritative benchmark for technical scholarship across the department.",
        finalizedText:
          "The Annual Tech Summit 2026 convened 485 in-person attendees and 150 virtual delegates representing 18 academic institutions and regional technology leaders. Anchored by a distinguished keynote on Responsible Generative Intelligence delivered by Dr. Jane Smith of MIT, the conference featured three specialized technical tracks spanning Artificial Intelligence, Distributed Systems, and Cybersecurity. Twenty-four student research posters were evaluated by a senior industry jury, culminating in $15,000 in competitive student scholarship awards sponsored by corporate partners. The summit demonstrated exceptional administrative rigor, reinforced inter-institutional collaboration, and established an authoritative benchmark for technical scholarship across the department.",
        tone: "Formal",
        regenerateCount: 1,
        isFinalized: true,
        lastPolishedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      guests: [
        {
          id: "gst_1",
          name: "Dr. Jane Smith",
          designation: "Professor of Artificial Intelligence",
          organization: "MIT CSAIL",
          role: "Keynote",
          bio: "Pioneering researcher in trustworthy multi-agent alignment and responsible foundational architectures with over 150 peer-reviewed publications.",
          bioRegenerateCount: 0,
        },
        {
          id: "gst_2",
          name: "Dr. Marcus Vance",
          designation: "Principal Architect",
          organization: "Quantum Neural Labs",
          role: "Speaker",
          bio: "Specialist in topological quantum computing and Hamiltonian simulation with numerous citations in high-impact physical reviews.",
          bioRegenerateCount: 0,
        },
      ],
      images: [],
    },
  },
];

export function getStoredUser(): User {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.name === "Alice Johnson" || parsed.id === "usr_alice_j") {
        return DEFAULT_USER;
      }
      return parsed;
    }
  } catch (e) {
    console.error("Failed to read user from localStorage", e);
  }
  return DEFAULT_USER;
}

export function saveStoredUser(user: User): void {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save user to localStorage", e);
  }
}

export function getStoredReports(): Report[] {
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((r: any) => {
          let tags = Array.isArray(r.tags) ? r.tags : [];
          if (tags.length === 0) {
            if (r.id === "rep_sample_annual_summit") {
              tags = ["External", "Urgent"];
            }
          }
          return {
            ...r,
            tags,
          };
        });
      }
    }
  } catch (e) {
    console.error("Failed to read reports from localStorage", e);
  }
  saveStoredReports(INITIAL_SAMPLE_REPORTS);
  return INITIAL_SAMPLE_REPORTS;
}

export function saveStoredReports(reports: Report[]): void {
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error("Failed to save reports to localStorage", e);
  }
}

export function getReportById(id: string): Report | null {
  const reports = getStoredReports();
  return reports.find((r) => r.id === id) || null;
}

export function saveSingleReport(updatedReport: Report): void {
  const reports = getStoredReports();
  const index = reports.findIndex((r) => r.id === updatedReport.id);
  const now = new Date().toISOString();
  const reportWithTimestamp: Report = {
    ...updatedReport,
    updatedAt: now,
  };

  if (index >= 0) {
    reports[index] = reportWithTimestamp;
  } else {
    reports.unshift(reportWithTimestamp);
  }
  saveStoredReports(reports);
}

export function deleteReportById(id: string): Report[] {
  const reports = getStoredReports().filter((r) => r.id !== id);
  saveStoredReports(reports);
  return reports;
}

export function createNewBlankReport(user: User): Report {
  const newId = "rep_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const today = new Date().toISOString().split("T")[0];
  const newReport: Report = {
    id: newId,
    userId: user.id,
    title: "Untitled Event Report",
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    content: {
      eventDetails: {
        name: "",
        date: today,
        location: "",
        organizerName: user.name,
        organizerEmail: user.email,
        organization: user.organization || "",
        eventType: "Conference",
        department: "",
        targetAudience: "",
      },
      attendance: {
        totalAttendees: 0,
        isApproximate: false,
        notes: "",
        studentCount: 0,
        facultyCount: 0,
        externalCount: 0,
        virtualAttendees: 0,
      },
      summary: {
        rawNotes: "",
        polishedText: "",
        finalizedText: "",
        tone: "Formal",
        regenerateCount: 0,
        isFinalized: false,
      },
      guests: [],
      images: [],
    },
  };

  saveSingleReport(newReport);
  return newReport;
}

export function duplicateReport(sourceReport: Report): Report {
  const newId = "rep_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const cloned: Report = {
    ...JSON.parse(JSON.stringify(sourceReport)),
    id: newId,
    title: `${sourceReport.title} (Copy)`,
    status: "draft",
    tags: Array.isArray(sourceReport.tags) ? [...sourceReport.tags] : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  cloned.content.eventDetails.name = `${sourceReport.content.eventDetails.name} (Copy)`;
  saveSingleReport(cloned);
  return cloned;
}
