import React from 'react';
import { ProjectData } from '../../types';
import { Layers, Calendar, ArrowRight, Trash2 } from 'lucide-react';

interface ProjectCardProps {
  project: ProjectData;
  onSelect: (project: ProjectData) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  onDelete,
}) => {
  const formattedDate = new Date(project.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      onClick={() => onSelect(project)}
      className="group rounded-2xl overflow-hidden border border-[#E3DBD0] bg-white hover:border-[#8C6849] hover:shadow-lg transition-all cursor-pointer flex flex-col"
    >
      {/* Thumbnail */}
      <div className="aspect-[16/10] overflow-hidden bg-stone-900 relative">
        <img
          src={project.generatedImage}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-md bg-black/65 backdrop-blur-md text-[10px] font-semibold uppercase tracking-wider text-white flex items-center gap-1.5 border border-white/10 shadow-xs">
            <Layers className="w-3 h-3 text-[#E3D5C5]" />
            Room Redesign
          </span>
        </div>

        {/* Delete Quick Trigger */}
        <button
          onClick={(e) => onDelete(project.id, e)}
          className="absolute top-3 right-3 p-1.5 rounded-md bg-black/60 hover:bg-red-600 text-white/80 hover:text-white transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shadow-xs"
          title="Delete Project"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Info Card */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-serif-luxury font-bold text-base text-stone-900 line-clamp-1 group-hover:text-[#8C6849] transition-colors">
            {project.title}
          </h3>
          <p className="text-xs text-stone-500 mt-1 line-clamp-1">
            {project.preferences?.style || project.preferences?.interiorStyle || 'Custom Concept'} ·{' '}
            {project.preferences?.mood || project.preferences?.colorMood || 'Balanced'}
          </p>
        </div>

        <div className="pt-2 border-t border-[#F2EDE5] flex items-center justify-between text-xs text-stone-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>

          <span className="text-[#8C6849] font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
