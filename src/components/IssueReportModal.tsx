import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Camera,
  Clock,
  MapPin,
  Send,
  UploadCloud,
  CheckCircle,
  FileText,
  Wrench,
  CloudRain,
  ShieldAlert,
  UserX,
  Plus
} from 'lucide-react';
import { ISSUE_CATEGORY_PRESETS } from '../data/mockData';
import { IssueCategory, IssueReport, IssueSeverity } from '../types';

interface IssueReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
  currentLocationName: string;
  onSubmitIssue: (issue: Omit<IssueReport, 'id' | 'timestamp' | 'resolved'>) => void;
}

export const IssueReportModal: React.FC<IssueReportModalProps> = ({
  isOpen,
  onClose,
  shipmentId,
  currentLocationName,
  onSubmitIssue,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory>('TRAFFIC');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IssueSeverity>('MEDIUM');
  const [location, setLocation] = useState(currentLocationName);
  const [estimatedDelayMinutes, setEstimatedDelayMinutes] = useState<number>(30);
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [photoPreviewName, setPhotoPreviewName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCategorySelect = (cat: IssueCategory) => {
    setSelectedCategory(cat);
    const preset = ISSUE_CATEGORY_PRESETS.find((p) => p.category === cat);
    if (preset) {
      if (!title) setTitle(preset.label);
      if (!description) setDescription(preset.defaultDescription);
    }
  };

  const handleSimulatedPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreviewName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmitIssue({
      shipmentId,
      category: selectedCategory,
      title: title.trim(),
      description: description.trim() || 'Driver reported issue during shipment transit.',
      severity,
      location,
      estimatedDelayMinutes,
      photoUrl: attachedPhoto || undefined,
    });

    onClose();
    // Reset state
    setTitle('');
    setDescription('');
    setAttachedPhoto(null);
    setPhotoPreviewName(null);
  };

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'AlertTriangle':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-rose-500" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'CloudRain':
        return <CloudRain className="w-5 h-5 text-indigo-500" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-purple-500" />;
      case 'UserX':
        return <UserX className="w-5 h-5 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl text-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Report Delivery Issue</h2>
              <p className="text-xs text-slate-500">Shipment ID: <span className="text-indigo-700 font-mono font-bold">{shipmentId}</span></p>
            </div>
          </div>
          <button
            id="close-issue-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Quick Issue Category Selector Chips */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              1. Select Issue Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ISSUE_CATEGORY_PRESETS.map((preset) => {
                const isSelected = selectedCategory === preset.category;
                return (
                  <button
                    key={preset.category}
                    type="button"
                    onClick={() => handleCategorySelect(preset.category)}
                    className={`flex items-center space-x-2.5 p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-200 font-bold'
                        : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {getPresetIcon(preset.icon)}
                    <span className="text-xs font-medium line-clamp-1">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Issue Title & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Issue Summary Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Construction Lane Closure on I-65"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Urgency Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IssueSeverity)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
              >
                <option value="LOW">Minor Delay (Low)</option>
                <option value="MEDIUM">Noticeable (Medium)</option>
                <option value="HIGH">Severe Delay (High)</option>
                <option value="CRITICAL">Critical Block / Stopped</option>
              </select>
            </div>
          </div>

          {/* Location & Estimated Delay Minutes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center justify-between">
                <span>Current Location</span>
                <span className="text-[10px] text-emerald-700 font-bold">GPS Auto-Detected</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. I-65 South MM 82"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Estimated Delay Impact
              </label>
              <div className="flex items-center space-x-2">
                {[15, 30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setEstimatedDelayMinutes(mins)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                      estimatedDelayMinutes === mins
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    +{mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Detailed Notes for Dispatch & Receiver
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide clear context so dispatch can notify the delivery customer or re-route if necessary..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>

          {/* Photo Attachment Section */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Attach Photo / Document (Optional Proof)
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 rounded-2xl p-4 transition-colors text-center relative cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleSimulatedPhotoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {attachedPhoto ? (
                <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <img src={attachedPhoto} alt="Attached issue" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Photo Attached
                      </p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{photoPreviewName || 'issue_photo.jpg'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAttachedPhoto(null);
                      setPhotoPreviewName(null);
                    }}
                    className="text-xs text-rose-700 hover:text-rose-800 font-semibold px-2.5 py-1 bg-rose-50 rounded-lg border border-rose-200"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2 text-slate-500">
                  <Camera className="w-8 h-8 text-indigo-600 mb-1" />
                  <p className="text-xs font-bold text-slate-700">Tap to capture or upload photo proof</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Supports traffic, damage, dock slip, or weather photo</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-issue-btn"
              type="submit"
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-md transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Issue to Dispatch</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
