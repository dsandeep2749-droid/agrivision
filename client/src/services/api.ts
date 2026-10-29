export interface SymptomAnalysisResult {
  cropIdentified: string;
  possibleCondition: string;
  conditionCategory: string;
  confidenceLevel: 'High' | 'Moderate' | 'Low' | 'Uncertain';
  confidenceExplanation: string;
  visibleSymptoms: string[];
  alternativeExplanations: string[];
  contributingFactors: string[];
  safeImmediateNextSteps: string[];
  preventivePractices: string[];
  expertReviewTriggers: string[];
  disclaimer: string;
  modelIdentifier: string;
}

export interface CropAssessment {
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

export interface WeatherData {
  location: {
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string;
  };
  current: {
    temperature: number;
    apparentTemperature: number;
    relativeHumidity: number;
    precipitation: number;
    rain: number;
    weatherCode: number;
    conditionText: string;
    windSpeed: number;
    windDirection: number;
    isDay: boolean;
    timestamp: string;
  };
  daily: Array<{
    date: string;
    weatherCode: number;
    conditionText: string;
    tempMax: number;
    tempMin: number;
    precipitationSum: number;
    precipitationProbability: number;
    windSpeedMax: number;
  }>;
  agroInsights: Array<{
    type: string;
    severity: 'info' | 'caution' | 'warning';
    title: string;
    titleTe: string;
    description: string;
    descriptionTe: string;
  }>;
  providerAttribution: string;
  fetchedAt: string;
}

export interface GeoLocation {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export interface UserProfile {
  id: string;
  display_name: string;
  preferred_language: 'en' | 'te';
  default_location: string;
  default_lat?: number | null;
  default_lng?: number | null;
  created_at: string;
  updated_at: string;
}

const API_BASE = '/api';

class ApiService {
  private getHeaders(token?: string | null): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async analyzeCrop(formData: FormData): Promise<{ analysis: SymptomAnalysisResult; inputMetadata: any }> {
    const res = await fetch(`${API_BASE}/crop-assessments/analyze`, {
      method: 'POST',
      body: formData,
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Failed to analyze crop image');
    }
    return json.data;
  }

  async saveAssessment(assessment: Partial<CropAssessment>, token?: string | null): Promise<CropAssessment> {
    const res = await fetch(`${API_BASE}/crop-assessments`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(assessment),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Failed to save crop assessment');
    }
    return json.data;
  }

  async getAssessments(
    token?: string | null,
    params?: { crop?: string; search?: string; limit?: number; offset?: number }
  ): Promise<{ data: CropAssessment[]; meta: { total: number } }> {
    const query = new URLSearchParams();
    if (params?.crop) query.set('crop', params.crop);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));

    const res = await fetch(`${API_BASE}/crop-assessments?${query.toString()}`, {
      headers: this.getHeaders(token),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Failed to fetch assessments');
    }
    return json;
  }

  async getAssessmentById(id: string, token?: string | null): Promise<CropAssessment> {
    const res = await fetch(`${API_BASE}/crop-assessments/${id}`, {
      headers: this.getHeaders(token),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Failed to fetch assessment');
    }
    return json.data;
  }

  async deleteAssessment(id: string, token?: string | null): Promise<void> {
    const res = await fetch(`${API_BASE}/crop-assessments/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Failed to delete assessment');
    }
  }

  async chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    language: 'en' | 'te',
    farmLocation?: string,
    currentCropContext?: string
  ): Promise<string> {
    const res = await fetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        messages,
        language,
        farmLocation,
        currentCropContext,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Failed to communicate with Farming Assistant');
    }
    return json.data.message;
  }

  async getWeather(lat?: number, lon?: number, locationName?: string, stateName?: string): Promise<WeatherData> {
    const query = new URLSearchParams();
    if (lat !== undefined) query.set('lat', String(lat));
    if (lon !== undefined) query.set('lon', String(lon));
    if (locationName) query.set('locationName', locationName);
    if (stateName) query.set('stateName', stateName);

    const res = await fetch(`${API_BASE}/weather?${query.toString()}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Failed to fetch weather data');
    }
    return json.data;
  }

  async searchLocation(q: string): Promise<GeoLocation[]> {
    const res = await fetch(`${API_BASE}/weather/search?q=${encodeURIComponent(q)}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Location search failed');
    }
    return json.data;
  }

  async getProfile(token?: string | null): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: this.getHeaders(token),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Failed to fetch user profile');
    }
    return json.data;
  }

  async updateProfile(profile: Partial<UserProfile>, token?: string | null): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify({
        displayName: profile.display_name,
        preferredLanguage: profile.preferred_language,
        defaultLocation: profile.default_location,
        defaultLat: profile.default_lat,
        defaultLng: profile.default_lng,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Failed to update profile');
    }
    return json.data;
  }

  async getHealth(): Promise<any> {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  }
}

export const api = new ApiService();

