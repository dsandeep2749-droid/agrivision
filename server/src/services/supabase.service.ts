import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

export interface CropAssessmentRecord {
  id: string;
  user_id: string;
  crop_name: string;
  crop_variety?: string | null;
  growth_stage?: string | null;
  farm_location?: string | null;
  image_path?: string | null;
  observed_symptoms?: string | null;
  assessment_summary: string;
  possible_condition?: string | null;
  condition_category?: string | null;
  uncertainty_notes?: string | null;
  visible_symptoms?: string[];
  alternative_explanations?: string[];
  contributing_factors?: string[];
  suggested_next_steps?: string[];
  preventive_practices?: string[];
  expert_review_triggers?: string[];
  model_identifier?: string | null;
  needs_followup?: boolean;
  created_at: string;
}

export interface UserProfileRecord {
  id: string;
  display_name: string;
  preferred_language: 'en' | 'te';
  default_location: string;
  default_lat?: number | null;
  default_lng?: number | null;
  created_at: string;
  updated_at: string;
}

export class SupabaseService {
  private client: SupabaseClient | null = null;
  private adminClient: SupabaseClient | null = null;
  public readonly isConfigured: boolean = false;

  // In-memory store for development/demo mode when Supabase is not yet connected
  private mockProfiles: Map<string, UserProfileRecord> = new Map();
  private mockAssessments: Map<string, CropAssessmentRecord> = new Map();

