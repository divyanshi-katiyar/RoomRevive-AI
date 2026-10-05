import React, { useState } from 'react';
import { ProjectData } from '../../types';
import { ImageSlider } from '../../components/ImageSlider';
import {
  X,
  Download,
  Copy,
  Trash2,
  Edit2,
  Check,
  Calendar,
  Layers,
  Palette,
  Sofa,
  Clock,
  ShoppingBag,
} from 'lucide-react';
import { ShopThisLook } from '../../components/ShopThisLook';

interface ProjectDetailModalProps {
  project: ProjectData | null;
  onClose: () => void;
  onRename: (id: string, newTitle: string) => Promise<void>;
  onDuplicate: (project: ProjectData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onRename,
  onDuplicate,
  onDelete,
  onToast,
}) => {
  if (!project) return null;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(project.title);
  const [showShopLook, setShowShopLook] = useState(false);

  const handleSaveTitle = async () => {
    if (!editedTitle.trim()) return;
    try {
      await onRename(project.id, editedTitle.trim());
      setIsEditingTitle(false);
      onToast('Project renamed successfully', 'success');
    } catch {
      onToast('Failed to rename project', 'error');
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = project.generatedImage;
    a.download = `${project.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onToast('Project visualization downloaded', 'success');
  };

  const handleDuplicate = async () => {
    try {
      await onDuplicate(project);
      onToast('Project duplicated', 'success');
      onClose();
    } catch {
      onToast('Failed to duplicate project', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await onDelete(project.id);
      onToast('Project deleted', 'info');
      onClose();
    } catch {
      onToast('Failed to delete project', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl w-full max-w-5xl shadow-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-[#F2EDE5] border-b border-[#E3DBD0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="font-serif-luxury text-xl font-bold text-stone-900 bg-white px-3 py-1.5 rounded-lg border border-[#DDD5C9] focus:outline-none focus:border-[#8C6849]"
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-2 rounded-lg bg-[#242220] text-white hover:bg-stone-800 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 group">
                <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#1F1E1D]">
                  {project.title}
                </h2>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="p-1 rounded-md text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
                  title="Rename Project"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-xs text-stone-500 mt-1">
              Created {new Date(project.createdAt).toLocaleDateString()} · Room Redesign
            </p>
          </div>

          {/* Action Header Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShopLook(!showShopLook)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#8C6849] hover:bg-[#78573B] text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#F5EFE6]" />
              <span>Shop This Look</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#DDD5C9] hover:bg-stone-100 text-stone-800 text-xs font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={handleDuplicate}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#DDD5C9] hover:bg-stone-100 text-stone-800 text-xs font-semibold cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicate</span>
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg bg-white border border-[#DDD5C9] hover:bg-red-50 text-red-600 cursor-pointer"
              title="Delete Project"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-black/5 cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-8 max-h-[75vh] overflow-y-auto">
          {/* Comparison Slider */}
          <div>
            <ImageSlider
              originalImage={project.originalImage}
              generatedImage={project.generatedImage}
              originalLabel="Original Photo"
              generatedLabel="AI Interior Redesign"
            />
          </div>

          {/* SHOP THIS LOOK (Inside Project Modal) */}
          <ShopThisLook
            generatedImage={project.generatedImage}
            roomType={project.preferences?.room}
            style={project.preferences?.style}
            onToast={onToast}
            initialAutoOpen={showShopLook}
          />

          {/* Selected Preferences Summary */}
          <div className="p-4 rounded-xl bg-white border border-[#E3DBD0] space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Selected Direction & Preferences
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Style</span>
                <span className="font-semibold text-stone-800">
                  {project.preferences?.style || project.preferences?.interiorStyle || 'Custom'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Mood / Palette</span>
                <span className="font-semibold text-stone-800">
                  {project.preferences?.colorMood || project.preferences?.mood || 'Warm'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Lighting</span>
                <span className="font-semibold text-stone-800">
                  {project.preferences?.lighting || 'Natural Daylight'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Budget</span>
                <span className="font-semibold text-stone-800">
                  {project.preferences?.budget || 'Premium'}
                </span>
              </div>
            </div>
            {project.preferences?.userInstructions && (
              <div className="pt-2 text-xs text-stone-600 border-t border-[#F2EDE5]">
                <span className="font-medium text-stone-800">Custom Notes:</span>{' '}
                "{project.preferences.userInstructions}"
              </div>
            )}
          </div>

          {/* Variations Gallery if available */}
          {project.variations && project.variations.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                Generated Variations ({project.variations.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {project.variations.map((v) => (
                  <div
                    key={v.id}
                    className="rounded-xl overflow-hidden border border-[#E3DBD0] bg-white text-xs"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-stone-100">
                      <img src={v.image} alt={v.label} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2.5">
                      <span className="font-bold text-stone-800 block">{v.label}</span>
                      <span className="text-[11px] text-[#8C6849]">{v.style}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Refinement History */}
          {project.refinementHistory && project.refinementHistory.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#8C6849]" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Refinement History
                </h4>
              </div>
              <div className="space-y-2">
                {project.refinementHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white border border-[#E3DBD0] flex items-center justify-between text-xs"
                  >
                    <span className="text-stone-800 font-medium">"{item.prompt}"</span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
