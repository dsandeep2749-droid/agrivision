import { GoogleGenAI, Type } from '@google/genai';
import { env } from '../config/env.js';

export interface SymptomAnalysisInput {
  imageBuffer?: Buffer;
  imageMimeType?: string;
  cropName: string;
  cropVariety?: string;
  growthStage?: string;
  farmLocation?: string;
  observedSymptoms?: string;
  language?: 'en' | 'te';
}

export interface SymptomAnalysisResult {
  cropIdentified: string;
  possibleCondition: string;
  conditionCategory: 'Fungal Infection' | 'Bacterial Disease' | 'Viral Disease' | 'Insect/Pest Damage' | 'Nutrient Deficiency' | 'Abiotic/Environmental Stress' | 'Healthy / Non-disease' | 'Indeterminate / Unclear';
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
  rawAnalysisNotes?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  public readonly isConfigured: boolean = false;
  public readonly modelName: string;

  constructor() {
    this.modelName = env.GEMINI_MODEL || 'gemini-2.5-flash';
    if (env.GEMINI_API_KEY) {
      try {
        this.ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
        this.isConfigured = true;
        console.log(`✅ Google Gemini API initialized with model: ${this.modelName}`);
      } catch (err) {
        console.error('Failed to initialize Google Gemini client:', err);
      }
    } else {
      console.warn('⚠️ GEMINI_API_KEY is not set. AI services will use simulated smart responses until configured.');
    }
  }

