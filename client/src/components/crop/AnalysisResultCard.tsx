import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ShieldAlert, 
  ChevronRight, 
  Bookmark, 
  Bot, 
  Leaf, 
  ThermometerSnowflake, 
  Eye, 
  Sparkles,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SymptomAnalysisResult } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface AnalysisResultCardProps {
  result: SymptomAnalysisResult;
  onSave?: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
  imagePreviewUrl?: string | null;
}

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({
  result,
  onSave,
  isSaving = false,
  isSaved = false,
  imagePreviewUrl,
}) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence?.toLowerCase()) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            High Confidence
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Moderate Confidence
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-300">
            <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
            Uncertain / Low Confidence
          </span>
        );
    }
  };

  const handleAskFollowup = () => {
    navigate('/assistant', {
      state: {
        initialPrompt: language === 'te'
          ? `ఈ పంట పరిశీలన గురించి వివరించండి: ${result.cropIdentified}. సంభావ్య సమస్య: ${result.possibleCondition}. మరింత సమాచారం కావాలి.`
          : `Can you explain more about this assessment for ${result.cropIdentified} (${result.possibleCondition})? What should I scout next?`,
        cropContext: `${result.cropIdentified} - ${result.possibleCondition}`,
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-br from-emerald-900 to-green-900 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Leaf className="w-4 h-4" />
              <span>{result.cropIdentified}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-sans text-white">
              {result.possibleCondition}
            </h2>
            <p className="text-xs text-emerald-200/80 mt-1">
              {t('resCategory')}: <span className="font-semibold text-white">{result.conditionCategory}</span>
            </p>
          </div>

          <div className="flex sm:flex-col items-end gap-2 shrink-0">
            {getConfidenceBadge(result.confidenceLevel)}
            {result.modelIdentifier && (
              <span className="text-[10px] text-emerald-300/80 bg-white/10 px-2 py-0.5 rounded font-mono">
                {result.modelIdentifier}
              </span>
            )}
          </div>
        </div>

        {/* Confidence explanation pill */}
        {result.confidenceExplanation && (
          <div className="mt-4 pt-4 border-t border-emerald-800/60 text-xs text-emerald-100/90 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{result.confidenceExplanation}</p>
          </div>
        )}
      </div>

      <div className="px-6 space-y-6">
        {/* Optional Image Preview thumbnail */}
        {imagePreviewUrl && (
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-4">
            <img
              src={imagePreviewUrl}
              alt="Analyzed Crop Foliage"
              className="w-20 h-20 rounded-lg object-cover border border-stone-300 shrink-0"
            />
            <div className="text-xs text-stone-600">
              <p className="font-semibold text-stone-800 mb-0.5">Analyzed Photograph</p>
              <p>Visual features and lesion distributions were evaluated from this sample.</p>
            </div>
          </div>
        )}

        {/* Visible Symptoms */}
        {result.visibleSymptoms && result.visibleSymptoms.length > 0 && (
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70">
            <div className="flex items-center gap-2 mb-2 text-stone-900 font-bold text-sm">
              <Eye className="w-4 h-4 text-emerald-700" />
              <span>{t('resVisibleSymptoms')}</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
              {result.visibleSymptoms.map((sym, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{sym}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Safe Immediate Next Steps (Cultural / Bio) */}
        {result.safeImmediateNextSteps && result.safeImmediateNextSteps.length > 0 && (
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2 text-emerald-950 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{t('resSafeNextSteps')}</span>
            </div>
            <ul className="space-y-2 text-xs text-emerald-900">
              {result.safeImmediateNextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-semibold text-emerald-700 shrink-0">{i + 1}.</span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Alternatives & Contributing Factors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Alternatives */}
          {result.alternativeExplanations && result.alternativeExplanations.length > 0 && (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70">
              <div className="flex items-center gap-2 mb-2 text-stone-900 font-bold text-sm">
                <HelpCircle className="w-4 h-4 text-stone-600" />
                <span>{t('resAlternatives')}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-stone-600">
                {result.alternativeExplanations.map((alt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-stone-400">•</span>
                    <span>{alt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contributing Factors */}
          {result.contributingFactors && result.contributingFactors.length > 0 && (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70">
              <div className="flex items-center gap-2 mb-2 text-stone-900 font-bold text-sm">
                <ThermometerSnowflake className="w-4 h-4 text-amber-600" />
                <span>{t('resContributingFactors')}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-stone-600">
                {result.contributingFactors.map((fact, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-stone-400">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Preventive Practices */}
        {result.preventivePractices && result.preventivePractices.length > 0 && (
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70">
            <div className="flex items-center gap-2 mb-2 text-stone-900 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-teal-700" />
              <span>{t('resPreventivePractices')}</span>
            </div>
            <ul className="space-y-1.5 text-xs text-stone-700">
              {result.preventivePractices.map((prev, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>{prev}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Conditions Requiring Expert Review */}
        {result.expertReviewTriggers && result.expertReviewTriggers.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{t('resExpertTriggers')}</span>
            </div>
            <ul className="space-y-1.5 text-xs text-amber-900">
              {result.expertReviewTriggers.map((trig, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">!</span>
                  <span>{trig}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer Notice */}
        <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-600 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-stone-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-stone-800 block mb-0.5">{t('resDisclaimerTitle')}</span>
            <p className="leading-relaxed">{result.disclaimer}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pb-6 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-200">
          <div className="flex items-center gap-2">
            {onSave && (
              <button
                onClick={onSave}
                disabled={isSaving || isSaved}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{isSaved ? t('btnSaved') : isSaving ? 'Saving...' : t('btnSaveHistory')}</span>
              </button>
            )}
          </div>

          <button
            onClick={handleAskFollowup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition-colors cursor-pointer"
          >
            <Bot className="w-4 h-4 text-emerald-700" />
            <span>{t('btnAskFollowup')}</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

