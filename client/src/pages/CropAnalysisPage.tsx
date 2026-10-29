import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  X, 
  ScanLine, 
  AlertCircle, 
  Sparkles, 
  Check, 
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api, SymptomAnalysisResult } from '../services/api';
import { AnalysisResultCard } from '../components/crop/AnalysisResultCard';

const POPULAR_CROPS = [
  { en: 'Chilli', te: 'మిరప' },
  { en: 'Paddy / Rice', te: 'వరి' },
  { en: 'Cotton', te: 'పత్తి' },
  { en: 'Tomato', te: 'టమాటో' },
  { en: 'Groundnut', te: 'వేరుశనగ' },
  { en: 'Maize', te: 'మొక్కజొన్న' },
  { en: 'Wheat', te: 'గోధుమ' },
  { en: 'Mango', te: 'మామిడి' },
];

export const CropAnalysisPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { token, user } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropName, setCropName] = useState<string>('Chilli');
  const [cropVariety, setCropVariety] = useState<string>('');
  const [growthStage, setGrowthStage] = useState<string>('');
  const [farmLocation, setFarmLocation] = useState<string>('');
  const [observedSymptoms, setObservedSymptoms] = useState<string>('');

  // Status states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<SymptomAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleFileChange = (file: File) => {
    setError(null);
    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid JPEG, PNG, or WebP photograph.');
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Photograph size exceeds the 10MB limit. Please upload a compressed or smaller image.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleClearPhoto = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName.trim()) {
      setError('Please specify the crop name.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setIsSaved(false);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('image', selectedFile);
      }
      formData.append('cropName', cropName);
      if (cropVariety) formData.append('cropVariety', cropVariety);
      if (growthStage) formData.append('growthStage', growthStage);
      if (farmLocation) formData.append('farmLocation', farmLocation);
      if (observedSymptoms) formData.append('observedSymptoms', observedSymptoms);
      formData.append('language', language);

      const res = await api.analyzeCrop(formData);
      setAnalysisResult(res.analysis);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please check your network or try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToHistory = async () => {
    if (!analysisResult) return;
    setIsSaving(true);
    try {
      await api.saveAssessment(
        {
          crop_name: cropName,
          crop_variety: cropVariety || null,
          growth_stage: growthStage || null,
          farm_location: farmLocation || null,
          observed_symptoms: observedSymptoms || null,
          assessment_summary: analysisResult.possibleCondition + ' - ' + analysisResult.confidenceExplanation,
          possible_condition: analysisResult.possibleCondition,
          condition_category: analysisResult.conditionCategory,
          uncertainty_notes: analysisResult.confidenceExplanation,
          visible_symptoms: analysisResult.visibleSymptoms,
          alternative_explanations: analysisResult.alternativeExplanations,
          contributing_factors: analysisResult.contributingFactors,
          suggested_next_steps: analysisResult.safeImmediateNextSteps,
          preventive_practices: analysisResult.preventivePractices,
          expert_review_triggers: analysisResult.expertReviewTriggers,
          model_identifier: analysisResult.modelIdentifier,
          needs_followup: analysisResult.confidenceLevel !== 'High',
        },
        token
      );
      setIsSaved(true);
    } catch (err: any) {
      setError('Failed to save assessment to history: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
    setIsSaved(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-sans tracking-tight">
          {t('analysisTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
          {t('analysisSubtitle')}
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block mb-0.5">Analysis Notice:</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Analysis Result or Form */}
      {analysisResult ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start Another Analysis</span>
            </button>
          </div>

          <AnalysisResultCard
            result={analysisResult}
            onSave={handleSaveToHistory}
            isSaving={isSaving}
            isSaved={isSaved}
            imagePreviewUrl={previewUrl}
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Photo Dropzone */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
            <label className="block text-sm font-bold text-stone-900 font-sans">
              {t('uploadLabel')}
            </label>

            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900/5 max-h-96 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Crop preview"
                  className="max-h-96 w-auto object-contain rounded-xl"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-900 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
                  >
                    {t('replacePhoto')}
                  </button>
                  <button
                    type="button"
                    onClick={handleClearPhoto}
                    className="p-1.5 rounded-lg bg-red-600/90 hover:bg-red-700 text-white transition-colors cursor-pointer"
                    aria-label="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-emerald-700 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-stone-50/50 hover:bg-emerald-50/20"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-stone-800">{t('dropzoneIdle')}</p>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">{t('uploadHint')}</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
          </div>

          {/* Crop Metadata Fields */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-2xs space-y-6">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider font-sans">
              Crop Details & Field Context
            </h2>

            {/* Popular Crop Chips */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                {t('formCropName')} *
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {POPULAR_CROPS.map((c) => {
                  const label = language === 'te' ? `${c.te} (${c.en})` : `${c.en} (${c.te})`;
                  const isSelected = cropName.toLowerCase().includes(c.en.toLowerCase());
                  return (
                    <button
                      key={c.en}
                      type="button"
                      onClick={() => setCropName(label)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-800 text-white shadow-2xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                required
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder={t('formCropNamePlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('formVariety')}
                </label>
                <input
                  type="text"
                  value={cropVariety}
                  onChange={(e) => setCropVariety(e.target.value)}
                  placeholder={t('formVarietyPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('formGrowthStage')}
                </label>
                <input
                  type="text"
                  value={growthStage}
                  onChange={(e) => setGrowthStage(e.target.value)}
                  placeholder={t('formGrowthStagePlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t('formLocation')}
              </label>
              <input
                type="text"
                value={farmLocation}
                onChange={(e) => setFarmLocation(e.target.value)}
                placeholder={t('formLocationPlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t('formSymptoms')}
              </label>
              <textarea
                rows={3}
                value={observedSymptoms}
                onChange={(e) => setObservedSymptoms(e.target.value)}
                placeholder={t('formSymptomsPlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 leading-relaxed"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full py-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t('btnAnalyzing')}</span>
              </>
            ) : (
              <>
                <ScanLine className="w-5 h-5 text-emerald-300" />
                <span>{t('btnAnalyze')}</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

