/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { TabNavigation, TabId } from "./components/TabNavigation";
import { EventDetailsTab } from "./components/tabs/EventDetailsTab";
import { AttendanceTab } from "./components/tabs/AttendanceTab";
import { SummaryTab } from "./components/tabs/SummaryTab";
import { GuestsTab } from "./components/tabs/GuestsTab";
import { ImagesTab } from "./components/tabs/ImagesTab";
import { PreviewTab } from "./components/tabs/PreviewTab";
import { SpecializedReportTab } from "./components/tabs/SpecializedReportTab";
import { Dashboard } from "./components/Dashboard";
import { AuthModal } from "./components/AuthModal";
import { GeminiChatbot } from "./components/GeminiChatbot";
import { TemplatesManagerModal } from "./components/custom_templates/TemplatesManagerModal";
import { LatexTransformerModal } from "./components/custom_templates/LatexTransformerModal";
import { TemplateCustomizerModal } from "./components/custom_templates/TemplateCustomizerModal";
import { LandingPage } from "./components/LandingPage";
import { TutorialModal } from "./components/TutorialModal";
import { ReganStudio } from "./components/ReganStudio";
import { Sparkles, Bot } from "lucide-react";
import {
  Report,
  User,
  EventType,
  EventDetails,
  AttendanceData,
  SummaryData,
  Guest,
  ReportImage,
  ReportTemplate,
  CustomTemplate,
} from "./types";
import { createReportFromTemplate } from "./data/templates";
import { incrementTemplateUsage, getCustomTemplates } from "./lib/customTemplatesStorage";
import { CreateReportWizard } from "./components/CreateReportWizard";
import { LiveDocumentCard } from "./components/LiveDocumentCard";
import {
  syncToCloudStorage,
  checkCloudSyncConnection,
  getLocalLastSyncTime,
} from "./lib/cloudSync";
import {
  getStoredReports,
  saveStoredReports,
  saveSingleReport,
  getStoredUser,
  saveStoredUser,
  createNewBlankReport,
  duplicateReport,
  deleteReportById,
} from "./lib/storage";
import {
  subscribeToAuth,
  testConnection,
  getUserProfile,
  fetchUserReportsFromFirestore,
  saveReportToFirestore,
  deleteReportFromFirestore,
  saveUserReportOrder,
} from "./lib/firebase";

