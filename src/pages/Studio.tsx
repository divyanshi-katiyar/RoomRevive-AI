import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../services/projectApi';
import { ProjectData } from '../types';
import { ProjectCard } from '../features/studio/ProjectCard';
import { ProjectDetailModal } from '../features/studio/ProjectDetailModal';
import {
  Layers,
  Compass,
  FolderKanban,
  Plus,
  Search,
  Filter,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface StudioProps {
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

type FilterTab = 'all' | 'recent';

export const Studio: React.FC<StudioProps> = ({ onToast }) => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectApi.getAll();
      setProjects(data);
    } catch (err: any) {
      console.error(err);
      onToast('Failed to load studio projects', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleRename = async (id: string, newTitle: string) => {
    await projectApi.update(id, { title: newTitle });
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: newTitle } : p))
    );
    if (selectedProject?.id === id) {
      setSelectedProject((prev) => (prev ? { ...prev, title: newTitle } : null));
    }
  };

  const handleDuplicate = async (project: ProjectData) => {
    const copyData = {
      ...project,
      title: `${project.title} (Copy)`,
    };
    delete (copyData as any).id;
    // create copy
    await fetchProjects();
  };

  const handleDelete = async (id: string) => {
    await projectApi.delete(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selectedProject?.id === id) {
      setSelectedProject(null);
    }
  };

  const filteredProjects = projects.filter((p) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchStyle = (p.preferences?.style || p.preferences?.interiorStyle || '').toLowerCase().includes(q);
      return matchTitle || matchStyle;
    }
    return true;
  });

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-300">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D8]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8C6849] font-semibold block mb-1">
            Design Studio
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1F1E1D]">
            Your Interior Projects & Spaces
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Review your AI room designs, curated design strategies, and style variations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/design"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#242220] hover:bg-[#383532] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-[#E3D5C5]" />
            <span>New Room Design</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#242220] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-[#E3DDD2] hover:border-[#8C6849]'
            }`}
          >
            All Projects ({projects.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or style..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-[#DDD5C9] bg-white focus:outline-none focus:border-[#8C6849]"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="py-24 text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8C6849]" />
          <p className="text-sm text-stone-500">Retrieving your projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-24 text-center space-y-6 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#EFE9DF] text-[#8C6849] flex items-center justify-center mx-auto">
            <FolderKanban className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif-luxury text-xl font-bold text-stone-800">
              No Projects Found
            </h3>
            <p className="text-xs text-stone-500">
              {searchQuery
                ? `No projects matching "${searchQuery}".`
                : 'Your studio is empty. Design your first room or transform a floor plan!'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/design"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#242220] text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Redesign a Room</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={(p) => setSelectedProject(p)}
              onDelete={async (id, e) => {
                e.stopPropagation();
                if (confirm('Delete this design project?')) {
                  await handleDelete(id);
                  onToast('Project deleted', 'info');
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onRename={handleRename}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onToast={onToast}
      />
    </div>
  );
};
