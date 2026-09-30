import React, { useState } from "react";
import { UserCheck, Plus, Trash2, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { Guest } from "../../types";

interface GuestsTabProps {
  guests: Guest[];
  onChange: (guests: Guest[]) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const GuestsTab: React.FC<GuestsTabProps> = ({
  guests,
  onChange,
  onPrevious,
  onNext,
}) => {
  const [newName, setNewName] = useState("");
  const [newDesignation, setNewDesignation] = useState("");
  const [newOrg, setNewOrg] = useState("");
  const [newRole, setNewRole] = useState<Guest["role"]>("Speaker");

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newGuest: Guest = {
      id: "gst_" + Math.random().toString(36).substring(2, 9),
      name: newName.trim(),
      designation: newDesignation.trim(),
      organization: newOrg.trim(),
      role: newRole,
      bio: `${newName.trim()} is an invited ${newRole.toLowerCase()} representing ${newOrg.trim() || "the distinguished institution"}.`,
    };

    onChange([...guests, newGuest]);
    setNewName("");
    setNewDesignation("");
    setNewOrg("");
  };

  const handleRemove = (id: string) => {
    onChange(guests.filter((g) => g.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in duration-150">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Distinguished Guests & Speakers</h2>
        <p className="text-xs text-slate-500 mt-1">
          Catalog keynote speakers, panel participants, and VIP attendees for the official roster.
        </p>
      </div>

      {/* Add New Guest Form */}
      <form onSubmit={handleAddGuest} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Add Keynote or Guest</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Speaker / Guest Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Dr. Jane Smith"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Role
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Guest["role"])}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="Keynote">Keynote Speaker</option>
              <option value="Speaker">Invited Speaker</option>
              <option value="Panelist">Panelist</option>
              <option value="Chief Guest">Chief Guest</option>
              <option value="Judge">Judge / Juror</option>
              <option value="Organizer">Committee Chair</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Title / Academic Designation
            </label>
            <input
              type="text"
              value={newDesignation}
              onChange={(e) => setNewDesignation(e.target.value)}
              placeholder="e.g. Professor of Computer Science"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Affiliated Organization / Institution
            </label>
            <input
              type="text"
              value={newOrg}
              onChange={(e) => setNewOrg(e.target.value)}
              placeholder="e.g. MIT CSAIL"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Guest to Roster</span>
          </button>
        </div>
      </form>

      {/* Guest Cards */}
      <div className="space-y-3">
        {guests.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No guests or keynote speakers added yet.
          </div>
        ) : (
          guests.map((guest) => (
            <div
              key={guest.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm shrink-0 border border-indigo-100">
                  {guest.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{guest.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {guest.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {guest.designation} {guest.organization ? `· ${guest.organization}` : ""}
                  </p>
                  {guest.bio && (
                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {guest.bio}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(guest.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                title="Remove Guest"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Nav Controls */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevious}
          className="px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Summary</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 shadow-xs"
        >
          <span>Continue to Photo Gallery</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
