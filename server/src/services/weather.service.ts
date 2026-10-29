export interface GeoLocation {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // State / Region
  timezone?: string;
}

export interface CurrentWeather {
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
}

export interface DailyForecast {
  date: string;
  weatherCode: number;
  conditionText: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbability: number;
  windSpeedMax: number;
}

export interface AgroInsight {
  type: 'irrigation' | 'spraying' | 'heat_stress' | 'disease_risk' | 'general';
  severity: 'info' | 'caution' | 'warning';
  title: string;
  titleTe: string;
  description: string;
  descriptionTe: string;
}

export interface WeatherResponse {
  location: GeoLocation;
  current: CurrentWeather;
  daily: DailyForecast[];
  agroInsights: AgroInsight[];
  providerAttribution: string;
  fetchedAt: string;
}

// WMO Weather interpretation codes (WW)
const WMO_CODE_MAP: Record<number, { en: string; te: string }> = {
  0: { en: 'Clear sky', te: 'నిర్మలమైన ఆకాశం' },
  1: { en: 'Mainly clear', te: 'ఎక్కువగా నిర్మలంగా' },
  2: { en: 'Partly cloudy', te: 'పాక్షికంగా మేఘావృతం' },
  3: { en: 'Overcast', te: 'పూర్తిగా మేఘావృతం' },
  45: { en: 'Fog', te: 'పొగమంచు' },
  48: { en: 'Depositing rime fog', te: 'మంచు తెర' },
  51: { en: 'Light drizzle', te: 'తేలికపాటి చిరుజల్లు' },
  53: { en: 'Moderate drizzle', te: 'మధ్యస్థ చిరుజల్లు' },
  55: { en: 'Dense drizzle', te: 'దట్టమైన చిరుజల్లు' },
  61: { en: 'Slight rain', te: 'తేలికపాటి వర్షం' },
  63: { en: 'Moderate rain', te: 'మధ్యస్థ వర్షం' },
  65: { en: 'Heavy rain', te: 'భారీ వర్షం' },
  71: { en: 'Slight snow', te: 'తేలికపాటి హిమపాతం' },
  73: { en: 'Moderate snow', te: 'మధ్యస్థ హిమపాతం' },
  75: { en: 'Heavy snow', te: 'తీవ్ర హిమపాతం' },
  80: { en: 'Slight rain showers', te: 'తేలికపాటి జల్లులు' },
  81: { en: 'Moderate rain showers', te: 'మధ్యస్థ వర్షపు జల్లులు' },
  82: { en: 'Violent rain showers', te: 'తీవ్రమైన వర్షపు జల్లులు' },
  95: { en: 'Thunderstorm', te: 'ఉరుములతో కూడిన వర్షం' },
  96: { en: 'Thunderstorm with slight hail', te: 'వడగండ్ల వాన' },
  99: { en: 'Thunderstorm with heavy hail', te: 'భారీ వడగండ్ల తుఫాను' },
};

export class WeatherService {
  private readonly baseUrl = 'https://api.open-meteo.com/v1';
  private readonly geocodingUrl = 'https://geocoding-api.open-meteo.com/v1';

