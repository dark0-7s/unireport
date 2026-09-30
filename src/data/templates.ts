import { Report, ReportTemplate, User } from "../types";

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "tpl_academic_conference",
    name: "Academic Conference Proceedings",
    category: "Academic",
    description:
      "Formal institutional layout featuring keynote summaries, paper evaluation metrics, panel proceedings, and scholarship awards.",
    iconName: "book-open",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    highlights: ["Formal peer-review proceedings", "Departmental sign-offs", "Keynote citations"],
    defaultContent: {
      title: "Symposium on Distributed Systems & AI",
      eventDetails: {
        eventType: "Conference",
        location: "University Auditorium & Main Hall",
        department: "Computer Science & Engineering",
        targetAudience: "Undergraduate/Graduate Researchers & Faculty",
      },
      attendance: {
        totalAttendees: 350,
        studentCount: 220,
        facultyCount: 50,
        externalCount: 80,
        satisfactionRating: 4.8,
      },
      summary: {
        rawNotes: "Keynote delivered by MIT faculty. 3 breakout tracks with 24 student posters evaluated.",
        polishedText:
          "The annual research symposium convened 350 delegates across 12 institutions, anchored by distinguished technical keynotes and competitive student research presentations.",
        finalizedText: "",
        tone: "Formal",
        regenerateCount: 0,
        isFinalized: false,
      },
      guests: [
        {
          id: "g_conf_1",
          name: "Dr. Evelyn Reed",
          designation: "Chair of Computing Research",
          organization: "National Institute of Science",
          role: "Keynote",
          bio: "Specialist in high-assurance distributed systems.",
        },
      ],
    },
  },
  {
    id: "tpl_technical_workshop",
    name: "Hands-on Technical Workshop & Lab",
    category: "Workplace",
    description:
      "Structured documentation for technical bootcamps, code sprints, and scientific laboratory training with hands-on deliverables.",
    iconName: "presentation",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    highlights: ["Prerequisites & lab milestones", "GitHub repository links", "Hardware checklists"],
    defaultContent: {
      title: "Hands-on Cloud-Native Microservices Lab",
      eventDetails: {
        eventType: "Workshop",
        location: "Engineering Innovation Computing Lab 4",
        department: "Information Technology",
        targetAudience: "Engineering Students & Junior Developers",
      },
      attendance: {
        totalAttendees: 65,
        studentCount: 55,
        facultyCount: 5,
        externalCount: 5,
        satisfactionRating: 4.9,
      },
      summary: {
        rawNotes: "Completed 4 practical lab exercises on Kubernetes, container security, and CI/CD pipelines.",
        polishedText:
          "Sixty-five participants successfully completed a four-hour immersive practical lab deploying production container clusters with automated telemetry monitoring.",
        finalizedText: "",
        tone: "Executive",
        regenerateCount: 0,
        isFinalized: false,
      },
      guests: [
        {
          id: "g_work_1",
          name: "Alex Rivera",
          designation: "Principal DevOps Architect",
          organization: "CloudSphere Systems",
          role: "Speaker",
          bio: "Staff engineer specializing in multi-region cluster reliability.",
        },
      ],
    },
  },
  {
    id: "tpl_executive_seminar",
    name: "Executive Seminar & Guest Lecture",
    category: "Academic",
    description:
      "Polished executive summary format ideal for distinguished guest lectures, chancellor addresses, and institutional seminars.",
    iconName: "briefcase",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    highlights: ["Executive takeaways", "Q&A transcript excerpts", "Distinguished speaker intro"],
    defaultContent: {
      title: "Distinguished Leadership Lecture: Ethics in Frontier AI",
      eventDetails: {
        eventType: "Seminar",
        location: "Chancellor Hall & Virtual Stream",
        department: "Ethics, Policy & Technology",
        targetAudience: "Faculty, Alumni & Graduate Students",
      },
      attendance: {
        totalAttendees: 210,
        studentCount: 120,
        facultyCount: 45,
        externalCount: 45,
        satisfactionRating: 4.7,
      },
      summary: {
        rawNotes: "Focus on policy guardrails, societal alignment, and institutional deployment of foundation models.",
        polishedText:
          "The lecture explored institutional responsibilities and ethical boundaries governing autonomous system deployments across public infrastructure.",
        finalizedText: "",
        tone: "Executive",
        regenerateCount: 0,
        isFinalized: false,
      },
      guests: [
        {
          id: "g_sem_1",
          name: "Hon. Sarah Jenkins",
          designation: "Senior Advisory Fellow",
          organization: "Center for Ethical AI Governance",
          role: "Chief Guest",
          bio: "Author and advisor on global regulatory standards for emerging technologies.",
        },
      ],
    },
  },
  {
    id: "tpl_hackathon_sprint",
    name: "Hackathon & Innovation Sprint",
    category: "Social",
    description:
      "High-energy template capturing project submissions, sponsor mentor rotations, judging matrices, and award distributions.",
    iconName: "users",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    highlights: ["Judging criteria scores", "Cash prize disbursements", "Sponsor booth engagement"],
    defaultContent: {
      title: "Campus Hack 2026: Building for Sustainability",
      eventDetails: {
        eventType: "Hackathon",
        location: "Student Union Complex & MakerSpace",
        department: "Student Life & Entrepreneurship",
        targetAudience: "Interdisciplinary Student Teams",
      },
      attendance: {
        totalAttendees: 280,
        studentCount: 260,
        facultyCount: 8,
        externalCount: 12,
        satisfactionRating: 4.9,
      },
      summary: {
        rawNotes: "36-hour sprint. 42 teams submitted working prototypes. $10,000 distributed in category prizes.",
        polishedText:
          "Campus Hack 2026 convened 280 participants across 42 teams over 36 continuous hours of collaborative prototyping, resulting in 8 funded venture proposals.",
        finalizedText: "",
        tone: "Highlights",
        regenerateCount: 0,
        isFinalized: false,
      },
      guests: [
        {
          id: "g_hack_1",
          name: "David Chen",
          designation: "Partner",
          organization: "NextGen Venture Lab",
          role: "Judge",
          bio: "Early-stage venture investor supporting student founders.",
        },
      ],
    },
  },
  {
    id: "tpl_career_expo",
    name: "Career Expo & Industry Mixer",
    category: "Conference",
    description:
      "Enterprise layout tracking corporate recruiter attendance, resume drops, student interviews, and networking engagement.",
    iconName: "briefcase",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    highlights: ["Employer booth directory", "Interview completion counts", "Student placement pipeline"],
    defaultContent: {
      title: "Annual STEM Career Fair & Industry Mixer",
      eventDetails: {
        eventType: "Conference",
        location: "Campus Arena Pavilion",
        department: "Career Services",
        targetAudience: "Graduating Seniors & Alumni",
      },
      attendance: {
        totalAttendees: 720,
        studentCount: 650,
        facultyCount: 15,
        externalCount: 55,
        satisfactionRating: 4.6,
      },
      summary: {
        rawNotes: "55 participating companies. 1,400 on-site resume screens and 120 initial interview offers.",
        polishedText:
          "The STEM Career Fair hosted 55 corporate and government employers, facilitating over 1,400 candidate evaluations and 120 preliminary employment screenings.",
        finalizedText: "",
        tone: "Formal",
        regenerateCount: 0,
        isFinalized: false,
      },
      guests: [],
    },
  },
];

