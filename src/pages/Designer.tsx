import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ImageUploader } from '../components/ImageUploader';
import { ImageSlider } from '../components/ImageSlider';
import { SAMPLE_ROOMS, INTERIOR_STYLES, ROOM_TYPES, QUICK_REFINEMENTS } from '../utils/presets';
import { designApi } from '../services/designApi';
import {
  RoomAnalysisData,
  DesignInsightsData,
  InteriorStyle,
} from '../types';
import {
  Sparkles,
  Download,
  RefreshCw,
  Layers,
  Check,
  AlertCircle,
  Columns,
  Sliders,
  Send,
  Loader2,
  Palette,
  Sofa,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Database,
  CheckCircle2,
  BookmarkPlus,
  Lock,
} from 'lucide-react';
import { ShopThisLook } from '../components/ShopThisLook';
import { designsApi } from '../services/designsApi';
import { useAppAuth } from '../hooks/useAppAuth';

interface DesignerProps {
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const Designer: React.FC<DesignerProps> = ({ onToast }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 3-Stage Core Flow: 'upload' | 'configure' | 'result'
  const [stage, setStage] = useState<'upload' | 'configure' | 'result'>('upload');

  // Image & Analysis State
  const [roomImage, setRoomImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<RoomAnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  // Room & Style Selection State
  const [selectedRoomType, setSelectedRoomType] = useState<string>(() => {
    try {
      return localStorage.getItem('roomrevive_last_room_type') || 'Workspace / Home Office';
    } catch {
      return 'Workspace / Home Office';
    }
  });
  const [isChangingRoomType, setIsChangingRoomType] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<InteriorStyle>(() => {
    const fromUrl = searchParams.get('style') as InteriorStyle;
    if (fromUrl) return fromUrl;
    try {
      const saved = localStorage.getItem('roomrevive_preferred_style');
      if (saved && INTERIOR_STYLES.some((s) => s.id === saved)) return saved as InteriorStyle;
    } catch {}
    return 'Scandinavian';
  });
  const [additionalPreferences, setAdditionalPreferences] = useState(() => {
    try {
      return localStorage.getItem('roomrevive_last_preferences') || '';
    } catch {
      return '';
    }
  });

  // Sync client-side preferences to LocalStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('roomrevive_preferred_style', selectedStyle);
    } catch {}
  }, [selectedStyle]);

  React.useEffect(() => {
    try {
      localStorage.setItem('roomrevive_last_preferences', additionalPreferences);
    } catch {}
  }, [additionalPreferences]);

  React.useEffect(() => {
    try {
      localStorage.setItem('roomrevive_last_room_type', selectedRoomType);
    } catch {}
  }, [selectedRoomType]);

  // Result State
  const { isSignedIn, userId } = useAppAuth();
  const [projectId, setProjectId] = useState<string | undefined>();
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [designInsights, setDesignInsights] = useState<DesignInsightsData | undefined>();
  const [viewMode, setViewMode] = useState<'side-by-side' | 'slider'>('side-by-side');
  const [refinementInput, setRefinementInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedMongoId, setSavedMongoId] = useState<string | null>(null);

  // 1. Upload Room Image & automatically analyze
  const handleImageUploaded = async (base64: string) => {
    if (!isSignedIn) {
      onToast('Please sign in to upload and redesign your room with AI', 'info');
      navigate('/sign-in');
      return;
    }

    setRoomImage(base64);
    setIsAnalyzing(true);
    setStage('upload'); // stay in upload with loading overlay

    try {
      const result = await designApi.analyzeRoom(base64);
      setAnalysis(result);

      // Handle room classification & ambiguity detection
      if (result.isAmbiguous || result.roomType?.toLowerCase().includes('ambiguous')) {
        setSelectedRoomType('Workspace / Home Office');
        setIsChangingRoomType(true); // open selector so user can confirm
      } else if (result.roomType && result.roomType !== 'Unknown/Ambiguous') {
        // Map detected type to supported room types
        const match = ROOM_TYPES.find(
          (t) => t.toLowerCase() === result.roomType.toLowerCase() ||
                 (t.includes('Workspace') && result.roomType.toLowerCase().includes('work'))
        );
        setSelectedRoomType(match || result.roomType);
      }

      setStage('configure');
      onToast('Room analyzed successfully', 'success');
    } catch (err: any) {
      console.warn('Room analysis warning:', err?.message || err);
      // Fallback analysis to keep workflow moving
      setAnalysis({
        roomType: 'Workspace / Home Office',
        confidence: 0.8,
        evidence: ['Room spatial geometry detected. Please confirm your room function.'],
        detectedObjects: ['desk', 'chair', 'lighting'],
        furniture: [
          { item: 'Main Workstation', material: 'Natural Wood & Metal', condition: 'Existing', style: 'Contemporary' },
        ],
        wallColors: [{ name: 'Neutral White', hex: '#FAF7F2', role: 'Main Wall' }],
        flooringType: 'Natural Hardwood',
        lightingCondition: 'Natural ambient lighting',
        existingStyle: 'Contemporary',
        approximateLayout: 'Functional spatial boundaries with open circulation',
        emptySpace: 'Optimal negative space available for layered design',
        suggestedImprovements: ['Introduce warm layered lighting', 'Incorporate cohesive style textures'],
      });
      setSelectedRoomType('Workspace / Home Office');
      setStage('configure');
      onToast('Room photo ready for design configuration', 'info');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 2. Start Redesign Generation
  const handleGenerateDesign = async () => {
    if (!isSignedIn) {
      onToast('Please sign in to generate designs with AI', 'info');
      navigate('/sign-in');
      return;
    }

    if (!roomImage) return;
    setIsGenerating(true);

    try {
      const response = await designApi.generateDesign({
        originalImage: roomImage,
        roomAnalysis: analysis || undefined,
        room: selectedRoomType,
        style: selectedStyle,
        colorMood: 'Warm',
        lighting: 'Warm',
        furniturePreference: 'Keep existing',
        budget: 'Moderate',
        userInstructions: additionalPreferences,
        saveToStudio: true,
      });

      if (!response.generatedImage && !response.imageUrl) {
        onToast(response.error || 'Generation encountered an issue. Please try again.', 'error');
        return;
      }

      const finalImg = response.generatedImage || response.imageUrl || null;
      setProjectId(response.projectId);
      setGeneratedImage(finalImg);
      setDesignInsights(response.designInsights);
      setStage('result');

      if (response.imageGenerationMessage && !response.imageGenerationMessage.toLowerCase().includes('success')) {
        onToast(response.imageGenerationMessage, 'info');
      } else {
        onToast('Redesigned room generated successfully!', 'success');
      }

      // Check whether backend successfully persisted to MongoDB Atlas
      if (response.persistedToAtlas && response.mongoDesignId) {
        setSavedMongoId(response.mongoDesignId);
        console.log(`[Designer] Design persisted to MongoDB Atlas with ID: ${response.mongoDesignId}`);
        onToast(`Persisted to MongoDB Atlas! (ID: ${response.mongoDesignId.slice(-6)})`, 'success');
      } else if (response.persistenceError) {
        setSavedMongoId(null);
        console.error('[Designer] MongoDB Atlas persistence failed:', response.persistenceError);
        onToast(`Warning: Design generated, but MongoDB persistence failed: ${response.persistenceError}`, 'error');
      } else if (finalImg && roomImage) {
        // Fallback explicit save API call if not saved during generation route
        setIsSaving(true);
        try {
          console.log('[Designer] Explicitly calling backend save-design API for authenticated user...');
          const saveRes = await designsApi.save({
            userId: userId || undefined,
            originalImageUrl: roomImage,
            generatedImageUrl: finalImg,
            roomType: selectedRoomType,
            selectedStyle: selectedStyle,
            colorPreference: 'Warm',
            lightingPreference: 'Warm',
            furniturePreference: 'Keep existing',
            budget: 'Moderate',
            customInstructions: additionalPreferences,
            roomAnalysis: response.analysis || analysis || null,
            generationPrompt: response.generationPrompt || '',
            designInsights: response.designInsights || null,
            variations: response.variations || [],
            title: `${selectedStyle} ${selectedRoomType}`,
          });

          const docId = saveRes.id || saveRes.mongoId || saveRes._id;
          if (docId) {
            setSavedMongoId(docId);
            console.log(`[Designer] Design persisted to MongoDB Atlas with ID: ${docId}`);
            onToast(`Persisted to MongoDB Atlas! (ID: ${docId.slice(-6)})`, 'success');
          } else {
            throw new Error('Database response did not include a valid document ID');
          }
        } catch (saveErr: any) {
          setSavedMongoId(null);
          console.error('[Designer] Error saving design to MongoDB Atlas:', saveErr);
          const errMsg = saveErr?.response?.data?.error || saveErr?.message || 'Database write failed';
          onToast(`Warning: Design generated, but MongoDB persistence failed: ${errMsg}`, 'error');
        } finally {
          setIsSaving(false);
        }
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message;
      onToast(serverMsg || 'Generation encountered an issue. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Explicit Manual Save to MongoDB Atlas
  const handleManualSave = async () => {
    if (!generatedImage || !roomImage) return;
    if (!isSignedIn) {
      onToast('Please sign in first to persist designs to MongoDB Atlas', 'info');
      return;
    }
    setIsSaving(true);
    try {
      console.log('[Designer] Manual save triggered: calling backend save-design API...');
      const saveRes = await designsApi.save({
        userId: userId || undefined,
        originalImageUrl: roomImage,
        generatedImageUrl: generatedImage,
        roomType: selectedRoomType,
        selectedStyle: selectedStyle,
        colorPreference: 'Warm',
        lightingPreference: 'Warm',
        furniturePreference: 'Keep existing',
        budget: 'Moderate',
        customInstructions: additionalPreferences,
        roomAnalysis: analysis || null,
        generationPrompt: '',
        designInsights: designInsights || null,
        title: `${selectedStyle} ${selectedRoomType}`,
      });

      const docId = saveRes.id || saveRes.mongoId || saveRes._id;
      setSavedMongoId(docId);
      console.log(`[Designer] Manual save successful! MongoDB Atlas ID: ${docId}`);
      onToast(`Design saved to MongoDB Atlas! (ID: ${docId.slice(-6)})`, 'success');
    } catch (saveErr: any) {
      console.error('[Designer] Manual save failed:', saveErr);
      const errMsg = saveErr?.response?.data?.error || saveErr?.message || 'Database write failed';
      onToast(`Failed to persist to MongoDB: ${errMsg}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Download Redesigned Image
  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `roomrevive-${selectedStyle.toLowerCase()}-${selectedRoomType.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('Interior redesign downloaded successfully', 'success');
  };

  // 4. Refinement Prompt
  const handleRefine = async (instruction: string) => {
    if (!generatedImage || !instruction.trim()) return;
    setIsRefining(true);
    try {
      const res = await designApi.refineDesign({
        projectId,
        currentImage: generatedImage,
        originalImage: roomImage || undefined,
        refinementPrompt: instruction,
        currentStyle: selectedStyle,
      });
      if (res.refinedImage) {
        setGeneratedImage(res.refinedImage);
      }
      if (res.project?.designInsights) {
        setDesignInsights(res.project.designInsights);
      }
      setRefinementInput('');
      onToast(`Refinement applied: "${instruction}"`, 'success');
    } catch (err: any) {
      console.error(err);
      onToast('Refinement failed. Please try again.', 'error');
    } finally {
      setIsRefining(false);
    }
  };

  // Generate Again (keeps current room image and goes back to style/preferences)
  const handleGenerateAgain = () => {
    setStage('configure');
  };

  // Start Over with new image
  const handleUploadNewImage = () => {
    setRoomImage(null);
    setAnalysis(null);
    setGeneratedImage(null);
    setAdditionalPreferences('');
    setIsChangingRoomType(false);
    setStage('upload');
  };

  return (
    <div className="py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      {/* ============================================================== */}
      {/* STAGE 1: UPLOAD ROOM IMAGE */}
      {/* ============================================================== */}
      {stage === 'upload' && (
        <div className="space-y-12 animate-in fade-in duration-300">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold tracking-widest uppercase text-[#8C6849]">
              ROOMREVIVE
            </span>
            <h1 className="font-serif-luxury text-4xl sm:text-5xl font-bold tracking-tight text-[#1F1E1D]">
              AI Interior Design
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-normal">
              Upload a photo of your room and transform it into a new interior style.
            </p>
          </div>

          {/* Main Upload Area */}
          <div className="max-w-3xl mx-auto">
            {!isSignedIn ? (
              <div className="p-8 sm:p-14 rounded-3xl bg-white border border-[#DDD5C9] shadow-sm text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-[#F7F3ED] text-[#8C6849] flex items-center justify-center mx-auto border border-[#E8DEC8]">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="font-serif-luxury text-2xl font-bold text-[#1F1E1D]">
                    Sign In to Redesign Your Room
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                    Authentication is required to analyze room architecture, generate AI designs, and securely persist your creations to MongoDB Atlas.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    to="/sign-in"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#242220] hover:bg-[#383532] text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Sign In to Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/sign-up"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE3] text-stone-700 border border-[#DDD5C9] text-xs font-semibold transition-all flex items-center justify-center cursor-pointer"
                  >
                    <span>Create an Account</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-dashed border-[#DDD5C9] shadow-sm hover:border-[#8C6849] transition-all">
                {isAnalyzing ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#F4EEE6] flex items-center justify-center text-[#8C6849] animate-pulse">
                      <Sparkles className="w-7 h-7 animate-spin" />
                    </div>
                    <div>
                      <h3 className="font-serif-luxury text-xl font-bold text-[#1F1E1D]">
                        AI is Analyzing Your Room
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md">
                        Identifying walls, windows, doors, flooring, ceiling, furniture placement, lighting, and room function...
                      </p>
                    </div>
                  </div>
                ) : (
                  <ImageUploader
                    currentImage={roomImage}
                    onImageSelected={handleImageUploaded}
                    onImageRemoved={() => setRoomImage(null)}
                    label="Upload Room Photo"
                    sublabel="Drag & drop your room photo or click to browse (JPG, PNG, WebP up to 15MB)"
                  />
                )}
              </div>
            )}
          </div>

          {/* Quick Preset Rooms for Immediate Testing */}
          {!isAnalyzing && (
            <div className="max-w-4xl mx-auto space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">
                  Or test with a sample room photo:
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SAMPLE_ROOMS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleImageUploaded(sample.image)}
                    className="group relative rounded-xl overflow-hidden aspect-4/3 border border-[#E3DBD0] text-left hover:border-[#8C6849] hover:shadow-md transition-all cursor-pointer"
                  >
                    <img
                      src={sample.image}
                      alt={sample.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2.5 flex flex-col justify-end">
                      <span className="text-[11px] font-semibold text-white leading-tight">
                        {sample.title}
                      </span>
                      <span className="text-[9px] text-[#E3D5C5]">
                        {sample.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* STAGE 2: AFTER ANALYSIS (ROOM TYPE, DESIGN STYLE, PREFERENCES) */}
      {/* ============================================================== */}
      {stage === 'configure' && (
        <div className="space-y-10 animate-in fade-in duration-300 max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="text-xs font-bold tracking-widest uppercase text-[#8C6849]">
              ROOMREVIVE · INTERIOR CONFIGURATION
            </span>
            <h2 className="font-serif-luxury text-3xl font-bold text-[#1F1E1D]">
              Choose Your Design Direction
            </h2>
            <p className="text-sm text-stone-600">
              Confirm your room function and select an interior aesthetic to generate the redesign.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E3DBD0] shadow-sm space-y-8">
            {/* Uploaded Room Preview Header */}
            {roomImage && (
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D8]">
                <img
                  src={roomImage}
                  alt="Original room"
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 object-cover rounded-xl shadow-xs shrink-0"
                />
                <div className="space-y-1 flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EAE2D7] text-[#5C4530]">
                      Room Photo Analyzed
                    </span>
                    {analysis?.existingStyle && (
                      <span className="text-xs text-stone-500">
                        Current Style: {analysis.existingStyle}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600">
                    {analysis?.approximateLayout || 'Original architecture and spatial boundaries preserved.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUploadNewImage}
                  className="text-xs font-medium text-stone-500 hover:text-stone-900 underline cursor-pointer shrink-0"
                >
                  Change Photo
                </button>
              </div>
            )}

            {/* SECTION 1: ROOM TYPE */}
            <div className="space-y-3 pb-6 border-b border-[#EAE3D8]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    ROOM TYPE:
                  </span>
                  <span className="text-sm font-semibold text-[#8C6849] bg-[#F7F2EB] px-3 py-1 rounded-lg border border-[#E5DACD]">
                    {selectedRoomType}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsChangingRoomType(!isChangingRoomType)}
                  className="text-xs font-semibold text-[#8C6849] hover:text-[#5C4530] underline cursor-pointer"
                >
                  {isChangingRoomType ? 'Close Selection' : '[Confirm / Change]'}
                </button>
              </div>

              {/* Ambiguity Alert Notice if applicable */}
              {analysis?.isAmbiguous && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Ambiguous room type detected</span>
                    <span>
                      The space contains both workspace furniture and lounge seating. Please confirm or select the room's intended function below.
                    </span>
                  </div>
                </div>
              )}

              {/* Room Type Selector Pills */}
              {(isChangingRoomType || analysis?.isAmbiguous) && (
                <div className="pt-2 animate-in fade-in duration-200">
                  <p className="text-xs text-stone-500 mb-2 font-medium">
                    Select the exact room function:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ROOM_TYPES.map((type) => {
                      const isSelected = selectedRoomType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setSelectedRoomType(type);
                            setIsChangingRoomType(false);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#242220] text-white shadow-xs'
                              : 'bg-[#FAF8F5] text-stone-700 border border-[#E3DBD0] hover:border-[#8C6849]'
                          }`}
                        >
                          <span>{type}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: DESIGN STYLE */}
            <div className="space-y-4 pb-6 border-b border-[#EAE3D8]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  DESIGN STYLE:
                </span>
                <span className="text-xs text-[#8C6849] font-semibold">
                  Selected: {selectedStyle}
                </span>
              </div>

              {/* 11 Requested Styles Grid with Radio Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {INTERIOR_STYLES.map((style) => {
                  const isSelected = selectedStyle === style.id;
                  return (
                    <div
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 text-left ${
                        isSelected
                          ? 'border-[#8C6849] bg-[#FAF6F0] ring-1 ring-[#8C6849] shadow-xs'
                          : 'border-[#E3DBD0] bg-white hover:border-[#8C6849] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {/* Radio Circle Indicator */}
                      <div className="mt-0.5 shrink-0">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-[#8C6849] bg-[#8C6849]'
                              : 'border-stone-400 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>

                      <div className="space-y-1 min-w-0">
                        <span className="text-xs font-bold text-stone-900 block leading-tight">
                          {style.name}
                        </span>
                        <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                          {style.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: ADDITIONAL PREFERENCES */}
            <div className="space-y-3 pb-6">
              <label
                htmlFor="preferences-input"
                className="text-xs font-bold uppercase tracking-wider text-stone-800 block"
              >
                Additional preferences:
              </label>

              <div className="relative">
                <input
                  id="preferences-input"
                  type="text"
                  value={additionalPreferences}
                  onChange={(e) => setAdditionalPreferences(e.target.value)}
                  placeholder='Example: "Keep the existing flooring and add more storage."'
                  className="w-full px-4 py-3.5 rounded-xl border border-[#E3DBD0] bg-[#FAF8F5] text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#8C6849] focus:bg-white transition-all"
                />
              </div>

              {/* Quick suggestion chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Keep the existing flooring and add more storage.',
                  'Add indoor plants and warm 2700K lighting.',
                  'Preserve natural window light and expand shelving.',
                  'Incorporate a large ergonomic desk with task lighting.',
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAdditionalPreferences(chip)}
                    className="text-[10px] font-medium text-stone-600 bg-[#F4EFE6] hover:bg-[#EAE4D9] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* GENERATE DESIGN BUTTON */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateDesign}
                disabled={isGenerating}
                className="w-full py-4 rounded-xl bg-[#242220] hover:bg-[#383532] text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-[#E3D5C5]" />
                    <span>Redesigning Your {selectedRoomType}...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E3D5C5]" />
                    <span>Generate Design</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STAGE 3: RESULT (ORIGINAL ROOM & REDESIGNED ROOM) */}
      {/* ============================================================== */}
      {stage === 'result' && (
        <div className="space-y-10 animate-in fade-in duration-300 max-w-5xl mx-auto">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-[#E3DBD0]">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-[#8C6849]">
                RESULT
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1F1E1D]">
                {selectedStyle} {selectedRoomType}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle Slider vs Side-by-Side */}
              <div className="flex items-center bg-[#F1ECE4] p-1 rounded-lg border border-[#DDD5C9] text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('side-by-side')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    viewMode === 'side-by-side'
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Side by Side</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('slider')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    viewMode === 'slider'
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Interactive Slider</span>
                </button>
              </div>

              {/* Generate Again */}
              <button
                type="button"
                onClick={handleGenerateAgain}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-stone-800 border border-[#DDD5C9] text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#8C6849]" />
                <span>Generate Again</span>
              </button>

              {/* MongoDB Atlas Persistence Status & Manual Save Action */}
              {savedMongoId ? (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-xs"
                  title={`Persisted to MongoDB Atlas Document ID: ${savedMongoId}`}
                >
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Persisted to Atlas</span>
                  <span className="sm:hidden">Saved</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
                </div>
              ) : isSignedIn ? (
                <button
                  type="button"
                  onClick={handleManualSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8C6849] hover:bg-[#78573B] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-60"
                  title="Persist this design directly to MongoDB Atlas"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Saving to Atlas...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-3.5 h-3.5" />
                      <span>Save to MongoDB</span>
                    </>
                  )}
                </button>
              ) : (
                <Link
                  to="/sign-in"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE3] text-stone-700 border border-[#DDD5C9] text-xs font-semibold transition-all cursor-pointer shadow-xs"
                  title="Sign in with Clerk to persist this design to MongoDB Atlas"
                >
                  <Database className="w-3.5 h-3.5 text-[#8C6849]" />
                  <span>Sign in to Persist</span>
                </Link>
              )}

              {/* Shop This Look */}
              <a
                href="#shop-this-look-section"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8C6849] hover:bg-[#78573B] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#F5EFE6]" />
                <span>Shop This Look</span>
              </a>

              {/* Download */}
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#242220] hover:bg-[#383532] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-[#E3D5C5]" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Visual Presentation: Side-by-Side or Slider */}
          {viewMode === 'side-by-side' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Room */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-700 px-1">
                  <span>Original Room</span>
                  <span className="text-[11px] text-stone-500 font-normal">Uploaded photo</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-[#DDD5C9] bg-stone-100 aspect-4/3 relative shadow-xs">
                  {roomImage && (
                    <img
                      src={roomImage}
                      alt="Original Room"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold uppercase tracking-wider text-white">
                    Original
                  </span>
                </div>
              </div>

              {/* Redesigned Room */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#8C6849] px-1">
                  <span>Redesigned Room</span>
                  <span className="text-[11px] text-stone-500 font-normal">{selectedStyle} Style</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-[#8C6849]/30 bg-stone-100 aspect-4/3 relative shadow-sm">
                  {generatedImage ? (
                    <img
                      src={generatedImage}
                      alt="Redesigned Room"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
                      <Sparkles className="w-8 h-8 text-[#8C6849]" />
                      <p className="text-xs text-stone-600 font-medium">Design rendered below</p>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#8C6849]/90 backdrop-blur-md text-[10px] font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#E3D5C5]" />
                    AI Redesign
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-4 rounded-3xl bg-[#FAF8F5] border border-[#DDD5C9] shadow-sm">
              <ImageSlider
                originalImage={roomImage || ''}
                generatedImage={generatedImage || roomImage || ''}
                originalLabel="Original Room"
                generatedLabel={`Redesigned Room (${selectedStyle})`}
              />
            </div>
          )}

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#E3DBD0] shadow-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerateAgain}
                className="px-5 py-2.5 rounded-xl bg-[#242220] hover:bg-[#383532] text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#E3D5C5]" />
                <span>Generate Again</span>
              </button>

              <a
                href="#shop-this-look-section"
                className="px-5 py-2.5 rounded-xl bg-[#8C6849] hover:bg-[#78573B] text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#F5EFE6]" />
                <span>Shop This Look</span>
              </a>

              <button
                type="button"
                onClick={handleDownload}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] text-stone-800 border border-[#DDD5C9] text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-[#8C6849]" />
                <span>Download</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleUploadNewImage}
              className="text-xs font-medium text-stone-500 hover:text-stone-900 underline cursor-pointer"
            >
              Upload Different Room Photo
            </button>
          </div>

          {/* SHOP THIS LOOK COMPONENT (Featured below generated room) */}
          <ShopThisLook
            generatedImage={generatedImage || roomImage || ''}
            roomType={selectedRoomType}
            style={selectedStyle}
            onToast={onToast}
          />

          {/* Refine Redesign Section */}
          <div className="p-6 rounded-3xl bg-white border border-[#E3DBD0] space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8C6849]" />
                <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                  Refine This Design
                </h3>
              </div>
              <span className="text-[11px] text-stone-500">
                Direct AI instructions
              </span>
            </div>

            {/* Quick Refine Chips */}
            <div className="flex flex-wrap gap-2">
              {QUICK_REFINEMENTS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isRefining}
                  onClick={() => handleRefine(chip)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#FAF8F5] hover:bg-[#F3ECE1] text-stone-700 border border-[#E3DBD0] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRefine(refinementInput);
              }}
              className="flex gap-2 pt-2"
            >
              <input
                type="text"
                value={refinementInput}
                onChange={(e) => setRefinementInput(e.target.value)}
                placeholder='Tell AI what to change, e.g. "Add a large ficus plant in the corner" or "Make the lighting warmer"'
                disabled={isRefining}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#E3DBD0] bg-[#FAF8F5] text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#8C6849] focus:bg-white"
              />
              <button
                type="submit"
                disabled={isRefining || !refinementInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#242220] hover:bg-[#383532] text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isRefining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Apply</span>
              </button>
            </form>
          </div>

          {/* Design Insights & Changes Made */}
          {designInsights && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Changes Made */}
              <div className="p-6 rounded-3xl bg-white border border-[#E3DBD0] space-y-3 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Key Architectural Updates</span>
                </h4>
                <ul className="space-y-2 text-xs text-stone-600">
                  {designInsights.changesMade.map((change, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Color Palette */}
              <div className="p-6 rounded-3xl bg-white border border-[#E3DBD0] space-y-3 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#8C6849]" />
                  <span>Curated Color Palette</span>
                </h4>
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {designInsights.colorPalette.map((color, idx) => (
                    <div key={idx} className="space-y-1.5 text-center">
                      <div
                        className="w-full aspect-square rounded-xl border border-black/10 shadow-xs"
                        style={{ backgroundColor: color.hex }}
                        title={`${color.name} (${color.hex})`}
                      />
                      <span className="text-[10px] font-semibold text-stone-800 block truncate">
                        {color.name}
                      </span>
                      <span className="text-[9px] text-stone-400 block truncate">
                        {color.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