  /**
   * Search location by name using Open-Meteo Geocoding API
   */
  async searchLocations(query: string): Promise<GeoLocation[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const url = `${this.geocodingUrl}/search?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Geocoding request failed with status: ${res.status}`);
      }

      const data = (await res.json()) as any;
      if (!data.results || !Array.isArray(data.results)) {
        return [];
      }

      return data.results.map((r: any) => ({
        name: r.name,
        latitude: r.latitude,
        longitude: r.longitude,
        country: r.country || 'India',
        admin1: r.admin1 || '',
        timezone: r.timezone || 'Asia/Kolkata',
      }));
    } catch (err: any) {
      console.error('Geocoding search failed:', err.message);
      throw new Error(`Failed to lookup location "${query}": ${err.message}`);
    }
  }

  /**
   * Fetch live weather and generate agricultural considerations
   */
  async getWeather(lat: number, lon: number, locationName?: string, stateName?: string): Promise<WeatherResponse> {
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      throw new Error('Invalid coordinates provided for weather lookup.');
    }

    try {
      const weatherUrl = `${this.baseUrl}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

      const res = await fetch(weatherUrl);
      if (!res.ok) {
        throw new Error(`Open-Meteo weather API responded with status ${res.status}`);
      }

      const data = (await res.json()) as any;

      const currentRaw = data.current;
      const dailyRaw = data.daily;

      const current: CurrentWeather = {
        temperature: currentRaw.temperature_2m,
        apparentTemperature: currentRaw.apparent_temperature,
        relativeHumidity: currentRaw.relative_humidity_2m,
        precipitation: currentRaw.precipitation,
        rain: currentRaw.rain,
        weatherCode: currentRaw.weather_code,
        conditionText: WMO_CODE_MAP[currentRaw.weather_code]?.en || 'Clear',
        windSpeed: currentRaw.wind_speed_10m,
        windDirection: currentRaw.wind_direction_10m,
        isDay: currentRaw.is_day === 1,
        timestamp: currentRaw.time,
      };

      const daily: DailyForecast[] = [];
      if (dailyRaw && dailyRaw.time && Array.isArray(dailyRaw.time)) {
        for (let i = 0; i < dailyRaw.time.length; i++) {
          const code = dailyRaw.weather_code[i] ?? 0;
          daily.push({
            date: dailyRaw.time[i],
            weatherCode: code,
            conditionText: WMO_CODE_MAP[code]?.en || 'Clear',
            tempMax: dailyRaw.temperature_2m_max[i],
            tempMin: dailyRaw.temperature_2m_min[i],
            precipitationSum: dailyRaw.precipitation_sum[i],
            precipitationProbability: dailyRaw.precipitation_probability_max[i] ?? 0,
            windSpeedMax: dailyRaw.wind_speed_10m_max[i],
          });
        }
      }

      // Generate objective, cautious agricultural considerations
      const agroInsights = this.generateAgroInsights(current, daily);

      return {
        location: {
          name: locationName || 'Farm Location',
          latitude: lat,
          longitude: lon,
          country: 'India',
          admin1: stateName || '',
          timezone: data.timezone || 'Asia/Kolkata',
        },
        current,
        daily,
        agroInsights,
        providerAttribution: 'Weather data provided by Open-Meteo under CC BY 4.0. Actual on-field microclimate may vary.',
        fetchedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      console.error('Weather fetch error:', err.message);
      throw new Error(`Weather information temporarily unavailable: ${err.message}`);
    }
  }

  /**
   * Derive cautious, non-prescriptive agro considerations
   */
  private generateAgroInsights(current: CurrentWeather, daily: DailyForecast[]): AgroInsight[] {
    const insights: AgroInsight[] = [];

    // 1. Rain / Irrigation check
    const rainExpectedNext48h = daily.slice(0, 2).some((d) => d.precipitationProbability > 50 || d.precipitationSum > 3);
    const rainToday = (daily[0]?.precipitationSum || 0) > 2 || current.rain > 0;

    if (rainToday || rainExpectedNext48h) {
      insights.push({
        type: 'irrigation',
        severity: 'caution',
        title: 'Rain Anticipated: Check Planned Irrigation',
        titleTe: 'వర్ష సూచన: నీటి పారుదలని సరిచూసుకోండి',
        description: 'Significant precipitation or high rainfall probability detected within 48 hours. Consider postponing scheduled flood or furrow irrigation to conserve water and prevent waterlogging.',
        descriptionTe: 'రాబోయే 48 గంటల్లో వర్షం కురిసే అవకాశం ఉంది. నీటి వృధా మరియు పొలంలో నీరు నిల్వ ఉండకుండా ఉండటానికి ముందస్తు నీటి పారుదలను వాయిదా వేసుకోవడం మంచిది.',
      });
    } else {
      insights.push({
        type: 'irrigation',
        severity: 'info',
        title: 'Dry Spell: Monitor Soil Moisture',
        titleTe: 'పొడి వాతావరణం: నేలలో తేమను గమనించండి',
        description: 'No heavy rainfall expected in the immediate forecast. Inspect root-zone moisture before next irrigation cycle, especially for sensitive vegetable or flower crops.',
        descriptionTe: 'తక్షణమే భారీ వర్ష సూచన లేదు. పంట వేర్ల వద్ద నేల తేమను పరిశీలించి అవసరమైన మేరకే తడులు ఇవ్వండి.',
      });
    }

    // 2. Spraying & Drift window
    if (current.windSpeed > 18 || (daily[0]?.windSpeedMax || 0) > 22) {
      insights.push({
        type: 'spraying',
        severity: 'warning',
        title: 'High Wind Velocity: Caution with Foliar Spraying',
        titleTe: 'అధిక గాలి వేగం: పిచికారీ చేసేటప్పుడు జాగ్రత్త',
        description: `Current or peak wind speeds exceed ${current.windSpeed.toFixed(0)} km/h. High winds cause droplet drift away from target foliage and waste costly inputs. Prefer calm early mornings or late afternoons.`,
        descriptionTe: `గాలి వేగం ఎక్కువగా ఉంది (${current.windSpeed.toFixed(0)} km/h). ఈ సమయంలో పిచికారీ చేస్తే మందు గాలికి కొట్టుకుపోయి వృధా అవుతుంది. ఉదయం లేదా సాయంత్రం ప్రశాంత సమయాల్లో పిచికారీ చేయండి.`,
      });
    } else if (rainExpectedNext48h) {
      insights.push({
        type: 'spraying',
        severity: 'caution',
        title: 'Rain Risk for Foliar Sprays',
        titleTe: 'వర్షం వల్ల పిచికారీ మందు కొట్టుకుపోయే ప్రమాదం',
        description: 'Applying foliar fertilizers or protective sprays right before rain may cause chemical runoff. Ensure at least 4-6 hours of rain-free duration (rain-fastness) before spraying.',
        descriptionTe: 'వర్షానికి ముందు మందులు పిచికారీ చేస్తే అవి కొట్టుకుపోతాయి. పిచికారీ చేసిన తర్వాత కనీసం 4-6 గంటలు వర్షం పడకుండా ఉండే వాతావరణాన్ని ఎంచుకోండి.',
      });
    } else {
      insights.push({
        type: 'spraying',
        severity: 'info',
        title: 'Favorable Spraying Window',
        titleTe: 'మందుల పిచికారీకి అనుకూల వాతావరణం',
        description: 'Current wind and moisture conditions appear calm. If applying biological or nutrient sprays, early morning or late evening is optimal to prevent rapid leaf evaporation.',
        descriptionTe: 'గాలి వేగం సాధారణంగా ఉంది. జీవ లేదా పోషక ద్రావణాల పిచికారీకి ఉదయం లేదా సాయంత్రం సమయం అనుకూలంగా ఉంటుంది.',
      });
    }

    // 3. Temperature & Heat Stress
    const maxTemp = daily[0]?.tempMax || current.temperature;
    if (maxTemp >= 36) {
      insights.push({
        type: 'heat_stress',
        severity: 'warning',
        title: 'High Day Temperatures: Heat Stress Risk',
        titleTe: 'అధిక ఉష్ణోగ్రత: ఎండ తీవ్రత ముప్పు',
        description: `Maximum daytime temperature expected around ${maxTemp.toFixed(0)}°C. High heat elevates evapotranspiration and may cause flower drop. Maintain light, frequent watering and avoid mid-day fieldwork.`,
        descriptionTe: `పగటి ఉష్ణోగ్రత దాదాపు ${maxTemp.toFixed(0)}°C కి చేరే అవకాశం ఉంది. ఎండ తీవ్రత వల్ల పువ్వులు రాలిపోయే ప్రమాదం ఉంది. సాయంత్రం వేళల్లో తేలికపాటి తడులు ఇవ్వండి.`,
      });
    }

    // 4. Relative Humidity & Fungal Risk
    if (current.relativeHumidity >= 80) {
      insights.push({
        type: 'disease_risk',
        severity: 'caution',
        title: 'High Humidity: Elevated Fungal/Bacterial Risk',
        titleTe: 'అధిక తేమ: శిలీంధ్ర మరియు తెగుళ్ళ వ్యాప్తి ముప్పు',
        description: `Relative humidity is elevated at ${current.relativeHumidity}%. Prolonged leaf wetness combined with warm temperatures creates favorable conditions for foliar blights and rusts. Regularly scout inner canopy leaves.`,
        descriptionTe: `గాలిలో తేమ శాతం (${current.relativeHumidity}%) ఎక్కువగా ఉంది. దీనివల్ల ఆకుమచ్చ మరియు బూజు తెగుళ్ళు వ్యాపించే అవకాశం ఉంది. పంటను నిశితంగా పరిశీలిస్తూ ఉండండి.`,
      });
    }

    return insights;
  }
}

export const weatherService = new WeatherService();