  /**
   * Analyze crop photograph with farmer context and agricultural safety guidelines
   */
  async analyzeCropSymptom(input: SymptomAnalysisInput): Promise<SymptomAnalysisResult> {
    const lang = input.language === 'te' ? 'Telugu (తెలుగు)' : 'English';

    if (!this.ai || !this.isConfigured) {
      return this.getMockAnalysis(input);
    }

    try {
      const systemInstruction = `
You are AgriVision AI's Senior Agronomist and Crop Pathology Assistant.
Your task is to analyze agricultural crop photographs and farmer observations to provide safe, objective, and cautious diagnostic assessments.

CRITICAL SAFETY & ETHICAL RULES:
1. You are an AI assistant providing preliminary educational assessments, NOT a certified chemical agronomist.
2. NEVER prescribe dangerous chemical doses or brand-name chemical recipes from an image alone. Always prioritize cultural, physical, biological controls, and local Agricultural Extension verification.
3. NEVER fabricate certainty. If the image is blurry, ambiguous, poorly lit, or lacks distinctive lesions, explicitly declare "Low" or "Uncertain" confidence and explain why.
4. Permissible conclusions include: "No clear diagnosis", "Insufficient image quality", "Unable to identify the crop", "Possible non-disease issue", "More information is needed".
5. Emphasize Indian agricultural contexts where applicable (e.g., KVK - Krishi Vigyan Kendra, Mandal Agricultural Officer, Rythu Bharosa Kendram / Kisan Call Center 1551).
6. Target Language: Provide all explanations in ${lang}. For Telugu, use respectful, clear agricultural Telugu terms with English scientific names in parentheses where appropriate.
7. Return strictly valid JSON adhering to the specified schema.
`;

      const promptParts: any[] = [];

      // Add image if available
      if (input.imageBuffer && input.imageMimeType) {
        promptParts.push({
          inlineData: {
            mimeType: input.imageMimeType,
            data: input.imageBuffer.toString('base64'),
          },
        });
      }

      const userTextContext = `
Analyze this crop observation:
- Stated Crop Name: ${input.cropName || 'Unspecified'}
- Variety: ${input.cropVariety || 'Unspecified'}
- Growth Stage: ${input.growthStage || 'Unspecified'}
- Farm Location: ${input.farmLocation || 'Unspecified'}
- Farmer's Observed Symptoms: ${input.observedSymptoms || 'None described'}

Evaluate the visible symptoms on the crop or foliage. Provide a detailed, cautious assessment in valid JSON.
`;
      promptParts.push(userTextContext);

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: promptParts,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cropIdentified: { type: Type.STRING, description: 'Identified crop name or confirmation' },
              possibleCondition: { type: Type.STRING, description: 'Primary possible condition or "Indeterminate / Unclear"' },
              conditionCategory: {
                type: Type.STRING,
                description: 'One of: Fungal Infection, Bacterial Disease, Viral Disease, Insect/Pest Damage, Nutrient Deficiency, Abiotic/Environmental Stress, Healthy / Non-disease, Indeterminate / Unclear',
              },
              confidenceLevel: {
                type: Type.STRING,
                description: 'High, Moderate, Low, or Uncertain',
              },
              confidenceExplanation: { type: Type.STRING, description: 'Why this confidence level was chosen, highlighting image limitations' },
              visibleSymptoms: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Distinct visual symptoms observed in the image or description',
              },
              alternativeExplanations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Other possible causes with overlapping symptoms',
              },
              contributingFactors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Weather, soil, moisture, or cultural conditions favoring this symptom',
              },
              safeImmediateNextSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Safe, non-destructive initial actions (isolating affected plants, scouting, checking moisture)',
              },
              preventivePractices: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Long-term cultural and bio-management practices',
              },
              expertReviewTriggers: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Indicators that require immediate physical review by a local agricultural officer or lab',
              },
              disclaimer: { type: Type.STRING, description: 'Clear notice that AI predictions are estimates and not certified diagnoses' },
            },
            required: [
              'cropIdentified',
              'possibleCondition',
              'conditionCategory',
              'confidenceLevel',
              'confidenceExplanation',
              'visibleSymptoms',
              'safeImmediateNextSteps',
              'disclaimer',
            ],
          },
        },
      });

      const parsedText = response.text;
      if (!parsedText) {
        throw new Error('Gemini API returned an empty response.');
      }

      const parsed: SymptomAnalysisResult = JSON.parse(parsedText);
      parsed.modelIdentifier = this.modelName;
      if (!parsed.disclaimer) {
        parsed.disclaimer = input.language === 'te'
          ? 'గమనిక: ఈ AI అంచనా కేవలం ప్రాథమిక సూచన మాత్రమే. ఎటువంటి రసాయన లేదా ఖర్చుతో కూడిన మందులు పిచికారీ చేయడానికి ముందు స్థానిక వ్యవసాయ అధికారి (MAO/KVK/RBK) తో సరిచూసుకోండి.'
          : 'Disclaimer: This AI assessment is an estimate based on visual cues and is not a certified laboratory diagnosis. Always consult with a qualified local agricultural officer or extension specialist before making treatment decisions.';
      }
      return parsed;
    } catch (err: any) {
      console.error('Gemini symptom analysis failed:', err);
      // Fallback with informative message
      return this.getMockAnalysis(input, `API note: ${err.message}`);
    }
  }

  /**
   * Conversational assistant with context management and agricultural guardrails
   */
  async chatAssistant(
    messages: ChatMessage[],
    options?: {
      language?: 'en' | 'te';
      farmLocation?: string;
      currentCropContext?: string;
    }
  ): Promise<string> {
    const lang = options?.language === 'te' ? 'Telugu (తెలుగు)' : 'English';

    if (!this.ai || !this.isConfigured) {
      return this.getMockChatResponse(messages[messages.length - 1]?.content || '', options?.language);
    }

    try {
      // Limit context to last 10 messages to prevent excessive token usage
      const recentMessages = messages.slice(-10);

      const systemInstruction = `
You are the AgriVision AI Farming Assistant, an empathetic, highly knowledgeable agricultural companion for farmers in India.
Your mission is to support farmers with crop management, irrigation, pest prevention, organic practices, and understanding agricultural concepts.

BEHAVIORAL DIRECTIVES:
1. Speak in ${lang}. When speaking Telugu, use polite, encouraging, farmer-friendly Telugu (గౌరవప్రదమైన గ్రామీణ రైతు భాష), with transliterated terms or scientific names in brackets when clarity helps.
2. Always clarify that you cannot physically test the soil or see real-time micro-climate unless provided.
3. NEVER prescribe heavy chemical cocktails or unverified pesticide mixtures. Always start with cultural controls (crop rotation, clean weeding, trap crops, spacing), bio-pesticides (neem oil, Trichoderma, Pseudomonas), and advise testing at a local KVK (Krishi Vigyan Kendra) or Rythu Bharosa Kendram.
4. Keep answers concise, actionable, bulleted, and structured so they are easy to read on mobile screens in sunny fields.
5. If the farmer asks about weather, remind them to check the local Weather tab on the dashboard for their exact Mandal/District forecast.
${options?.farmLocation ? `Farmer Location Context: ${options.farmLocation}` : ''}
${options?.currentCropContext ? `Current Crop In Discussion: ${options.currentCropContext}` : ''}
`;

      const contents = recentMessages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: contents,
        config: {
          systemInstruction,
          temperature: 0.6,
          maxOutputTokens: 800,
        },
      });

      return response.text || 'I could not generate a response at this time. Please try asking again.';
    } catch (err: any) {
      console.error('Gemini chat error:', err);
      return this.getMockChatResponse(messages[messages.length - 1]?.content || '', options?.language);
    }
  }

  /**
   * Educational, realistic mock analysis for test/demo mode
   */
  private getMockAnalysis(input: SymptomAnalysisInput, notice?: string): SymptomAnalysisResult {
    const isTe = input.language === 'te';
    const crop = input.cropName || (isTe ? 'పంట (సాధారణ)' : 'General Crop');

    if (isTe) {
      return {
        cropIdentified: `${crop} - పరిశీలన`,
        possibleCondition: 'ప్రాథమిక లక్షణాలు: ఆకు మచ్చ లేదా రసం పీల్చే పురుగుల ప్రభావం',
        conditionCategory: 'Insect/Pest Damage',
        confidenceLevel: 'Moderate',
        confidenceExplanation: 'చిత్రం మరియు మీరు నమోదు చేసిన లక్షణాల ఆధారంగా రూపొందించిన ప్రాథమిక పరిశీలన. సూక్ష్మ పురుగుల లేదా శిలీంధ్రాల నిర్ధారణకు స్థానిక పరీక్ష అవసరం.',
        visibleSymptoms: [
          'ఆకులపై పసుపు లేదా గోధుమ రంగు మచ్చలు కనిపించడం',
          'కొత్తగా వచ్చే ఆకులు పైకి లేదా కిందకి ముడుచుకోవడం',
          'మొక్క ఎదుగుదల కొద్దిగా మందగించడం',
        ],
        alternativeExplanations: [
          'మైక్రో న్యూట్రియెంట్ (జింక్ లేదా బోరాన్) లోపం వల్ల కూడా ఇటువంటి లక్షణాలు కనిపించవచ్చు.',
          'వాతావరణంలో అధిక ఉష్ణోగ్రత మరియు తేమ లేకపోవడం.',
        ],
        contributingFactors: [
          'పొడి వాతావరణం మరియు ఎండ తీవ్రత',
          'పొలంలో నీటి పారుదల అసమానంగా ఉండటం',
        ],
        safeImmediateNextSteps: [
          'ఆకుల అడుగు భాగాన్ని లెన్స్ సహాయంతో పరిశీలించి చిన్న పురుగులు ఉన్నాయా చూడండి.',
          'పొలంలో పసుపు మరియు నీలి రంగు జిగురు అట్టలు (ఎకరానికి 15-20) ఏర్పాటు చేయండి.',
          'సాయంత్రం వేళల్లో 5మి.లీ వేప నూనె (1500 ppm) లీటరు నీటికి కలిపి పిచికారీ చేయండి.',
          'ఎటువంటి ఖరీదైన రసాయన మందులు కొట్టే ముందు మీ గ్రామ వ్యవసాయ సహాయకుడు (VAA) లేదా RBK అధికారిని సంప్రదించండి.',
        ],
        preventivePractices: [
          'పంట చుట్టూ జొన్న లేదా మొక్కజొన్నను సరిహద్దు పంటగా వేయడం ద్వారా పురుగుల వ్యాప్తిని తగ్గించవచ్చు.',
          'యూరియా మోతాదును తగ్గించి సమతుల్య ఎరువులను వాడండి.',
        ],
        expertReviewTriggers: [
          'పంటలో 20% కంటే ఎక్కువ మొక్కలు త్వరితగతిన వాడిపోతున్నట్లయితే తక్షణమే వ్యవసాయ శాస్త్రవేత్తలను సంప్రదించండి.',
        ],
        disclaimer: 'ముఖ్య గమనిక: ఇది AI ఆధారిత ప్రాథమిక అంచనా మాత్రమే. రసాయన మందులు పిచికారీ చేసే ముందు ఎల్లప్పుడూ ధృవీకరించబడిన వ్యవసాయ నిపుణుడి సలహా తీసుకోండి.' + (notice ? ` (${notice})` : ''),
        modelIdentifier: `${this.modelName} (Demo Mode)`,
      };
    }

    return {
      cropIdentified: `${crop} - Foliar Observation`,
      possibleCondition: 'Possible Early Foliar Spot / Sucking Pest Infestation',
      conditionCategory: 'Insect/Pest Damage',
      confidenceLevel: 'Moderate',
      confidenceExplanation: 'Estimated from visual symptoms and provided context. Physical confirmation is recommended to differentiate between biotic damage and nutrient stress.',
      visibleSymptoms: [
        'Visible discoloration and localized chlorosis on older leaves',
        'Slight curling and irregular leaf margins on tender shoot tips',
        'Moderate vigor reduction on affected branches',
      ],
      alternativeExplanations: [
        'Micronutrient deficiency (Zinc or Iron chlorosis caused by alkaline soil conditions)',
        'Moisture stress combined with intense daytime sunlight exposure',
      ],
      contributingFactors: [
        'Warm dry weather favoring rapid reproduction of sap-sucking vectors',
        'Imbalanced nitrogen fertilization weakening plant epidermal cell walls',
      ],
      safeImmediateNextSteps: [
        'Scout 10-15 random plants in an X-pattern across the plot, examining the undersides of leaves',
        'Install yellow and blue sticky traps (15-20 per acre) to monitor insect pest density safely',
        'Apply an organic botanical spray such as cold-pressed Neem Oil (1500 ppm at 5 ml/liter) in the late afternoon',
        'Refrain from spraying harsh synthetic cocktails before consulting your nearest Agricultural Extension Officer or Krishi Vigyan Kendra (KVK)',
      ],
      preventivePractices: [
        'Incorporate well-decomposed Farm Yard Manure (FYM) enriched with Trichoderma viride before the next sowing cycle',
        'Establish tall border trap crops (sorghum, pearl millet, or maize) around field boundaries',
      ],
      expertReviewTriggers: [
        'Symptoms escalate to stem blackening, vascular wilting, or premature flower drop across >20% of the plot',
      ],
      disclaimer: 'Important Notice: This AI assessment is an estimate based on visual cues and is not a certified laboratory diagnosis. Always consult with a qualified local agricultural officer or extension specialist before making treatment decisions.' + (notice ? ` (${notice})` : ''),
      modelIdentifier: `${this.modelName} (Demo Mode)`,
    };
  }

  private getMockChatResponse(query: string, language?: 'en' | 'te'): string {
    const isTe = language === 'te';
    const q = query.toLowerCase();

    if (isTe) {
      if (q.includes('పసుపు') || q.includes('yellow') || q.includes('ఆకులు')) {
        return `నమస్కారం రైతు సోదరులారా. ఆకులు పసుపు రంగులోకి మారడానికి ముఖ్యమైన కారణాలు:

1. **నత్రజని (Nitrogen) లోపం**: సాధారణంగా పాత ఆకులు మొదట పసుపు రంగులోకి మారి తర్వాత పై ఆకులకు వ్యాపిస్తుంది.
2. **అధిక నీరు లేదా మురుగు నీరు**: వేర్లకు గాలి అందకపోవడం వల్ల ఆకులు పసుపుబారతాయి. తగినంత నీటి పారుదల సౌకర్యం కల్పించండి.
3. **రసం పీల్చే పురుగులు**: తెల్లదోమ, పేనుబంక లేదా తామర పురుగులు రసం పీల్చడం వల్ల ఆకులపై పసుపు మచ్చలు ఏర్పడతాయి.

**తక్షణ సలహా**:
- పొలంలో నీరు నిల్వ ఉండకుండా చూసుకోండి.
- ఆకుల అడుగు భాగాన్ని పరిశీలించండి.
- మీ మండల వ్యవసాయ అధికారి లేదా ఆర్బీకే (RBK) కేంద్రంలో మీ మట్టి మరియు ఆకు నమూనాను చూపించి తగిన మోతాదులో ఎరువులు వాడండి.`;
      }
      return `నమస్కారం! నేను మీ AgriVision AI వ్యవసాయ సహాయకుడిని. 

మీ పంటల సంరక్షణ, నీటి నిర్వహణ, ఎరువుల సమతుల్యత మరియు తెగుళ్ళ నివారణపై ఏవైనా ప్రశ్నలు ఉంటే అడగండి. 

*చిట్కా: మీరు ఖచ్చితమైన సమాధానం కోసం మీ పంట పేరు, పంట వయస్సు మరియు మీ ప్రాంతాన్ని కూడా తెలపండి.*`;
    }

    if (q.includes('yellow') || q.includes('curling') || q.includes('leaf')) {
      return `Hello! Leaf yellowing (chlorosis) can arise from several distinct factors:

1. **Nitrogen or Iron Deficiency**: If older leaves yellow uniformly first, it frequently indicates nitrogen deficiency. If the newest leaves show yellowing between green veins, it is often iron or zinc chlorosis.
2. **Root Zone Saturation / Waterlogging**: Saturated soil deprives roots of oxygen, preventing nutrient uptake. Ensure field drainage channels are clear.
3. **Sap-Sucking Insects**: Thrips, aphids, or whiteflies drain sap from leaves, causing mottled yellowing and curling.

**Recommended Safe Next Steps**:
- Check soil moisture around root depth before irrigating.
- Inspect the underside of 10 random leaves for small insects or mites.
- Take a sample leaf to your nearest Krishi Vigyan Kendra (KVK) or local Agricultural Extension center for free guidance.`;
    }

    return `Hello! I am your AgriVision AI Farming Assistant.

I am here to help you understand crop health, sustainable farming practices, weather-smart scheduling, and preventive pest management.

Feel free to ask questions like:
- "What is the best irrigation timing for my crop during high heat?"
- "How do I spot early signs of blast or blight?"
- "What organic preventive measures work against leaf curl?"

*Note: Please share your crop type and growth stage for more tailored educational guidance.*`;
  }
}

export const geminiService = new GeminiService();

