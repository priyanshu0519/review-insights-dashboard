

# Sentiment Analysis Dashboard - Implementation Plan

## Overview
Build a React frontend dashboard with mock sentiment analysis data that can later connect to a real FastAPI backend. The dashboard will visualize sentiment analysis results with charts, aspect-based breakdowns, and allow text input and CSV upload.

## Pages & Components

### 1. Main Dashboard Page (`src/pages/Index.tsx`)
- Header with app title and description
- Two input modes via tabs: single review text input, CSV file upload
- Results section below inputs

### 2. Components to Create

**Input Components:**
- `ReviewInput` - Textarea for single review + Analyze button
- `CsvUpload` - File upload area for CSV files with drag-and-drop styling

**Results Components:**
- `SentimentResult` - Shows predicted sentiment (positive/negative/neutral) with confidence score badge
- `SentimentDistributionChart` - Pie chart showing distribution of sentiments (recharts)
- `AspectSentimentChart` - Bar chart showing sentiment per aspect (battery, camera, price, etc.)
- `WordFrequencyChart` - Horizontal bar chart of top words
- `ModelMetrics` - Cards showing accuracy, precision, recall, F1 score
- `ConfusionMatrix` - Simple table/grid visualization

**Layout:**
- `DashboardLayout` - Overall layout wrapper with navigation

### 3. Mock Data & Services
- `src/lib/mockSentiment.ts` - Mock analysis functions that simulate API responses with realistic delays
- `src/lib/types.ts` - TypeScript types for API request/response shapes

### 4. API Integration Layer
- `src/lib/api.ts` - API client with functions like `analyzeSingleReview()` and `analyzeCsv()` that currently use mock data but can be swapped to hit a real FastAPI backend by changing a base URL

## Tech Choices
- **Charts**: recharts (already installed)
- **UI**: shadcn/ui components (cards, tabs, buttons, badges, progress)
- **State**: React useState + react-query for API calls
- **File parsing**: Browser FileReader API for CSV preview

## File Structure
```text
src/
├── components/
│   ├── DashboardLayout.tsx
│   ├── ReviewInput.tsx
│   ├── CsvUpload.tsx
│   ├── SentimentResult.tsx
│   ├── SentimentDistributionChart.tsx
│   ├── AspectSentimentChart.tsx
│   ├── WordFrequencyChart.tsx
│   ├── ModelMetrics.tsx
│   └── ConfusionMatrix.tsx
├── lib/
│   ├── types.ts
│   ├── mockSentiment.ts
│   └── api.ts
└── pages/
    └── Index.tsx
```

## Mock Data Behavior
- Single review analysis returns: sentiment label, confidence, detected aspects with per-aspect sentiment
- CSV upload analyzes multiple reviews, aggregates sentiment distribution
- Model metrics display pre-set values (e.g., 87% accuracy, 0.85 F1)
- Word frequency returns top 15 words from the input text

## Visual Design
- Clean dashboard layout with a dark/light neutral palette
- Cards for each visualization section
- Color coding: green (positive), red (negative), gray (neutral)
- Responsive grid layout: 2 columns on desktop, stacked on mobile

