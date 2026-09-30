import React, { useState } from "react";
import { Image as ImageIcon, Plus, Trash2, ArrowRight, ArrowLeft, Star } from "lucide-react";
import { ReportImage } from "../../types";

interface ImagesTabProps {
  images: ReportImage[];
  onChange: (images: ReportImage[]) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const ImagesTab: React.FC<ImagesTabProps> = ({
  images,
  onChange,
  onPrevious,
  onNext,
}) => {
  const [newUrl, setNewUrl] = useState("");
  const [newCaption, setNewCaption] = useState("");

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    const newImg: ReportImage = {
      id: "img_" + Math.random().toString(36).substring(2, 9),
      url: newUrl.trim(),
      caption: newCaption.trim() || "Event photograph",
      isCover: images.length === 0,
    };

    onChange([...images, newImg]);
    setNewUrl("");
    setNewCaption("");
  };

  const handleRemove = (id: string) => {
    onChange(images.filter((img) => img.id !== id));
  };

  const handleSetCover = (id: string) => {
    onChange(
      images.map((img) => ({
        ...img,
        isCover: img.id === id,
      }))
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in duration-150">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Event Photo Gallery & Visual Media</h2>
        <p className="text-xs text-slate-500 mt-1">
          Attach high-resolution photos and documentation graphics for print publication.
        </p>
      </div>

      {/* Add Image Form */}
      <form onSubmit={handleAddImage} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Add Photo from URL</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Image URL (HTTPS) <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              required
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Caption / Context
            </label>
            <input
              type="text"
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              placeholder="e.g. Keynote audience in Grand Auditorium"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Photo</span>
          </button>
        </div>
      </form>

      {/* Gallery Grid */}
      <div className="space-y-3">
        {images.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No event photos attached yet. You can proceed without photos or add image links above.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs group relative"
              >
                <div className="h-44 bg-slate-100 overflow-hidden relative">
                  <img
                    src={img.url}
                    alt={img.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop";
                    }}
                  />

                  {img.isCover && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-xs">
                      Cover Photo
                    </span>
                  )}
                </div>

                <div className="p-3.5 flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-700 font-medium truncate flex-1">{img.caption}</p>

                  <div className="flex items-center gap-1">
                    {!img.isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(img.id)}
                        className="p-1 text-slate-400 hover:text-amber-500 rounded-md"
                        title="Set as Cover Photo"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(img.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
          <span>Back to Guests</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 shadow-xs"
        >
          <span>Continue to PDF Preview</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