export function createReportFromTemplate(template: ReportTemplate, user: User): Report {
  const newId = "rep_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const today = new Date().toISOString().split("T")[0];
  const { defaultContent } = template;

  return {
    id: newId,
    userId: user.id,
    title: defaultContent.title || template.name,
    status: "draft",
    tags: [template.category],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: {
      eventDetails: {
        name: defaultContent.title || template.name,
        date: today,
        location: defaultContent.eventDetails.location || "",
        organizerName: user.name,
        organizerEmail: user.email,
        organization: user.organization || "",
        eventType: defaultContent.eventDetails.eventType || "Conference",
        department: defaultContent.eventDetails.department || "",
        targetAudience: defaultContent.eventDetails.targetAudience || "",
      },
      attendance: {
        totalAttendees: defaultContent.attendance.totalAttendees || 0,
        studentCount: defaultContent.attendance.studentCount || 0,
        facultyCount: defaultContent.attendance.facultyCount || 0,
        externalCount: defaultContent.attendance.externalCount || 0,
        satisfactionRating: defaultContent.attendance.satisfactionRating || 5.0,
      },
      summary: {
        rawNotes: defaultContent.summary.rawNotes || "",
        polishedText: defaultContent.summary.polishedText || "",
        finalizedText: defaultContent.summary.finalizedText || "",
        tone: defaultContent.summary.tone || "Formal",
        regenerateCount: 0,
        isFinalized: false,
      },
      guests: defaultContent.guests ? JSON.parse(JSON.stringify(defaultContent.guests)) : [],
      images: [],
    },
  };
}
