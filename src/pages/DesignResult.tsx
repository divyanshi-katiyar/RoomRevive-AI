import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { projectApi } from '../services/projectApi';
import { ProjectData } from '../types';
import { StepRefine } from '../features/designer/StepRefine';
import { designApi } from '../services/designApi';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';

interface DesignResultProps {
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DesignResult: React.FC<DesignResultProps> = ({ onToast }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('id');

  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefining, setIsRefining] = useState(false);

  useEffect(() => {
    async function load() {
      if (!projectId) {
        // If no ID provided, try fetching most recent room design
        try {
          const all = await projectApi.getAll();
          const latestRoom = all.find((p) => p.type === 'room');
          if (latestRoom) {
            setProject(latestRoom);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      try {
        const found = await projectApi.getById(projectId);
        setProject(found);
      } catch (e) {
        console.error(e);
        onToast('Could not load project', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [projectId]);

  const handleRefine = async (prompt: string) => {
    if (!project) return;
    setIsRefining(true);
    try {
      const res = await designApi.refineDesign({
        projectId: project.id,
        currentImage: project.generatedImage,
        originalImage: project.originalImage,
        refinementPrompt: prompt,
      });

      if (res.project) {
        setProject(res.project);
        onToast('Design refined successfully', 'success');
      } else if (res.refinedImage) {
        setProject((prev) => prev ? { ...prev, generatedImage: res.refinedImage } : null);
        onToast('Design refined successfully', 'success');
      }
    } catch (err) {
      console.error(err);
      onToast('Failed to apply refinement. Please try again.', 'error');
    } finally {
      setIsRefining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8C6849]" />
        <p className="text-sm text-stone-500">Loading design result...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-24 text-center space-y-6 max-w-md mx-auto">
        <h2 className="font-serif-luxury text-2xl font-bold text-stone-800">
          No Design Project Found
        </h2>
        <p className="text-sm text-stone-500">
          You haven't generated an interior redesign yet, or the project was not found.
        </p>
        <Link
          to="/design"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#242220] text-white text-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Start a New Redesign</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <Link
        to="/studio"
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Design Studio</span>
      </Link>

      <StepRefine
        originalImage={project.originalImage}
        generatedImage={project.generatedImage}
        designInsights={project.designInsights}
        variations={project.variations || []}
        projectId={project.id}
        onSelectVariation={(v) => {
          setProject((prev) => prev ? { ...prev, generatedImage: v.image } : null);
        }}
        onRefinePrompt={handleRefine}
        onStartOver={() => navigate('/design')}
        isRefining={isRefining}
        onToast={onToast}
      />
    </div>
  );
};
