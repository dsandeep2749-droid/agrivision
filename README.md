# 🌾 AgriVision AI — Smart Agriculture & AI Crop Health Platform

A modern, responsive, full-stack AI-assisted agriculture platform tailored for farmers in India. Built with **React**, **TypeScript**, **Tailwind CSS**, **Node.js/Express**, **Google Gemini API**, **Supabase**, and **Open-Meteo**.

Supports seamless switching between **English** and **Telugu (తెలుగు)** with non-chemical, pragmatic recommendations and clear scientific caution.

---

## 🌟 Core Features

1. **Visual Crop Symptom Analysis (`/analyze`)**
   - Upload leaf/foliage photographs (JPEG, PNG, WebP up to 10MB) or drag-and-drop.
   - Crop metadata capture: Popular Indian crops (Chilli, Paddy, Cotton, Tomato, Groundnut, Maize, Wheat, Mango), variety, growth stage, location, farmer notes.
   - Multimodal Gemini analysis returning structured observations: possible condition, foliar symptom descriptions, confidence indicators, alternative explanations, contributing environmental factors, non-chemical safe next steps, and expert review triggers.
   - Option to save observations directly to crop health history.

2. **Bilingual AI Farming Assistant (`/assistant`)**
   - Interactive, respectful agricultural companion supporting English and Telugu.
   - Agricultural guardrails: Prioritizes cultural and biological management, refuses dangerous unverified chemical cocktails, and refers to local Mandal Agricultural Officers (MAO), KVK (Krishi Vigyan Kendra), and Rythu Bharosa Kendram (RBK).
   - Fast suggested questions chips in both languages.
   - Contextual follow-up directly from past crop assessments.

3. **Live Weather & Agro-Insights (`/weather`)**
   - Real-time meteorological observations powered by **Open-Meteo** (no fabricated numbers).
   - Instant geocoding search for Indian villages, mandals, and districts (e.g., Guntur, Warangal, Vijayawada, Kurnool, Nizamabad).
   - GPS Auto-Detection (`navigator.geolocation`).
   - 7-Day interactive temperature & precipitation forecast charts built with **Recharts**.
   - Computed agricultural considerations: Rain-dependent irrigation pauses, foliar spray wind windows, heat stress mitigation, and high-humidity fungal risk alerts.

4. **Saved Crop Observation History (`/history`)**
   - Complete record of past assessments with date, crop type, symptoms, and summaries.
   - Search by crop or condition keyword.
   - Crop type filter pills.
   - Detail inspection modal.
   - Secure deletion with confirmation dialog.

5. **Personalized Farmer Dashboard (`/dashboard`)**
   - Real calculated metrics: Total assessments, 30-day observations, and records requiring follow-up.
   - Quick action shortcuts to analyze crops, consult the assistant, or monitor local weather.
   - Live local weather snapshot.
   - Recent crop activity feed.

6. **Farmer Profile & Settings (`/profile`)**
   - Manage display name, preferred language (English / Telugu), and default farm location.
   - Infrastructure & Supabase database connection health indicators.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7, Lucide React, Recharts |
| **Backend** | Node.js, Express, TypeScript, Multer, Zod, Centralized Error Handler |
| **AI Layer** | Google Gemini API (`@google/genai`), configurable via `GEMINI_MODEL` (`gemini-2.5-flash`) |
| **Weather** | Open-Meteo REST & Geocoding APIs |
| **Database & Auth** | Supabase Authentication & PostgreSQL with Row Level Security (RLS) + Local Dev Mode |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **npm** v9+

### 2. Installation
```bash
# Clone the repository
git clone <repo-url>
cd agrivisionai

# Install root, backend, and frontend dependencies
npm install
npm --prefix server install
npm --prefix client install
```

### 3. Environment Variables
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
PORT=5000
NODE_ENV=development

# Google Gemini API Key from Google AI Studio (https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Supabase Configuration (Optional for local test; app runs in isolated demo mode if omitted)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 4. Running Development Servers
```bash
# Run both Backend API and Vite Frontend concurrently:
npm run dev

# Or run them separately:
npm run dev:server   # Starts Express API at http://localhost:5000
npm run dev:client   # Starts Vite Dev Server at http://localhost:5173
```

### 5. Production Build
```bash
# Build both frontend and backend
npm run build

# Start the unified production server
npm start
# -> Serves the API and pre-compiled client from http://localhost:5000
```

---

## 🗄️ Database Setup (Supabase)

Execute the SQL script located in `supabase/migrations/20261029_initial_schema.sql` inside your **Supabase Dashboard -> SQL Editor**:

1. Creates tables: `profiles`, `crop_assessments`, `crop_observations`.
2. Enables **Row Level Security (RLS)** ensuring farmers can only read/write their own records.
3. Sets up triggers for auto-creating farmer profiles upon Supabase sign-up.
4. Storage Bucket: Create a bucket named `crop-images` in Supabase Storage with private permissions.

---

## ⚠️ Responsible Use Notice

> **Disclaimer:** AgriVision AI provides educational estimations based on visual symptoms and weather metrics. It is **NOT** a certified laboratory diagnosis or chemical prescription service.
> Farmers must never apply toxic chemicals or costly interventions without physical on-field verification by a certified local Agricultural Extension Officer, Krishi Vigyan Kendra (KVK) scientist, or Rythu Bharosa Kendram (RBK) representative.
> Toll-free Farmer Helpline in India: **1800-180-1551 (Kisan Call Center)**.