  constructor() {
    if (env.SUPABASE_URL && (env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY)) {
      this.client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY);
      if (env.SUPABASE_SERVICE_ROLE_KEY) {
        this.adminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
      }
      this.isConfigured = true;
      console.log('✅ Supabase connected successfully');
    } else {
      console.warn('⚠️ Supabase credentials not configured. Running in isolated Local Development Mode.');
      this.seedMockData();
    }
  }

  private seedMockData() {
    const demoUserId = 'demo-farmer-id';
    this.mockProfiles.set(demoUserId, {
      id: demoUserId,
      display_name: 'Ramesh Reddy',
      preferred_language: 'en',
      default_location: 'Guntur, Andhra Pradesh',
      default_lat: 16.3067,
      default_lng: 80.4365,
      created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });

    const assessment1: CropAssessmentRecord = {
      id: 'demo-assess-001',
      user_id: demoUserId,
      crop_name: 'Chilli (మిరప)',
      crop_variety: 'Teja',
      growth_stage: 'Flowering & Fruiting',
      farm_location: 'Guntur, Andhra Pradesh',
      image_path: null,
      observed_symptoms: 'Upward curling of leaves, stunted new leaf growth, pale edges',
      assessment_summary: 'Visible symptoms closely resemble Chilli Leaf Curl or Thrips/Mite feeding damage. Further inspection of leaf undersides is recommended before spraying.',
      possible_condition: 'Possible Chilli Leaf Curl Virus / Thrips Infestation',
      condition_category: 'Pest / Viral Disease',
      uncertainty_notes: 'Image analysis cannot differentiate between early viral mosaic and feeding mite distortion. Physical inspection with a hand lens is necessary.',
      visible_symptoms: [
        'Upward leaf curl and boat-shaped cupping',
        'Slight chlorosis along peripheral leaf margins',
        'Shortened internodes on apex branches'
      ],
      alternative_explanations: [
        'Broad mite feeding damage (usually causes downward curling, but mixed symptoms occur)',
        'Drought or micro-nutrient deficiency (Zinc or Boron imbalance)'
      ],
      contributing_factors: [
        'Prolonged dry, warm weather favoring vector (thrips/whitefly) population build-up',
        'Nearby unmanaged solanaceous weed hosts'
      ],
      suggested_next_steps: [
        'Inspect underside of leaves using a 10x hand lens for minute active nymphs',
        'Install yellow and blue sticky traps (15-20 per acre) to monitor vector presence',
        'Avoid indiscriminate broad-spectrum organophosphate sprays which kill predatory beneficials',
        'Consult with local Mandal Agricultural Officer (MAO) or KVK scientist before applying chemical insecticides'
      ],
      preventive_practices: [
        'Plant barrier crops like maize or sorghum around field borders',
        'Apply neem oil (1500 ppm @ 5ml/liter) in the evening hours as a mild repellent'
      ],
      expert_review_triggers: [
        'More than 25% of plants show sudden apical curling within 48 hours',
        'Flower drop exceeds normal seasonal levels'
      ],
      model_identifier: env.GEMINI_MODEL,
      needs_followup: true,
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    };

    const assessment2: CropAssessmentRecord = {
      id: 'demo-assess-002',
      user_id: demoUserId,
      crop_name: 'Paddy / Rice (వరి)',
      crop_variety: 'BPT 5204 (Samba Mahsuri)',
      growth_stage: 'Tillering',
      farm_location: 'Tenali, Andhra Pradesh',
      image_path: null,
      observed_symptoms: 'Spindle-shaped lesions with brown borders and grey centers on leaf blades',
      assessment_summary: 'Symptom pattern strongly resembles Blast (Magnaporthe oryzae). High humidity and excess nitrogen fertilizer aggravate this condition.',
      possible_condition: 'Possible Rice Blast (Leaf Blast)',
      condition_category: 'Fungal Infection',
      uncertainty_notes: 'Visual patterns align with blast lesions; however, Brown Spot (Bipolaris oryzae) can produce similar markings on deficient soils.',
      visible_symptoms: [
        'Elliptical or spindle-shaped lesions pointed at both ends',
        'Greyish-white center with reddish-brown margin',
        'Occasional coalescing of lesions causing leaf desiccation'
      ],
      alternative_explanations: [
        'Brown spot disease (usually circular or oval rather than distinct spindle)',
        'Physical abrasion or mechanical spray burn'
      ],
      contributing_factors: [
        'Intermittent drizzles and cool night temperatures with dew formation',
        'High nitrogen fertilizer application without balanced potassium'
      ],
      suggested_next_steps: [
        'Avoid excess top-dressing of urea; balance with potash if recommended locally',
        'Maintain proper field drainage and do not let water remain stagnant for too long',
        'Take sample specimens to the nearest Rythu Bharosa Kendram (RBK) or Agricultural Extension Center'
      ],
      preventive_practices: [
        'Use certified blast-resistant seed varieties for subsequent seasons',
        'Treat seeds with Trichoderma or recommended bio-agents prior to nursery sowing'
      ],
      expert_review_triggers: [
        'Lesions appear on collar and neck nodes as crop approaches panicle emergence'
      ],
      model_identifier: env.GEMINI_MODEL,
      needs_followup: false,
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    };

    this.mockAssessments.set(assessment1.id, assessment1);
    this.mockAssessments.set(assessment2.id, assessment2);
  }

  public getClient(): SupabaseClient | null {
    return this.client;
  }

  public getAdminClient(): SupabaseClient | null {
    return this.adminClient || this.client;
  }

  // Profile operations
  async getProfile(userId: string): Promise<UserProfileRecord | null> {
    if (!this.isConfigured || !this.client) {
      return this.mockProfiles.get(userId) || {
        id: userId,
        display_name: 'Farmer',
        preferred_language: 'en',
        default_location: 'Telangana / Andhra Pradesh, India',
        default_lat: 17.3850,
        default_lng: 78.4867,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile from Supabase:', error);
    }
    return data;
  }

  async upsertProfile(profile: Partial<UserProfileRecord> & { id: string }): Promise<UserProfileRecord> {
    if (!this.isConfigured || !this.client) {
      const existing = this.mockProfiles.get(profile.id) || {
        id: profile.id,
        display_name: 'Farmer',
        preferred_language: 'en',
        default_location: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated: UserProfileRecord = {
        ...existing,
        ...profile,
        updated_at: new Date().toISOString(),
      };
      this.mockProfiles.set(profile.id, updated);
      return updated;
    }

    const { data, error } = await this.client
      .from('profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  // Assessment operations
  async saveAssessment(record: Omit<CropAssessmentRecord, 'id' | 'created_at'> & { id?: string }): Promise<CropAssessmentRecord> {
    const newRecord: CropAssessmentRecord = {
      ...record,
      id: record.id || `assess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      needs_followup: record.needs_followup ?? false,
    };

    if (!this.isConfigured || !this.client) {
      this.mockAssessments.set(newRecord.id, newRecord);
      return newRecord;
    }

    const { data, error } = await this.client
      .from('crop_assessments')
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async getAssessments(userId: string, options?: { crop?: string; search?: string; limit?: number; offset?: number }): Promise<{ assessments: CropAssessmentRecord[]; total: number }> {
    if (!this.isConfigured || !this.client) {
      let items = Array.from(this.mockAssessments.values()).filter((a) => a.user_id === userId);
      if (options?.crop && options.crop !== 'all') {
        const cropLower = options.crop.toLowerCase();
        items = items.filter((a) => a.crop_name.toLowerCase().includes(cropLower));
      }
      if (options?.search) {
        const query = options.search.toLowerCase();
        items = items.filter(
          (a) =>
            a.crop_name.toLowerCase().includes(query) ||
            (a.possible_condition && a.possible_condition.toLowerCase().includes(query)) ||
            a.assessment_summary.toLowerCase().includes(query)
        );
      }
      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const total = items.length;
      const limit = options?.limit || 20;
      const offset = options?.offset || 0;
      return { assessments: items.slice(offset, offset + limit), total };
    }

    let query = this.client
      .from('crop_assessments')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.crop && options.crop !== 'all') {
      query = query.ilike('crop_name', `%${options.crop}%`);
    }

    if (options?.search) {
      query = query.or(`crop_name.ilike.%${options.search}%,possible_condition.ilike.%${options.search}%,assessment_summary.ilike.%${options.search}%`);
    }

    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) {
      throw error;
    }
    return { assessments: data || [], total: count || 0 };
  }

  async getAssessmentById(id: string, userId: string): Promise<CropAssessmentRecord | null> {
    if (!this.isConfigured || !this.client) {
      const item = this.mockAssessments.get(id);
      if (item && item.user_id === userId) {
        return item;
      }
      return null;
    }

    const { data, error } = await this.client
      .from('crop_assessments')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  }

  async deleteAssessment(id: string, userId: string): Promise<boolean> {
    if (!this.isConfigured || !this.client) {
      const item = this.mockAssessments.get(id);
      if (item && item.user_id === userId) {
        this.mockAssessments.delete(id);
        return true;
      }
      return false;
    }

    const { error } = await this.client
      .from('crop_assessments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
    return true;
  }
}

export const supabaseService = new SupabaseService();