export default function App() {
  const [reports, setReports] = useState<Report[]>(() => getStoredReports());
  const [currentUser, setCurrentUser] = useState<User>(() => getStoredUser());
  const [currentReportId, setCurrentReportId] = useState<string>(() => {
    const list = getStoredReports();
    return list[0]?.id || "";
  });

  const [activeView, setActiveView] = useState<"landing" | "editor" | "dashboard">("landing");
  const [activeTab, setActiveTab] = useState<TabId>("details");
  const [isSaving, setIsSaving] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<"synced" | "syncing" | "error">("synced");
  const [lastSyncedTime, setLastSyncedTime] = useState<Date>(() => getLocalLastSyncTime());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPromptReason, setAuthPromptReason] = useState<"save" | "download" | "dashboard" | "general" | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTemplatesManagerOpen, setIsTemplatesManagerOpen] = useState(false);
  const [isLatexTransformerOpen, setIsLatexTransformerOpen] = useState(false);
  const [isTemplateCustomizerOpen, setIsTemplateCustomizerOpen] = useState(false);
  const [editingCustomTemplate, setEditingCustomTemplate] = useState<CustomTemplate | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isReganOpen, setIsReganOpen] = useState(false);
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [isLiveSplitPreview, setIsLiveSplitPreview] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isAuthenticated = currentUser.provider === "google" || currentUser.provider === "email";

  const handleOpenAuthModal = (reason: "save" | "download" | "dashboard" | "general" = "general") => {
    setAuthPromptReason(reason);
    setIsAuthModalOpen(true);
  };

  // Initial startup: cloud sync check, Firebase connection test, and Firebase Auth subscription
  useEffect(() => {
    checkCloudSyncConnection().then((info) => {
      setLastSyncedTime(info.lastSyncedAt);
      setCloudSyncStatus(info.connected ? "synced" : "error");
    });

    // Test Firestore connection on boot
    testConnection();

    // Subscribe to Firebase Auth state
    const unsubscribe = subscribeToAuth(async (fbUser) => {
      if (fbUser) {
        const updated: User = {
          id: fbUser.uid,
          name: fbUser.displayName || "Event Organizer",
          email: fbUser.email || "",
          photoURL: fbUser.photoURL || undefined,
          organization: "",
          provider: fbUser.providerData?.[0]?.providerId === "google.com" ? "google" : "email",
          emailVerified: fbUser.emailVerified,
        };

        const profile = await getUserProfile(fbUser.uid);
        if (profile) {
          if (profile.organization) updated.organization = profile.organization;
          if (profile.name) updated.name = profile.name;
          if (profile.reportOrder) updated.reportOrder = profile.reportOrder;
        }

        setCurrentUser(updated);
        saveStoredUser(updated);

        // Fetch user's persistent reports from Firestore
        const firestoreReports = await fetchUserReportsFromFirestore(fbUser.uid, profile?.reportOrder);
        if (firestoreReports.length > 0) {
          setReports(firestoreReports);
          setCurrentReportId(firestoreReports[0].id);
          saveStoredReports(firestoreReports);
        }
      } else {
        // If not authenticated, ensure user stays on public homepage
        setActiveView("landing");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleForceCloudSync = async () => {
    setCloudSyncStatus("syncing");
    try {
      const res = await syncToCloudStorage(reports, getCustomTemplates(), true);
      setCloudSyncStatus(res.success ? "synced" : "error");
      setLastSyncedTime(res.timestamp);
    } catch {
      setCloudSyncStatus("synced");
      setLastSyncedTime(new Date());
    }
  };

  const currentReport = reports.find((r) => r.id === currentReportId) || reports[0] || null;

  // Auto-save logic: debounced saving whenever currentReport updates
  const queueAutoSave = (updatedReport: Report) => {
    setIsSaving(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      saveSingleReport(updatedReport);
      setIsSaving(false);
      if (isAuthenticated) {
        saveReportToFirestore(updatedReport).catch(console.warn);
      }
      try {
        const res = await syncToCloudStorage(
          [updatedReport, ...reports.filter((r) => r.id !== updatedReport.id)],
          getCustomTemplates(),
          false
        );
        setLastSyncedTime(res.timestamp);
        setCloudSyncStatus("synced");
      } catch {
        // Local persistence already guaranteed
      }
    }, 600);
  };

  // Helper to update parts of the current report
  const updateCurrentReport = (modifier: (prev: Report) => Report) => {
    if (!currentReport) return;
    const nextReport = modifier(currentReport);
    setReports((prev) =>
      prev.map((r) => (r.id === nextReport.id ? nextReport : r))
    );
    queueAutoSave(nextReport);
  };

  // Event handlers for tab content changes
  const handleDetailsChange = (updated: Partial<EventDetails>) => {
    updateCurrentReport((prev) => ({
      ...prev,
      title: updated.name !== undefined && updated.name.trim() ? updated.name.trim() : prev.title,
      content: {
        ...prev.content,
        eventDetails: {
          ...prev.content.eventDetails,
          ...updated,
        },
      },
    }));
  };

  const handleAttendanceChange = (updated: Partial<AttendanceData>) => {
    updateCurrentReport((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        attendance: {
          ...prev.content.attendance,
          ...updated,
        },
      },
    }));
  };

  const handleSummaryChange = (updated: Partial<SummaryData>) => {
    updateCurrentReport((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        summary: {
          ...prev.content.summary,
          ...updated,
        },
      },
    }));
  };

  const handleGuestsChange = (updatedGuests: Guest[]) => {
    updateCurrentReport((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        guests: updatedGuests,
      },
    }));
  };

  const handleImagesChange = (updatedImages: ReportImage[]) => {
    updateCurrentReport((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        images: updatedImages,
      },
    }));
  };

  const handleUpdateStatus = (status: Report["status"]) => {
    updateCurrentReport((prev) => ({
      ...prev,
      status,
    }));
  };

  const handleUpdateTitle = (newTitle: string) => {
    updateCurrentReport((prev) => ({
      ...prev,
      title: newTitle,
      content: {
        ...prev.content,
        eventDetails: {
          ...prev.content.eventDetails,
          name: newTitle,
        },
      },
    }));
  };

  const handleTagsChange = (newTags: string[]) => {
    updateCurrentReport((prev) => ({
      ...prev,
      tags: newTags,
    }));
  };

  const handleUpdateReportTags = (reportId: string, tags: string[]) => {
    setReports((prev) => {
      const updated = prev.map((r) => (r.id === reportId ? { ...r, tags } : r));
      const targetReport = updated.find((r) => r.id === reportId);
      if (targetReport) {
        queueAutoSave(targetReport);
      }
      return updated;
    });
  };

  // Report lifecycle actions: Trigger modern 3-path creation wizard
  const handleNewReport = () => {
    if (!isAuthenticated) {
      handleOpenAuthModal("save");
      return;
    }
    setIsCreateWizardOpen(true);
  };

  const handleStartBlankFromWizard = async (eventType: EventType = "Conference", customTitle?: string) => {
    const fresh = createNewBlankReport(currentUser);
    const title = customTitle || `${eventType} Proceedings Report`;
    const updated: Report = {
      ...fresh,
      title,
      content: {
        ...fresh.content,
        eventDetails: {
          ...fresh.content.eventDetails,
          name: title,
          eventType,
        },
      },
    };
    setReports((prev) => [updated, ...prev]);
    setCurrentReportId(updated.id);
    setActiveView("editor");
    setActiveTab("details");
    saveReportToFirestore(updated).catch(console.warn);

    // Auto-tagging with Gemini in background on new report creation
    try {
      const resp = await fetch("/api/gemini/suggest-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          eventType,
          organization: updated.content.eventDetails.organization || currentUser.organization,
          department: updated.content.eventDetails.department,
        }),
      });
      const resData = await resp.json();
      if (resData.success && Array.isArray(resData.tags) && resData.tags.length > 0) {
        updateCurrentReport((prev) => ({
          ...prev,
          tags: Array.from(new Set([...(prev.tags || []), ...resData.tags])),
        }));
      }
    } catch (e) {
      console.warn("Initial auto-tagging silent fallback:", e);
    }
  };

  const handleStartTemplateFromWizard = (templateId: string) => {
    if (templateId === "conf-naac") {
      handleStartBlankFromWizard("Conference", "International Conference on Computational Intelligence (ICCI-2026)");
    } else if (templateId === "hack-tech") {
      handleStartBlankFromWizard("Hackathon", "National Student AI & Cloud Hackathon 2026");
    } else if (templateId === "work-devops") {
      handleStartBlankFromWizard("Workshop", "Hands-on DevOps & Microservices Technical Workshop");
    } else if (templateId === "meet-board") {
      handleStartBlankFromWizard("Meeting", "Department Board of Studies Meeting");
    } else {
      handleStartBlankFromWizard("Conference");
    }
  };

  const handleSelectReport = (id: string) => {
    if (!isAuthenticated) {
      handleOpenAuthModal("dashboard");
      return;
    }
    setCurrentReportId(id);
    setActiveView("editor");
  };

  const handleSelectTemplate = (template: ReportTemplate) => {
    if (!isAuthenticated) {
      handleOpenAuthModal("save");
      return;
    }
    const templateReport = createReportFromTemplate(template, currentUser);
    saveSingleReport(templateReport);
    setReports((prev) => [templateReport, ...prev]);
    setCurrentReportId(templateReport.id);
    setActiveView("editor");
    setActiveTab("details");
    saveReportToFirestore(templateReport).catch(console.warn);
  };

  const handleSelectCustomTemplate = (customTemplate: CustomTemplate) => {
    incrementTemplateUsage(customTemplate.id);
    const fresh = createNewBlankReport(currentUser);
    const updated: Report = {
      ...fresh,
      title: `${customTemplate.name} Report`,
      customTemplateId: customTemplate.id,
      templateVersionUsed: customTemplate.version,
      content: {
        ...fresh.content,
        eventDetails: {
          ...fresh.content.eventDetails,
          name: `${customTemplate.name} Session`,
        },
        sponsors: customTemplate.sponsors || [],
        awards: customTemplate.awards || [],
      },
    };
    saveSingleReport(updated);
    setReports((prev) => [updated, ...prev]);
    setCurrentReportId(updated.id);
    setActiveView("editor");
    setActiveTab("details");
  };

  const handleCreateReportFromLatex = (
    template: CustomTemplate,
    sampleData?: any
  ) => {
    incrementTemplateUsage(template.id);
    const fresh = createNewBlankReport(currentUser);
    const updated: Report = {
      ...fresh,
      title: sampleData?.title || `${template.name} Report`,
      customTemplateId: template.id,
      templateVersionUsed: template.version,
      content: {
        ...fresh.content,
        eventDetails: {
          ...fresh.content.eventDetails,
          name: sampleData?.eventName || sampleData?.title || template.name,
          date: sampleData?.date || fresh.content.eventDetails.date,
          location: sampleData?.location || fresh.content.eventDetails.location,
          organization:
            sampleData?.organization || currentUser.organization || "Academic Institution",
          eventType: sampleData?.eventType || "Conference",
        },
        attendance: sampleData
          ? {
              totalAttendees: sampleData.totalAttendees || 120,
              isApproximate: false,
              notes: "Generated from LaTeX symposium turnout and headcount data.",
              facultyCount: sampleData.facultyCount || 30,
              studentCount: sampleData.studentCount || 70,
              externalCount: sampleData.externalCount || 20,
              virtualAttendees: sampleData.virtualAttendees || 0,
              satisfactionRating: sampleData.satisfactionRating || 4.9,
            }
          : fresh.content.attendance,
        summary: sampleData
          ? {
              rawNotes: sampleData.summaryNotes || "",
              polishedText: sampleData.summaryPolished || sampleData.summaryNotes || "",
              finalizedText: sampleData.summaryPolished || sampleData.summaryNotes || "",
              tone: "Formal",
              regenerateCount: 0,
              isFinalized: true,
            }
          : fresh.content.summary,
        guests: sampleData?.guests?.length
          ? sampleData.guests.map((g: any, i: number) => ({
              id: "guest_latex_" + Math.random().toString(36).substring(2, 8) + "_" + i,
              name: g.name,
              title: g.title,
              company: g.company,
              role: g.role || "Keynote Speaker",
              bio: g.bio,
              bioRegenerateCount: 0,
            }))
          : fresh.content.guests,
        sponsors: sampleData?.sponsors || template.sponsors || [],
        awards: sampleData?.awards || template.awards || [],
      },
    };
    saveSingleReport(updated);
    setReports((prev) => [updated, ...prev]);
    setCurrentReportId(updated.id);
    setActiveView("editor");
    setActiveTab("preview");
  };

  const handleApplyCustomTemplateToCurrent = (customTemplate: CustomTemplate) => {
    incrementTemplateUsage(customTemplate.id);
    updateCurrentReport((prev) => ({
      ...prev,
      customTemplateId: customTemplate.id,
      templateVersionUsed: customTemplate.version,
      content: {
        ...prev.content,
        sponsors:
          prev.content.sponsors && prev.content.sponsors.length > 0
            ? prev.content.sponsors
            : customTemplate.sponsors || [],
        awards:
          prev.content.awards && prev.content.awards.length > 0
            ? prev.content.awards
            : customTemplate.awards || [],
      },
    }));
  };

  const handleApplyTemplateToCurrent = (template: ReportTemplate) => {
    updateCurrentReport((prev) => ({
      ...prev,
      title:
        prev.title === "Untitled Event Report" || !prev.title
          ? template.defaultContent.title
          : prev.title,
      content: {
        ...prev.content,
        eventDetails: {
          ...prev.content.eventDetails,
          ...template.defaultContent.eventDetails,
          name:
            prev.content.eventDetails.name ||
            template.defaultContent.eventDetails.name ||
            template.defaultContent.title,
        },
        attendance:
          prev.content.attendance.totalAttendees === 0
            ? { ...prev.content.attendance, ...template.defaultContent.attendance }
            : prev.content.attendance,
        summary:
          !prev.content.summary.rawNotes.trim()
            ? { ...prev.content.summary, ...template.defaultContent.summary }
            : prev.content.summary,
        guests:
          prev.content.guests.length === 0
            ? template.defaultContent.guests.map((g, i) => ({
                ...g,
                id: "guest_" + Math.random().toString(36).substring(2, 9) + "_" + i,
              }))
            : prev.content.guests,
      },
    }));
  };

  const handleDuplicateReport = (source: Report) => {
    if (!isAuthenticated) {
      handleOpenAuthModal("save");
      return;
    }
    const copy = duplicateReport(source);
    setReports((prev) => [copy, ...prev]);
    setCurrentReportId(copy.id);
    setActiveView("editor");
    setActiveTab("preview");
    saveReportToFirestore(copy).catch(console.warn);
  };

  const handleDeleteReport = (id: string) => {
    const remaining = deleteReportById(id);
    setReports(remaining);
    if (currentReportId === id) {
      if (remaining.length > 0) {
        setCurrentReportId(remaining[0].id);
      } else {
        setCurrentReportId("");
        setActiveView("dashboard");
      }
    }
    if (isAuthenticated) {
      deleteReportFromFirestore(id).catch(console.warn);
    }
  };

  const handleSaveUser = (newUser: User) => {
    setCurrentUser(newUser);
    saveStoredUser(newUser);
    if (authPromptReason === "dashboard") {
      setActiveView("dashboard");
    } else if (authPromptReason === "save") {
      setActiveView("editor");
      if (!currentReport) {
        const fresh = createNewBlankReport(newUser);
        setReports((prev) => [fresh, ...prev]);
        setCurrentReportId(fresh.id);
        setActiveTab("details");
      }
    } else if (authPromptReason === "download") {
      setActiveView("editor");
      setActiveTab("preview");
    }
  };

  const handleReorderReports = async (newOrderedReports: Report[]) => {
    setReports(newOrderedReports);
    saveStoredReports(newOrderedReports);
    const orderIds = newOrderedReports.map((r) => r.id);

    // Update currentUser state and localStorage
    const updatedUser: User = {
      ...currentUser,
      reportOrder: orderIds,
    };
    setCurrentUser(updatedUser);
    saveStoredUser(updatedUser);

    // Persist to Firestore profile if authenticated
    if (currentUser.id && (currentUser.provider === "google" || currentUser.provider === "email")) {
      try {
        await saveUserReportOrder(currentUser.id, orderIds);
      } catch (err) {
        console.warn("Could not persist report order in Firestore profile:", err);
      }
    }
  };

  const handleApplyChatToSummary = (text: string) => {
    if (!currentReport) return;
    updateCurrentReport((prev) => {
      const existing =
        prev.content.summary.finalizedText ||
        prev.content.summary.polishedText ||
        prev.content.summary.rawNotes;
      return {
        ...prev,
        content: {
          ...prev.content,
          summary: {
            ...prev.content.summary,
            finalizedText: existing ? `${existing}\n\n${text}` : text,
            isFinalized: true,
          },
        },
      };
    });
  };

  const handleApplyReganReport = (generatedReport: Partial<Report>) => {
    if (currentReport) {
      const updated: Report = {
        ...currentReport,
        ...generatedReport,
        id: currentReport.id,
        title: generatedReport.title || currentReport.title,
        updatedAt: new Date().toISOString(),
        content: {
          ...currentReport.content,
          ...(generatedReport.content || {}),
        },
      };
      updateCurrentReport(() => updated);
    } else {
      const newRep: Report = {
        id: "report_" + Math.random().toString(36).substring(2, 9),
        userId: currentUser.id,
        title: generatedReport.title || "Synthesized Event Proceedings",
        status: "completed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: generatedReport.tags || ["Academic", "Proceedings"],
        content: generatedReport.content as any,
      };
      const updatedList = [newRep, ...reports];
      setReports(updatedList);
      saveStoredReports(updatedList);
      setCurrentReportId(newRep.id);
    }
    setActiveView("editor");
    setActiveTab("preview");
    setIsReganOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900">
      {/* App Header */}
      <Header
        currentReport={currentReport}
        activeView={activeView}
        setActiveView={setActiveView}
        onNewReport={handleNewReport}
        onSelectReport={handleSelectReport}
        allReports={reports}
        isSaving={isSaving}
        currentUser={currentUser}
        onOpenAuth={() => handleOpenAuthModal("general")}
        onUpdateTitle={handleUpdateTitle}
        onUpdateTags={handleTagsChange}
        onOpenChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        onOpenTemplates={() => setIsTemplatesManagerOpen(true)}
        onOpenLatexDropin={() => setIsLatexTransformerOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenRegan={() => setIsReganOpen(true)}
        cloudSyncStatus={cloudSyncStatus}
        lastSyncedAt={lastSyncedTime}
        onForceCloudSync={handleForceCloudSync}
        customTemplatesCount={getCustomTemplates().length}
      />

      {/* Main View Area */}
      {activeView === "landing" ? (
        <main className="flex-1">
          <LandingPage
            currentUser={currentUser}
            onOpenDashboard={() =>
              isAuthenticated ? setActiveView("dashboard") : handleOpenAuthModal("dashboard")
            }
            onNewReport={handleNewReport}
            onSelectTemplate={handleSelectTemplate}
            onOpenAuth={() => handleOpenAuthModal("general")}
            onOpenTutorial={() => setIsTutorialOpen(true)}
            onRequireAuth={(reason) => handleOpenAuthModal(reason)}
          />
        </main>
      ) : activeView === "dashboard" ? (
        <main className="flex-1">
          <Dashboard
            reports={reports}
            currentUser={currentUser}
            onOpenReport={handleSelectReport}
            onNewReport={handleNewReport}
            onSelectTemplate={handleSelectTemplate}
            onDuplicateReport={handleDuplicateReport}
            onDeleteReport={handleDeleteReport}
            onReorderReports={handleReorderReports}
            onSelectCustomTemplate={handleSelectCustomTemplate}
            onOpenTemplateManager={() => setIsTemplatesManagerOpen(true)}
            onOpenLatexDropin={() => setIsLatexTransformerOpen(true)}
            onOpenCreateTemplate={() => {
              setEditingCustomTemplate(null);
              setIsTemplateCustomizerOpen(true);
            }}
            onEditCustomTemplate={(tpl) => {
              setEditingCustomTemplate(tpl);
              setIsTemplateCustomizerOpen(true);
            }}
            onUpdateReportTags={handleUpdateReportTags}
            onOpenAuth={() => handleOpenAuthModal("general")}
            onOpenLanding={() => setActiveView("landing")}
            onOpenTutorial={() => setIsTutorialOpen(true)}
            onOpenRegan={() => setIsReganOpen(true)}
          />
        </main>
      ) : currentReport ? (
        <main className="flex-1 flex flex-col">
          {/* 6-Tab Navigation Bar */}
          <TabNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            report={currentReport}
          />

          {/* Sub-bar for Live Preview Split Toggle */}
          {activeTab !== "preview" && (
            <div className="bg-slate-50 border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2">
              <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  Editing: <strong className="text-slate-800 capitalize">{activeTab}</strong> Section
                </span>

                <button
                  type="button"
                  onClick={() => setIsLiveSplitPreview(!isLiveSplitPreview)}
                  className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isLiveSplitPreview
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-white text-slate-700 hover:text-indigo-600 border border-slate-200"
                  }`}
                  title="Toggle real-time side-by-side vector paper preview"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isLiveSplitPreview ? "Split View (Active)" : "Enable Live Split Canvas"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Tab View with Optional Live Side-by-Side Preview */}
          <div className="flex-1 pb-16">
            {isLiveSplitPreview && activeTab !== "preview" ? (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Active Form Step */}
                <div className="lg:col-span-7 space-y-6">
                  {activeTab === "details" && (
                    <EventDetailsTab
                      details={currentReport.content.eventDetails}
                      onChange={handleDetailsChange}
                      tags={currentReport.tags || []}
                      onTagsChange={handleTagsChange}
                      onNext={() => setActiveTab("attendance")}
                      onApplyTemplate={handleApplyTemplateToCurrent}
                      onApplyCustomTemplate={handleApplyCustomTemplateToCurrent}
                    />
                  )}

                  {activeTab === "attendance" && (
                    <AttendanceTab
                      attendance={currentReport.content.attendance}
                      onChange={handleAttendanceChange}
                      onPrevious={() => setActiveTab("details")}
                      onNext={() => setActiveTab("summary")}
                    />
                  )}

                  {activeTab === "summary" && (
                    <SummaryTab
                      summary={currentReport.content.summary}
                      eventDetails={currentReport.content.eventDetails}
                      onChange={handleSummaryChange}
                      onPrevious={() => setActiveTab("attendance")}
                      onNext={() => setActiveTab("guests")}
                    />
                  )}

                  {activeTab === "guests" && (
                    <GuestsTab
                      guests={currentReport.content.guests}
                      onChange={handleGuestsChange}
                      onPrevious={() => setActiveTab("summary")}
                      onNext={() => setActiveTab("specialized")}
                    />
                  )}

                  {activeTab === "specialized" && (
                    <SpecializedReportTab
                      report={currentReport}
                      onUpdateReport={updateCurrentReport}
                      onPrevious={() => setActiveTab("guests")}
                      onNext={() => setActiveTab("images")}
                    />
                  )}

                  {activeTab === "images" && (
                    <ImagesTab
                      images={currentReport.content.images}
                      onChange={handleImagesChange}
                      onPrevious={() => setActiveTab("specialized")}
                      onNext={() => setActiveTab("preview")}
                    />
                  )}
                </div>

                {/* Right Column: Live Vector Document Desk */}
                <div className="lg:col-span-5 hidden lg:block sticky top-28">
                  <LiveDocumentCard
                    report={currentReport}
                    user={currentUser}
                    onOpenFullPreview={() => setActiveTab("preview")}
                  />
                </div>
              </div>
            ) : (
              <div>
                {activeTab === "details" && (
                  <EventDetailsTab
                    details={currentReport.content.eventDetails}
                    onChange={handleDetailsChange}
                    tags={currentReport.tags || []}
                    onTagsChange={handleTagsChange}
                    onNext={() => setActiveTab("attendance")}
                    onApplyTemplate={handleApplyTemplateToCurrent}
                    onApplyCustomTemplate={handleApplyCustomTemplateToCurrent}
                  />
                )}

                {activeTab === "attendance" && (
                  <AttendanceTab
                    attendance={currentReport.content.attendance}
                    onChange={handleAttendanceChange}
                    onPrevious={() => setActiveTab("details")}
                    onNext={() => setActiveTab("summary")}
                  />
                )}

                {activeTab === "summary" && (
                  <SummaryTab
                    summary={currentReport.content.summary}
                    eventDetails={currentReport.content.eventDetails}
                    onChange={handleSummaryChange}
                    onPrevious={() => setActiveTab("attendance")}
                    onNext={() => setActiveTab("guests")}
                  />
                )}

                {activeTab === "guests" && (
                  <GuestsTab
                    guests={currentReport.content.guests}
                    onChange={handleGuestsChange}
                    onPrevious={() => setActiveTab("summary")}
                    onNext={() => setActiveTab("specialized")}
                  />
                )}

                {activeTab === "specialized" && (
                  <SpecializedReportTab
                    report={currentReport}
                    onUpdateReport={updateCurrentReport}
                    onPrevious={() => setActiveTab("guests")}
                    onNext={() => setActiveTab("images")}
                  />
                )}

                {activeTab === "images" && (
                  <ImagesTab
                    images={currentReport.content.images}
                    onChange={handleImagesChange}
                    onPrevious={() => setActiveTab("specialized")}
                    onNext={() => setActiveTab("preview")}
                  />
                )}

                {activeTab === "preview" && (
                  <PreviewTab
                    report={currentReport}
                    user={currentUser}
                    onStatusChange={handleUpdateStatus}
                    onPrevious={() => setActiveTab("images")}
                    customTemplate={
                      currentReport?.customTemplateId
                        ? getCustomTemplates().find((t) => t.id === currentReport.customTemplateId) || editingCustomTemplate
                        : editingCustomTemplate
                    }
                    onRequireAuthForDownload={() => handleOpenAuthModal("download")}
                    onOpenCustomTemplateDesigner={() => {
                      const tpl = currentReport?.customTemplateId
                        ? getCustomTemplates().find((t) => t.id === currentReport.customTemplateId) || null
                        : null;
                      setEditingCustomTemplate(tpl);
                      setIsTemplateCustomizerOpen(true);
                    }}
                    onOpenTemplatesManager={() => setIsTemplatesManagerOpen(true)}
                  />
                )}
              </div>
            )}
          </div>
        </main>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          <button
            onClick={handleNewReport}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm"
          >
            Create Your First Report
          </button>
        </div>
      )}

      {/* Auth & Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthPromptReason(null);
        }}
        currentUser={currentUser}
        onSaveUser={handleSaveUser}
        promptReason={authPromptReason}
      />

      {/* Floating Gemini AI Assistant Trigger Button with Tooltip */}
      {!isChatOpen && (
        <div className="fixed bottom-6 right-6 z-40 group/btn">
          {/* Tooltip on hover */}
          <div
            role="tooltip"
            id="floating-ai-assistant-tooltip"
            className="absolute bottom-full right-0 mb-2.5 pointer-events-none opacity-0 translate-y-1 group-hover/btn:opacity-100 group-hover/btn:translate-y-0 group-focus-within/btn:opacity-100 group-focus-within/btn:translate-y-0 transition-all duration-200 ease-out z-50 whitespace-nowrap"
          >
            {isSaving ? (
              <div className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl border border-amber-400/80 flex items-center gap-2 relative">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-amber-200 font-bold">
                  Unsaved edits detected — Ready to summarize latest changes!
                </span>
                {/* Tooltip caret */}
                <div className="absolute top-full right-6 -mt-1 border-4 border-transparent border-t-slate-900" />
              </div>
            ) : (
              <div className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl border border-slate-700/80 flex items-center gap-1.5 relative">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Opens Gemini AI event assistant for summaries & Q&A</span>
                {/* Tooltip caret */}
                <div className="absolute top-full right-6 -mt-1 border-4 border-transparent border-t-slate-900" />
              </div>
            )}
          </div>

          <button
            id="floating-ai-assistant-btn"
            type="button"
            onClick={() => setIsChatOpen(true)}
            aria-label={
              isSaving
                ? "Unsaved edits detected. Open Gemini AI event assistant to synthesize latest edits into your report"
                : "Open Gemini AI event assistant to synthesize summaries and refine proceedings"
            }
            aria-describedby="floating-ai-assistant-tooltip"
            className={`relative overflow-hidden bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white shadow-xl hover:shadow-2xl rounded-full p-3 sm:px-4 sm:py-3 flex items-center gap-2.5 transition-all duration-300 ease-out hover:scale-105 active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 group cursor-pointer select-none ${
              isSaving
                ? "border-2 border-amber-400 shadow-amber-500/30 ring-2 ring-amber-400/50 animate-pulse focus:ring-amber-400"
                : "border border-slate-700/80 hover:border-indigo-500/50 hover:shadow-indigo-500/20 focus:ring-indigo-400"
            }`}
          >
            {/* Subtle radial gradient click ripple effect */}
            <span
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none rounded-full bg-[radial-gradient(circle_at_center,rgba(129,140,248,0.5)_0%,rgba(168,85,247,0.35)_45%,transparent_75%)] opacity-0 scale-50 transition-all duration-500 ease-out group-active:opacity-100 group-active:scale-150 group-active:duration-100"
            />

            <div
              className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-2xs transition-transform duration-200 ease-out group-hover:scale-110 group-hover:rotate-12 group-active:scale-90 ${
                isSaving ? "bg-amber-500 text-slate-950 font-bold" : "bg-indigo-600 group-hover:bg-indigo-500"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-6" />
            </div>
            <span className="relative z-10 text-xs font-bold tracking-tight hidden sm:inline text-white group-hover:text-indigo-200 transition-colors">
              {isSaving ? "Summarize Edits" : "Gemini Event AI"}
            </span>

            {/* Status Pulse Indicator */}
            {isSaving ? (
              <div className="relative z-10 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="absolute w-3.5 h-3.5 rounded-full bg-amber-400/70 animate-ping" />
              </div>
            ) : (
              <span className="relative z-10 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </div>
      )}

      {/* Gemini Multi-turn Chatbot Modal/Drawer */}
      <GeminiChatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        activeReport={currentReport}
        onApplyToSummary={handleApplyChatToSummary}
      />

      {/* Templates Manager Modal */}
      <TemplatesManagerModal
        isOpen={isTemplatesManagerOpen}
        onClose={() => setIsTemplatesManagerOpen(false)}
        onSelectTemplateForNewReport={(customTemplate) => {
          handleSelectCustomTemplate(customTemplate);
          setIsTemplatesManagerOpen(false);
        }}
        onOpenLatexDropin={() => {
          setIsTemplatesManagerOpen(false);
          setIsLatexTransformerOpen(true);
        }}
        onOpenCreateCustom={() => {
          setIsTemplatesManagerOpen(false);
          setEditingCustomTemplate(null);
          setIsTemplateCustomizerOpen(true);
        }}
        onEditCustomTemplate={(tpl) => {
          setIsTemplatesManagerOpen(false);
          setEditingCustomTemplate(tpl);
          setIsTemplateCustomizerOpen(true);
        }}
      />

      {/* LaTeX Template Transformer Drop-In Modal */}
      <LatexTransformerModal
        isOpen={isLatexTransformerOpen}
        onClose={() => setIsLatexTransformerOpen(false)}
        onSaveTemplateSuccess={(savedTemplate) => {
          if (currentReport && currentReport.customTemplateId === savedTemplate.id) {
            updateCurrentReport((prev) => ({
              ...prev,
              templateVersionUsed: savedTemplate.version,
            }));
          }
        }}
        onCreateReportFromTemplate={handleCreateReportFromLatex}
        onApplyTemplateToCurrentReport={handleApplyCustomTemplateToCurrent}
        hasActiveReport={!!currentReport}
      />

      {/* Custom Template Customizer / Pre-Design Studio Modal */}
      <TemplateCustomizerModal
        isOpen={isTemplateCustomizerOpen}
        onClose={() => setIsTemplateCustomizerOpen(false)}
        initialTemplate={editingCustomTemplate}
        onSaveSuccess={(savedTemplate) => {
          if (currentReport && currentReport.customTemplateId === savedTemplate.id) {
            updateCurrentReport((prev) => ({
              ...prev,
              templateVersionUsed: savedTemplate.version,
            }));
          }
        }}
        onApplyToCurrentReport={(savedTemplate) => {
          handleApplyCustomTemplateToCurrent(savedTemplate);
        }}
      />

      {/* Interactive Guided Tutorial Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onStartNewReport={handleNewReport}
        onOpenSampleReport={() => {
          const sample = reports[0];
          if (sample) {
            handleSelectReport(sample.id);
          }
        }}
      />

      {/* REGAN: Automated Report Synthesizer & Vibe Coding Studio */}
      {isReganOpen && (
        <ReganStudio
          currentReport={currentReport}
          currentUser={currentUser}
          onApplyReportToApp={handleApplyReganReport}
          onClose={() => setIsReganOpen(false)}
        />
      )}

      {/* 3-Path Quick Start Creation Wizard */}
      <CreateReportWizard
        isOpen={isCreateWizardOpen}
        onClose={() => setIsCreateWizardOpen(false)}
        currentUser={currentUser}
        onStartWithRegan={() => {
          setIsCreateWizardOpen(false);
          setIsReganOpen(true);
        }}
        onStartWithTemplate={(templateId) => {
          setIsCreateWizardOpen(false);
          handleStartTemplateFromWizard(templateId);
        }}
        onStartBlank={(eventType, customTitle) => {
          setIsCreateWizardOpen(false);
          handleStartBlankFromWizard(eventType, customTitle);
        }}
      />
    </div>
  );
}
