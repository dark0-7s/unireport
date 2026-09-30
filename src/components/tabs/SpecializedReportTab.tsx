import React, { useState } from "react";
import {
  GraduationCap,
  Trophy,
  ClipboardCheck,
  Laptop,
  Store,
  PartyPopper,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  User,
  ShieldCheck,
  Award,
  ExternalLink,
  Percent,
} from "lucide-react";
import { Report, AwardItem, SponsorItem, MeetingActionItem } from "../../types";

interface SpecializedReportTabProps {
  report: Report;
  onUpdateReport: (updater: (prev: Report) => Report) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const SpecializedReportTab: React.FC<SpecializedReportTabProps> = ({
  report,
  onUpdateReport,
  onNext,
  onPrevious,
}) => {
  const eventType = report.content.eventDetails.eventType;
  const content = report.content;

  // Local input states for adding items
  const [newAwardTitle, setNewAwardTitle] = useState("");
  const [newAwardRecipient, setNewAwardRecipient] = useState("");
  const [newAwardCategory, setNewAwardCategory] = useState("");
  const [newAwardPrize, setNewAwardPrize] = useState("");

  const [newActionItemDesc, setNewActionItemDesc] = useState("");
  const [newActionAssignee, setNewActionAssignee] = useState("");
  const [newActionDeadline, setNewActionDeadline] = useState("");

  const [newAgendaItem, setNewAgendaItem] = useState("");
  const [newResolution, setNewResolution] = useState("");

  const [newProblemStatement, setNewProblemStatement] = useState("");
  const [newLabExercise, setNewLabExercise] = useState("");
  const [newTool, setNewTool] = useState("");
  const [newHighlight, setNewHighlight] = useState("");

  // -------------------------------------------------------------
  // Helpers for Updating Specialized Content
  // -------------------------------------------------------------

  // Conference / Seminar: Accreditation
  const handleUpdateAccreditation = (fields: Partial<NonNullable<typeof content.accreditation>>) => {
    onUpdateReport((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        accreditation: {
          ...prev.content.accreditation,
          ...fields,
        },
      },
    }));
  };

  // Hackathon
  const handleUpdateHackathon = (fields: Partial<NonNullable<typeof content.hackathon>>) => {
    onUpdateReport((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        hackathon: {
          ...prev.content.hackathon,
          ...fields,
        },
      },
    }));
  };

  const handleAddAward = () => {
    if (!newAwardTitle.trim() || !newAwardRecipient.trim()) return;
    const newAward: AwardItem = {
      id: "awd_" + Math.random().toString(36).substring(2, 9),
      title: newAwardTitle.trim(),
      recipientName: newAwardRecipient.trim(),
      category: newAwardCategory.trim() || undefined,
      prize: newAwardPrize.trim() || undefined,
    };

    const currentAwards = content.hackathon?.awards || content.awards || [];
    const updatedAwards = [...currentAwards, newAward];

    onUpdateReport((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        awards: updatedAwards,
        hackathon: {
          ...prev.content.hackathon,
          awards: updatedAwards,
        },
      },
    }));

    setNewAwardTitle("");
    setNewAwardRecipient("");
    setNewAwardCategory("");
    setNewAwardPrize("");
  };

  const handleRemoveAward = (id: string) => {
    const updatedAwards = (content.hackathon?.awards || content.awards || []).filter((a) => a.id !== id);
    onUpdateReport((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        awards: updatedAwards,
        hackathon: {
          ...prev.content.hackathon,
          awards: updatedAwards,
        },
      },
    }));
  };

  // Meeting
  const handleUpdateMeeting = (fields: Partial<NonNullable<typeof content.meeting>>) => {
    onUpdateReport((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        meeting: {
          ...prev.content.meeting,
          ...fields,
        },
      },
    }));
  };

  const handleAddActionItem = () => {
    if (!newActionItemDesc.trim()) return;
    const newItem: MeetingActionItem = {
      id: "act_" + Math.random().toString(36).substring(2, 9),
      action: newActionItemDesc.trim(),
      assignedTo: newActionAssignee.trim() || "Unassigned",
      deadline: newActionDeadline || new Date().toISOString().split("T")[0],
      status: "Pending",
    };

    const currentActions = content.meeting?.actionItems || [];
    handleUpdateMeeting({ actionItems: [...currentActions, newItem] });

    setNewActionItemDesc("");
    setNewActionAssignee("");
    setNewActionDeadline("");
  };

  const handleToggleActionStatus = (id: string) => {
    const currentActions = content.meeting?.actionItems || [];
    const updated = currentActions.map((item) => {
      if (item.id !== id) return item;
      const nextStatus: MeetingActionItem["status"] =
        item.status === "Pending" ? "In Progress" : item.status === "In Progress" ? "Completed" : "Pending";
      return { ...item, status: nextStatus };
    });
    handleUpdateMeeting({ actionItems: updated });
  };

  const handleRemoveActionItem = (id: string) => {
    const currentActions = content.meeting?.actionItems || [];
    handleUpdateMeeting({ actionItems: currentActions.filter((a) => a.id !== id) });
  };

  // Workshop
  const handleUpdateWorkshop = (fields: Partial<NonNullable<typeof content.workshop>>) => {
    onUpdateReport((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        workshop: {
          ...prev.content.workshop,
          ...fields,
        },
      },
    }));
  };

  // Exhibition / Social
  const handleUpdateExhibition = (fields: Partial<NonNullable<typeof content.exhibition>>) => {
    onUpdateReport((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        exhibition: {
          ...prev.content.exhibition,
          ...fields,
        },
      },
    }));
  };

  // -------------------------------------------------------------
  // Quick AI Assistant Helper for Respective Report Type
  // -------------------------------------------------------------
  const handleAutoPopulateDefaults = () => {
    const title = report.title || "Institutional Event";
    if (eventType === "Conference" || eventType === "Seminar") {
      handleUpdateAccreditation({
        programName: report.content.eventDetails.department || "Engineering & Applied Sciences",
        courseOutcomeMapping: "CO1 (Theoretical Principles), CO2 (Critical Analysis), PO1 (Engineering Knowledge), PO12 (Life-long Learning)",
        bloomsLevel: "L4 - Analyze",
        targetAudienceType: "Faculty, Graduate Scholars & Senior Students",
        feedbackAverageRating: 4.8,
        feedbackSummary: "94% of delegates reported that the keynote sessions deepened their understanding of research frontiers and interdisciplinary applications.",
        hodSignOffApproved: true,
        hodName: report.content.eventDetails.organizerName || "Dr. Department Chair",
        hodTitle: "Head of Academic Department & Accreditation Coordinator",
        approvalDate: new Date().toISOString().split("T")[0],
      });
    } else if (eventType === "Hackathon") {
      const existingAwards = content.hackathon?.awards || [];
      const defaultAwards: AwardItem[] = existingAwards.length > 0 ? existingAwards : [
        {
          id: "awd_1",
          title: "First Place Grand Champion",
          recipientName: "Team NeuralForge",
          category: "Overall Best Prototype",
          prize: "$3,000 + Venture Incubation",
        },
        {
          id: "awd_2",
          title: "Runner-Up Innovation Award",
          recipientName: "Team EcoSensors",
          category: "Best Hardware & IoT Track",
          prize: "$1,500 + Hardware Kits",
        },
        {
          id: "awd_3",
          title: "Best Freshman Team",
          recipientName: "Team CodeCrafters",
          category: "Undergraduate Division",
          prize: "$750 Dev Vouchers",
        },
      ];
      handleUpdateHackathon({
        problemStatements: [
          "Smart Campus Energy Optimization using edge inference",
          "Automated Peer Tutoring & Study Group Coordination",
          "Decentralized Student Credential Verification",
        ],
        submissionCount: 38,
        shortlistedCount: 10,
        techTracks: ["Artificial Intelligence", "Sustainability & IoT", "Web3 & Security", "Social Impact"],
        awards: defaultAwards,
        githubRepoOrDevpost: "https://devpost.com/hackathons/unireport-2026",
      });
    } else if (eventType === "Meeting") {
      handleUpdateMeeting({
        meetingType: "Department Board",
        presidedBy: report.content.eventDetails.organizerName || "Dean of Academic Affairs",
        agendaItems: [
          "Review and ratification of prior committee minutes",
          "Curriculum revision proposal for upcoming academic semester",
          "Allocation of institutional lab equipment upgrades",
          "Upcoming conference sponsorship approvals",
        ],
        resolutionsPassed: [
          "Resolution 26-01: Approved the procurement of 25 upgraded GPU workstations for Lab 3.",
          "Resolution 26-02: Ratified the updated Capstone Project evaluation rubric effective immediately.",
        ],
        actionItems: [
          {
            id: "act_1",
            action: "Finalize vendor RFP documentation for laboratory hardware upgrades",
            assignedTo: "Facilities & Procurement Lead",
            deadline: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0],
            status: "In Progress",
          },
          {
            id: "act_2",
            action: "Circulate revised Capstone syllabus to department faculty chairs",
            assignedTo: "Curriculum Coordinator",
            deadline: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
            status: "Pending",
          },
        ],
        nextMeetingDate: new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0],
      });
    } else if (eventType === "Workshop") {
      handleUpdateWorkshop({
        skillLevel: "Intermediate",
        softwareToolsUsed: ["Docker", "Kubernetes", "TypeScript", "FastAPI", "Prometheus"],
        handsOnExercises: [
          "Exercise 1: Containerizing a microservices application with multistage builds",
          "Exercise 2: Setting up local Kubernetes ingress and secret management",
          "Exercise 3: Implementing automated CI/CD pipeline triggers with GitHub Actions",
        ],
        certificationOffered: true,
        preAssessmentAverage: 48,
        postAssessmentAverage: 89,
        takeHomeDeliverable: "Completed deployment configuration repository and passing automated test suite artifact.",
      });
    } else {
      // Exhibition or Social
      handleUpdateExhibition({
        stallsOrBoothsCount: 24,
        highlightExhibits: [
          "Autonomous Formula Student Electric Vehicle prototype",
          "Robotic Arm with Computer Vision sorting demonstrations",
          "Smart AgriTech Hydroponics telemetry station",
        ],
        estimatedFootfall: 650,
        mediaCoverageLinks: "University Gazette Feature & Regional Tech Portal Press Release",
        bestExhibitAward: "Formula Student Electric Vehicle - Society of Automotive Engineers",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in duration-150">
      {/* Top Banner explaining exclusive scope */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-indigo-900/50 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {eventType === "Conference" || eventType === "Seminar" && <GraduationCap className="w-3.5 h-3.5" />}
            {eventType === "Hackathon" && <Trophy className="w-3.5 h-3.5" />}
            {eventType === "Meeting" && <ClipboardCheck className="w-3.5 h-3.5" />}
            {eventType === "Workshop" && <Laptop className="w-3.5 h-3.5" />}
            {(eventType === "Exhibition" || eventType === "Social") && <Store className="w-3.5 h-3.5" />}
            Exclusive to {eventType} Reports
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {eventType === "Conference" || eventType === "Seminar"
              ? "Academic Accreditation & Outcome (CO/PO) Mapping"
              : eventType === "Hackathon"
              ? "Hackathon Innovation, Problem Statements & Awards"
              : eventType === "Meeting"
              ? "Official Minutes, Resolutions & Action Items"
              : eventType === "Workshop"
              ? "Hands-on Lab Exercises & Skill Evaluation"
              : "Exhibition Stalls, Footfall & Public Showcase"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {eventType === "Conference" || eventType === "Seminar"
              ? "Institutional accreditation bodies (NAAC, ABET, NBA) require formal Course Outcome (CO) and Program Outcome (PO) mapping, Bloom's level, and HOD sign-off."
              : eventType === "Hackathon"
              ? "Document hackathon problem statements, technical competition tracks, cash prizes, awards, and project submission repositories."
              : eventType === "Meeting"
              ? "Formulate official parliamentary minutes, formal committee resolutions, and track assigned action items with deadlines and real-time statuses."
              : eventType === "Workshop"
              ? "Quantify student learning gain with pre/post assessment metrics, software toolchain prerequisites, and practical hands-on lab exercises."
              : "Capture total showcase booths, prominent student projects, verified visitor footfall metrics, and press coverage."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAutoPopulateDefaults}
          className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-indigo-200" />
          <span>Auto-Fill {eventType} Template</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. CONFERENCE & SEMINAR: ACCREDITATION & CO/PO MAPPING                     */}
      {/* ========================================================================= */}
      {(eventType === "Conference" || eventType === "Seminar") && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              Outcome-Based Education (OBE) & Institutional Criteria
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Academic Program / Department
                </label>
                <input
                  type="text"
                  value={content.accreditation?.programName || ""}
                  onChange={(e) => handleUpdateAccreditation({ programName: e.target.value })}
                  placeholder="e.g. B.Tech Computer Science & Engineering"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bloom's Taxonomy Cognitive Level
                </label>
                <select
                  value={content.accreditation?.bloomsLevel || "L4 - Analyze"}
                  onChange={(e) =>
                    handleUpdateAccreditation({
                      bloomsLevel: e.target.value as NonNullable<typeof content.accreditation>["bloomsLevel"],
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                >
                  <option value="L1 - Remember">L1 - Remember (Recall facts and basic concepts)</option>
                  <option value="L2 - Understand">L2 - Understand (Explain ideas or concepts)</option>
                  <option value="L3 - Apply">L3 - Apply (Use information in new situations)</option>
                  <option value="L4 - Analyze">L4 - Analyze (Draw connections among ideas)</option>
                  <option value="L5 - Evaluate">L5 - Evaluate (Justify a stand or decision)</option>
                  <option value="L6 - Create">L6 - Create (Produce new or original work)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Course Outcome (CO) & Program Outcome (PO) Mapping
                </label>
                <input
                  type="text"
                  value={content.accreditation?.courseOutcomeMapping || ""}
                  onChange={(e) => handleUpdateAccreditation({ courseOutcomeMapping: e.target.value })}
                  placeholder="e.g. CO1 (Foundations), CO3 (System Architecture), PO1 (Engineering Knowledge), PO12"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Specify how this conference or seminar satisfies institutional accreditation criteria for ABET, NAAC, or NBA.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Participant Feedback Rating (1.0 to 5.0)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={content.accreditation?.feedbackAverageRating || 4.8}
                  onChange={(e) => handleUpdateAccreditation({ feedbackAverageRating: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Academic Division
                </label>
                <input
                  type="text"
                  value={content.accreditation?.targetAudienceType || ""}
                  onChange={(e) => handleUpdateAccreditation({ targetAudienceType: e.target.value })}
                  placeholder="e.g. Senior Undergraduates, Faculty & Industry"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Qualitative Delegate Feedback Summary
                </label>
                <textarea
                  rows={3}
                  value={content.accreditation?.feedbackSummary || ""}
                  onChange={(e) => handleUpdateAccreditation({ feedbackSummary: e.target.value })}
                  placeholder="Summarize key takeaways, survey satisfaction highlights, and participant recommendations..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Department Head / Dean Sign-off Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Dean / HOD Official Accreditation Sign-off
              </h3>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={content.accreditation?.hodSignOffApproved ?? false}
                  onChange={(e) => handleUpdateAccreditation({ hodSignOffApproved: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span>Formally Verified by Academic Chair</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Approver Name</label>
                <input
                  type="text"
                  value={content.accreditation?.hodName || ""}
                  onChange={(e) => handleUpdateAccreditation({ hodName: e.target.value })}
                  placeholder="e.g. Dr. Arthur Pendelton"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Official Designation</label>
                <input
                  type="text"
                  value={content.accreditation?.hodTitle || ""}
                  onChange={(e) => handleUpdateAccreditation({ hodTitle: e.target.value })}
                  placeholder="e.g. Head of Department / Academic Dean"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. HACKATHON: PROBLEM STATEMENTS, AWARDS & SPONSORS                       */}
      {/* ========================================================================= */}
      {eventType === "Hackathon" && (
        <div className="space-y-6">
          {/* Hackathon Specs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Competition Overview & Submission Tracks
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Teams Submitted
                </label>
                <input
                  type="number"
                  value={content.hackathon?.submissionCount || 0}
                  onChange={(e) => handleUpdateHackathon({ submissionCount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Finalist Teams
                </label>
                <input
                  type="number"
                  value={content.hackathon?.shortlistedCount || 0}
                  onChange={(e) => handleUpdateHackathon({ shortlistedCount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Devpost / Repo Showcase Link
                </label>
                <input
                  type="url"
                  value={content.hackathon?.githubRepoOrDevpost || ""}
                  onChange={(e) => handleUpdateHackathon({ githubRepoOrDevpost: e.target.value })}
                  placeholder="https://devpost.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Problem Statements */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Problem Statements & Challenges
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newProblemStatement}
                  onChange={(e) => setNewProblemStatement(e.target.value)}
                  placeholder="Add problem statement (e.g. AI-driven campus energy conservation)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newProblemStatement.trim()) {
                        const current = content.hackathon?.problemStatements || [];
                        handleUpdateHackathon({ problemStatements: [...current, newProblemStatement.trim()] });
                        setNewProblemStatement("");
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newProblemStatement.trim()) {
                      const current = content.hackathon?.problemStatements || [];
                      handleUpdateHackathon({ problemStatements: [...current, newProblemStatement.trim()] });
                      setNewProblemStatement("");
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {(content.hackathon?.problemStatements || []).length > 0 && (
                <div className="space-y-1.5">
                  {content.hackathon?.problemStatements?.map((statement, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    >
                      <span className="font-medium">
                        {idx + 1}. {statement}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (content.hackathon?.problemStatements || []).filter((_, i) => i !== idx);
                          handleUpdateHackathon({ problemStatements: updated });
                        }}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hackathon Winners & Awards */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Winners, Prizes & Cash Awards
            </h3>

            {/* Add Award Form */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-amber-50/50 rounded-xl border border-amber-200/60">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={newAwardTitle}
                  onChange={(e) => setNewAwardTitle(e.target.value)}
                  placeholder="Award Title (e.g. 1st Place Grand Prize)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={newAwardRecipient}
                  onChange={(e) => setNewAwardRecipient(e.target.value)}
                  placeholder="Winning Team / Project Name"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newAwardCategory}
                  onChange={(e) => setNewAwardCategory(e.target.value)}
                  placeholder="Category (e.g. AI Track)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={newAwardPrize}
                  onChange={(e) => setNewAwardPrize(e.target.value)}
                  placeholder="Prize (e.g. $3,000 Cash + Cloud Credits)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                />
              </div>
              <button
                type="button"
                onClick={handleAddAward}
                className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Winner
              </button>
            </div>

            {/* Awards List */}
            {((content.hackathon?.awards || content.awards || []).length === 0) ? (
              <p className="text-xs text-slate-500 italic py-2">
                No awards added yet. Add winning teams and prizes to showcase them in the final PDF report.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(content.hackathon?.awards || content.awards || []).map((awd) => (
                  <div
                    key={awd.id}
                    className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-900">{awd.title}</span>
                      </div>
                      <p className="text-xs font-semibold text-indigo-700">{awd.recipientName}</p>
                      {awd.category && <p className="text-[11px] text-slate-500">Track: {awd.category}</p>}
                      {awd.prize && (
                        <p className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                          {awd.prize}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAward(awd.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MEETING: MINUTES, RESOLUTIONS & ACTION ITEMS                           */}
      {/* ========================================================================= */}
      {eventType === "Meeting" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-emerald-600" />
              Administrative Governance & Committee Proceedings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Committee / Board Type
                </label>
                <select
                  value={content.meeting?.meetingType || "Department Board"}
                  onChange={(e) =>
                    handleUpdateMeeting({
                      meetingType: e.target.value as NonNullable<typeof content.meeting>["meetingType"],
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white"
                >
                  <option value="Department Board">Department Board</option>
                  <option value="Curriculum Committee">Curriculum Committee</option>
                  <option value="Student Council">Student Council</option>
                  <option value="Faculty Senate">Faculty Senate</option>
                  <option value="Advisory Board">Advisory Board</option>
                  <option value="General Committee">General Committee</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Presided By (Chairperson)
                </label>
                <input
                  type="text"
                  value={content.meeting?.presidedBy || ""}
                  onChange={(e) => handleUpdateMeeting({ presidedBy: e.target.value })}
                  placeholder="e.g. Dean of Engineering"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Next Scheduled Meeting Date
                </label>
                <input
                  type="date"
                  value={content.meeting?.nextMeetingDate || ""}
                  onChange={(e) => handleUpdateMeeting({ nextMeetingDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                />
              </div>
            </div>

            {/* Agenda Items */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Agenda Items
              </label>
              <div className="flex gap-2 mb-2.5">
                <input
                  type="text"
                  value={newAgendaItem}
                  onChange={(e) => setNewAgendaItem(e.target.value)}
                  placeholder="Add formal agenda item..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newAgendaItem.trim()) {
                      e.preventDefault();
                      const current = content.meeting?.agendaItems || [];
                      handleUpdateMeeting({ agendaItems: [...current, newAgendaItem.trim()] });
                      setNewAgendaItem("");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newAgendaItem.trim()) {
                      const current = content.meeting?.agendaItems || [];
                      handleUpdateMeeting({ agendaItems: [...current, newAgendaItem.trim()] });
                      setNewAgendaItem("");
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  Add Agenda
                </button>
              </div>

              {(content.meeting?.agendaItems || []).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 mb-1"
                >
                  <span>
                    <strong>Item {idx + 1}:</strong> {item}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (content.meeting?.agendaItems || []).filter((_, i) => i !== idx);
                      handleUpdateMeeting({ agendaItems: updated });
                    }}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Resolutions Passed */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Resolutions & Decisions Ratified
              </label>
              <div className="flex gap-2 mb-2.5">
                <input
                  type="text"
                  value={newResolution}
                  onChange={(e) => setNewResolution(e.target.value)}
                  placeholder="Add ratified resolution (e.g. Resolution 26-01: Approved lab budget)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newResolution.trim()) {
                      e.preventDefault();
                      const current = content.meeting?.resolutionsPassed || [];
                      handleUpdateMeeting({ resolutionsPassed: [...current, newResolution.trim()] });
                      setNewResolution("");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newResolution.trim()) {
                      const current = content.meeting?.resolutionsPassed || [];
                      handleUpdateMeeting({ resolutionsPassed: [...current, newResolution.trim()] });
                      setNewResolution("");
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
                >
                  Add Resolution
                </button>
              </div>

              {(content.meeting?.resolutionsPassed || []).map((res, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-50/40 border border-emerald-200 text-xs text-emerald-900 mb-1"
                >
                  <span className="font-medium">{res}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (content.meeting?.resolutionsPassed || []).filter((_, i) => i !== idx);
                      handleUpdateMeeting({ resolutionsPassed: updated });
                    }}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Action Items & Assignee Tracking
            </h3>

            {/* Add Action Item Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="sm:col-span-6">
                <input
                  type="text"
                  value={newActionItemDesc}
                  onChange={(e) => setNewActionItemDesc(e.target.value)}
                  placeholder="Action item task description..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>
              <div className="sm:col-span-3">
                <input
                  type="text"
                  value={newActionAssignee}
                  onChange={(e) => setNewActionAssignee(e.target.value)}
                  placeholder="Assignee (e.g. Dr. Miller)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="date"
                  value={newActionDeadline}
                  onChange={(e) => setNewActionDeadline(e.target.value)}
                  className="w-full px-2 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>
              <div className="sm:col-span-1">
                <button
                  type="button"
                  onClick={handleAddActionItem}
                  className="w-full h-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Items Table */}
            {((content.meeting?.actionItems || []).length === 0) ? (
              <p className="text-xs text-slate-500 italic py-2">
                No action items tracked yet. Record assigned tasks to include an accountability matrix in the meeting minutes.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Action Item</th>
                      <th className="py-2.5 px-3">Assignee</th>
                      <th className="py-2.5 px-3">Deadline</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(content.meeting?.actionItems || []).map((action) => (
                      <tr key={action.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-medium text-slate-900">{action.action}</td>
                        <td className="py-2.5 px-3 text-slate-600">{action.assignedTo}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono">{action.deadline}</td>
                        <td className="py-2.5 px-3">
                          <button
                            type="button"
                            onClick={() => handleToggleActionStatus(action.id)}
                            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                              action.status === "Completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : action.status === "In Progress"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {action.status} ↺
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveActionItem(action.id)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. WORKSHOP: LAB EXERCISES & SKILL EVALUATION                             */}
      {/* ========================================================================= */}
      {eventType === "Workshop" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Laptop className="w-5 h-5 text-purple-600" />
              Technical Rigor & Practical Lab Objectives
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Technical Skill Level
                </label>
                <select
                  value={content.workshop?.skillLevel || "Intermediate"}
                  onChange={(e) =>
                    handleUpdateWorkshop({
                      skillLevel: e.target.value as NonNullable<typeof content.workshop>["skillLevel"],
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white"
                >
                  <option value="Beginner">Beginner (Fundamental Concepts & Setup)</option>
                  <option value="Intermediate">Intermediate (Hands-on Architecture & Implementation)</option>
                  <option value="Advanced">Advanced (Production Optimization & Security)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Certification Awarded
                </label>
                <label className="flex items-center gap-2.5 mt-2 text-sm text-slate-800 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={content.workshop?.certificationOffered ?? true}
                    onChange={(e) => handleUpdateWorkshop({ certificationOffered: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300"
                  />
                  <span>Formal Certificate of Practical Completion Issued</span>
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Take-Home Deliverable / Capstone Code Artifact
                </label>
                <input
                  type="text"
                  value={content.workshop?.takeHomeDeliverable || ""}
                  onChange={(e) => handleUpdateWorkshop({ takeHomeDeliverable: e.target.value })}
                  placeholder="e.g. Containerized production microservice repository deployed to cluster"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>

            {/* Software Tools & SDKs Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Software Tools & Toolchain
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTool}
                  onChange={(e) => setNewTool(e.target.value)}
                  placeholder="Add tool/SDK (e.g. Docker, PyTorch)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newTool.trim()) {
                      e.preventDefault();
                      const current = content.workshop?.softwareToolsUsed || [];
                      handleUpdateWorkshop({ softwareToolsUsed: [...current, newTool.trim()] });
                      setNewTool("");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newTool.trim()) {
                      const current = content.workshop?.softwareToolsUsed || [];
                      handleUpdateWorkshop({ softwareToolsUsed: [...current, newTool.trim()] });
                      setNewTool("");
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold"
                >
                  Add Tool
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(content.workshop?.softwareToolsUsed || []).map((tool, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-xs font-medium"
                  >
                    <span>{tool}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (content.workshop?.softwareToolsUsed || []).filter((_, i) => i !== idx);
                        handleUpdateWorkshop({ softwareToolsUsed: updated });
                      }}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Hands-on Lab Exercises */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hands-on Lab Exercises & Milestones
              </label>
              <div className="flex gap-2 mb-2.5">
                <input
                  type="text"
                  value={newLabExercise}
                  onChange={(e) => setNewLabExercise(e.target.value)}
                  placeholder="Add lab exercise title (e.g. Lab 1: Configuring automated telemetry)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newLabExercise.trim()) {
                      e.preventDefault();
                      const current = content.workshop?.handsOnExercises || [];
                      handleUpdateWorkshop({ handsOnExercises: [...current, newLabExercise.trim()] });
                      setNewLabExercise("");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newLabExercise.trim()) {
                      const current = content.workshop?.handsOnExercises || [];
                      handleUpdateWorkshop({ handsOnExercises: [...current, newLabExercise.trim()] });
                      setNewLabExercise("");
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  Add Lab
                </button>
              </div>

              {(content.workshop?.handsOnExercises || []).map((lab, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 mb-1"
                >
                  <span>
                    <strong>Milestone {idx + 1}:</strong> {lab}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (content.workshop?.handsOnExercises || []).filter((_, i) => i !== idx);
                      handleUpdateWorkshop({ handsOnExercises: updated });
                    }}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pre vs Post Assessment Visual Meter */}
          <div className="bg-purple-50/50 rounded-2xl border border-purple-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Percent className="w-4 h-4 text-purple-600" />
              Quantified Student Skill Attainment (Pre vs Post Assessment)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pre-Workshop Assessment Avg (%): {content.workshop?.preAssessmentAverage ?? 45}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={content.workshop?.preAssessmentAverage ?? 45}
                  onChange={(e) => handleUpdateWorkshop({ preAssessmentAverage: Number(e.target.value) })}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Post-Workshop Assessment Avg (%): {content.workshop?.postAssessmentAverage ?? 88}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={content.workshop?.postAssessmentAverage ?? 88}
                  onChange={(e) => handleUpdateWorkshop({ postAssessmentAverage: Number(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Calculated Learning Gain */}
            {(() => {
              const pre = content.workshop?.preAssessmentAverage ?? 45;
              const post = content.workshop?.postAssessmentAverage ?? 88;
              const gain = Math.max(0, post - pre);
              return (
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-purple-200/80 text-xs">
                  <span className="font-semibold text-slate-700">Measured Pedagogical Competency Gain:</span>
                  <span className="font-bold text-emerald-700 text-sm">+{gain}% Attainment Surge</span>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. EXHIBITION & SOCIAL: FOOTFALL, STALLS & SHOWCASE                       */}
      {/* ========================================================================= */}
      {(eventType === "Exhibition" || eventType === "Social") && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-rose-600" />
              Exhibition Footfall & Showcase Demographics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Total Project Demonstrations / Stalls
                </label>
                <input
                  type="number"
                  value={content.exhibition?.stallsOrBoothsCount || 0}
                  onChange={(e) => handleUpdateExhibition({ stallsOrBoothsCount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estimated Public / Campus Footfall
                </label>
                <input
                  type="number"
                  value={content.exhibition?.estimatedFootfall || 0}
                  onChange={(e) => handleUpdateExhibition({ estimatedFootfall: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Best Demonstration / Exhibit of the Year Award
                </label>
                <input
                  type="text"
                  value={content.exhibition?.bestExhibitAward || ""}
                  onChange={(e) => handleUpdateExhibition({ bestExhibitAward: e.target.value })}
                  placeholder="e.g. Solar-powered autonomous telemetry Rover"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Press & Media Citations / Publication Links
                </label>
                <input
                  type="text"
                  value={content.exhibition?.mediaCoverageLinks || ""}
                  onChange={(e) => handleUpdateExhibition({ mediaCoverageLinks: e.target.value })}
                  placeholder="e.g. University Daily Gazette & Regional News Broadcast"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>

            {/* Highlight Exhibits */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Highlight Displays & Notable Attractions
              </label>
              <div className="flex gap-2 mb-2.5">
                <input
                  type="text"
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  placeholder="Add notable exhibit or attraction..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newHighlight.trim()) {
                      e.preventDefault();
                      const current = content.exhibition?.highlightExhibits || [];
                      handleUpdateExhibition({ highlightExhibits: [...current, newHighlight.trim()] });
                      setNewHighlight("");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newHighlight.trim()) {
                      const current = content.exhibition?.highlightExhibits || [];
                      handleUpdateExhibition({ highlightExhibits: [...current, newHighlight.trim()] });
                      setNewHighlight("");
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  Add Attraction
                </button>
              </div>

              {(content.exhibition?.highlightExhibits || []).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 mb-1"
                >
                  <span>
                    <strong>Exhibit {idx + 1}:</strong> {item}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (content.exhibition?.highlightExhibits || []).filter((_, i) => i !== idx);
                      handleUpdateExhibition({ highlightExhibits: updated });
                    }}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onPrevious}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous: Guests & Speakers</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <span>Next: Photo Gallery</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
