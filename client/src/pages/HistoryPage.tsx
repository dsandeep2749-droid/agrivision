import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Calendar, 
  Leaf, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Bot,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api, CropAssessment } from '../services/api';
import { Modal } from '../components/common/Modal';

export const HistoryPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState<CropAssessment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [cropFilter, setCropFilter] = useState<string>('all');

  // Modal & Delete states
  const [selectedRecord, setSelectedRecord] = useState<CropAssessment | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<CropAssessment | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAssessments(token, {
        crop: cropFilter !== 'all' ? cropFilter : undefined,
        search: search.trim() || undefined,
      });
      setAssessments(res.data || []);
    } catch (err: any) {
      console.error('History fetch error:', err);
      setError('Could not retrieve observation history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [token, cropFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords();
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteAssessment(recordToDelete.id, token);
      setAssessments((prev) => prev.filter((a) => a.id !== recordToDelete.id));
      setRecordToDelete(null);
      setFeedbackMsg(t('historyDeletedSuccess'));
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setError('Failed to delete record: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAskAboutRecord = (rec: CropAssessment) => {
    setSelectedRecord(null);
    navigate('/assistant', {
      state: {
        initialPrompt: language === 'te'
          ? `ఈ గత పరిశీలన గురించి వివరాలు కావాలి: ${rec.crop_name} (${rec.possible_condition}). దీనిపై ప్రస్తుత సలహా ఏమిటి?`
          : `I have a question about this previous observation for ${rec.crop_name} (${rec.possible_condition}): What should I monitor next?`,
        cropContext: `${rec.crop_name} - ${rec.possible_condition}`,
      },
    });
  };

  // Distinct crop types for filter pills
  const availableCrops = Array.from(new Set(assessments.map((a) => a.crop_name)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-sans tracking-tight">
          {t('historyTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
          {t('historySubtitle')}
        </p>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Crop Filters */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('historySearchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
          <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>

          <button
            onClick={() => setCropFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              cropFilter === 'all'
                ? 'bg-emerald-800 text-white font-bold'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            {t('historyFilterAll')}
          </button>

          {availableCrops.map((c) => (
            <button
              key={c}
              onClick={() => setCropFilter(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                cropFilter === c
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Record List */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-stone-200 text-xs text-stone-400">
          Loading crop history...
        </div>
      ) : assessments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-2">
          <History className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="text-sm font-semibold text-stone-700">{t('historyNoRecords')}</p>
          <p className="text-xs text-stone-500">Record a new foliar symptom observation on the Crop Analysis page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessments.map((rec) => (
            <div
              key={rec.id}
              className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-emerald-950 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                      {rec.crop_name}
                    </span>
                    {rec.growth_stage && (
                      <span className="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                        {rec.growth_stage}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-400 font-medium">
                    {new Date(rec.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-stone-900">
                  {rec.possible_condition || 'Observation Log'}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {rec.assessment_summary}
                </p>

                {rec.farm_location && (
                  <p className="text-[11px] text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>{rec.farm_location}</span>
                  </p>
                )}
              </div>

              {/* Bottom Action Bar */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedRecord(rec)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{t('historyViewDetails')}</span>
                  </button>

                  <button
                    onClick={() => handleAskAboutRecord(rec)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-teal-700 hover:bg-stone-100 transition-colors cursor-pointer"
                    title="Ask assistant about this"
                  >
                    <Bot className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setRecordToDelete(rec)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={`Crop Observation: ${selectedRecord.crop_name}`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-0.5">
                Assessed Condition
              </span>
              <h4 className="text-base font-bold text-emerald-950">
                {selectedRecord.possible_condition || 'Crop Assessment'}
              </h4>
              <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                {selectedRecord.assessment_summary}
              </p>
            </div>

            {selectedRecord.visible_symptoms && selectedRecord.visible_symptoms.length > 0 && (
              <div>
                <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                  Visible Symptoms
                </h5>
                <ul className="list-disc list-inside text-xs text-stone-700 space-y-1">
                  {selectedRecord.visible_symptoms.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedRecord.suggested_next_steps && selectedRecord.suggested_next_steps.length > 0 && (
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                  Recommended Safe Next Steps
                </h5>
                <ul className="space-y-1.5 text-xs text-stone-700">
                  {selectedRecord.suggested_next_steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-semibold text-emerald-700">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-stone-200 flex justify-between items-center">
              <button
                onClick={() => handleAskAboutRecord(selectedRecord)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-800 hover:bg-teal-900 text-white cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Discuss with Assistant</span>
              </button>

              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 cursor-pointer"
              >
                {t('commonClose')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <Modal
          isOpen={!!recordToDelete}
          onClose={() => setRecordToDelete(null)}
          title="Confirm Deletion"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-stone-600 leading-relaxed">
              {t('historyDeleteConfirm')}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                {t('commonCancel')}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : t('commonDelete')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
