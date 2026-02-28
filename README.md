# 🧠 NeuralSign 🤟

> **Neural Networks Teaching Sign Language**

An AI-powered interactive sign language learning platform that combines 3D hand models with real-time AI validation to make learning sign language accessible, engaging, and effective. Built to bridge the communication gap between the deaf and hard-of-hearing community and the hearing world, NeuralSign makes Malaysian Sign Language (MSL) learning accessible, engaging, and measurable.

---

## 📑 Table of Contents
- [About](#-about)
- [KitaHack 2026 & SDG Alignment](#-kitahack-2026)
- [Technical Architecture](#-technical-architecture)
- [Implementation Details](#-implementation-details)
- [Getting Started](#-getting-started)
- [User Guide](#-user-guide)
- [Project Structure](#-project-structure)
- [Color Palette](#-color-palette)
- [Available Scripts](#-available-scripts)
- [Challenges Faced](#-challenges-faced)
- [Future Roadmap](#-future-roadmap)
- [Analytics (Firebase)](#-analytics-firebase)
- [Team](#-team)
- [License](#-license)

---

## 🎯 About

NeuralSign is an innovative web application designed to teach sign language through interactive lessons, real-time practice with AI feedback, and gamified progress tracking. 

### Key Features
- 🖐️ **Interactive 3D Hand Models** - Learn signs with detailed, animated 3D visualizations (rotate and view signs from any angle).
- 🤖 **AI-Powered Validation** - Real-time on-device hand gesture recognition using MediaPipe and Gemini AI.
- 📝 **Sentence Builder** - Combine learned signs to form complete sentences.
- 📊 **Progress Tracking** - Track your learning journey with streaks and achievements.
- 🎮 **Gamified Learning** - Earn points and unlock levels as you master new signs.

---

## 🏆 KitaHack 2026

This project was built for **KitaHack 2026**, a hackathon focused on creating impactful solutions using Google technologies.

### SDG Alignment
NeuralSign contributes to:
- **SDG 10: Reduced Inequalities** — Target 10.2: Promoting social inclusion of people with disabilities by breaking down communication barriers faced by the deaf and hard-of-hearing community.
- **SDG 4: Quality Education** — Target 4.5: Ensuring equal access to education for people with disabilities through accessible, on-demand sign language learning tools.

---

## 🏗️ Technical Architecture

### System Overview
NeuralSign follows a serverless, client-heavy architecture where the majority of computation — including gesture recognition — happens directly in the browser. Cloud services are used only where necessary for authentication, data persistence, and AI tutoring.

### Frontend Stack
- **React 18 & Vite** - Core framework and build tool for a fast, responsive single-page application.
- **Tailwind CSS** - Utility-first styling with a custom Neural Network Blue theme.
- **Framer Motion** - Smooth page transitions and micro-animations for gamified feedback.
- **Zustand** - Lightweight global state management for user progress and authentication.

### 3D Rendering Engine
- **Three.js & React Three Fiber** - Browser-based 3D rendering engine and React wrapper, used to display interactive 3D hand models.
- **Blender** - Used to create custom hand pose models exported for Three.js.

### AI & Computer Vision Engine
- **MediaPipe (Google)** - Real-time on-device hand tracking and gesture recognition via webcam. Runs entirely in the browser using WebAssembly and WebGL, mapping 21 landmark points across the user's hand in real time. No camera data ever leaves the user's device, ensuring both low latency and full privacy.
- **Gemini AI (Google)** - Conversational AI tutor for natural language feedback and sentence building.

### Backend & Serverless Infrastructure
- **Firebase Authentication** - Secure user sign-ups, logins, and session management with Google SSO support.
- **Cloud Firestore** - NoSQL database for user profiles, XP, streaks, achievements, and leaderboard data.
- **Firebase Hosting** - Global edge-cached hosting for the React + Vite application.
- **Firebase Analytics** - Tracks engagement events such as practice attempts, signs learned, and session activity.

### Data Flow
```text
Learning Loop:    User selects lesson → Firestore fetches lesson data → Three.js renders 3D hand model
Practice Loop:    User performs sign via webcam → MediaPipe tracks hand landmarks in real time
Validation Loop:  Landmark data evaluated → Gemini AI provides contextual feedback on complex signs
Gamification Loop: Successful sign → Framer Motion celebration → Zustand updates state → Firestore syncs XP, streak, and achievements
```

---

## ⚙️ Implementation Details

### MediaPipe Hand Tracking
MediaPipe is initialised via `mediapipeService.js`, which accesses the user's webcam through the `CameraFeed.jsx` component. It continuously processes video frames, extracting 21 hand landmark points and evaluating their spatial relationships against predefined gesture models to determine if the correct sign has been performed. All processing occurs on the client side with no data transmitted to any server.

### Gemini AI Integration
Gemini is integrated via `geminiService.js` using the Google AI Studio API. It powers the conversational tutor feature, handling user questions about sign technique and context, providing natural language feedback on complex multi-sign sentence building, and offering personalised guidance based on the user's learning progress.

### Gamification System
NeuralSign features a full gamification layer built on the following services:
- `xpService.js` — Manages experience points awarded for completed lessons and practice sessions
- `streakService.js` — Tracks daily learning streaks to encourage consistent practice
- `achievementService.js` — Unlocks achievements based on milestones such as signs learned and challenges completed
- `milestoneService.js` — Monitors overall learning progress and triggers milestone rewards

All gamification data is stored in Firestore and synced in real time across sessions.

### Firestore Data Structure
```json
users/
  {userId}/
    profile: { name, email, joinDate }
    progress: { xp, streak, signsLearned }
    achievements: [{ id, unlockedAt }]
    milestones: [{ id, completedAt }]
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project (for backend features)
- Google AI Studio API key (for Gemini)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/neuralsign.git
   cd neuralsign
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your Firebase and Gemini API credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

---

## 📖 User Guide

Welcome to NeuralSign! Here's how you can make the most out of your sign language learning journey:

### 1. Learning New Signs
- **Explore Lessons:** Navigate to the **Learn** section to select a topic.
- **Interactive 3D Models:** Use the 3D hand models to view signs from any angle—rotate and zoom to understand the exact hand shape.
- **Video Demonstrations:** Switch to the video tab (where available) to see continuous, real-life examples of how signs are performed in motion.

### 2. Practice & Real-Time Validation
- **Webcam Tracking:** Head over to the **Practice** area and allow webcam access. All video processing happens locally on your device for complete privacy.
- **Real-Time Feedback:** Perform the signs you've learned. The AI engine will map your hand landmarks in real-time and validate if your gesture matches the target sign.

### 3. Sentence Builder & AI Tutor
- **Combine Signs:** Use the Sentence Builder to practice chaining multiple signs together.
- **Ask Gemini:** Engage with the conversational AI tutor for personalized guidance, technique corrections, and natural language feedback.

### 4. Track Your Progress
- **Gamified Learning:** Earn Experience Points (XP) for completing lessons and successful practice sessions.
- **Streaks & Achievements:** Maintain your daily learning streak and unlock achievements as you expand your sign language vocabulary.

---

## 📁 Project Structure

```text
neuralsign/
├── public/
│   ├── models/          # 3D hand models
│   └── assets/          # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── layout/      # Navbar, Footer, PageContainer
│   │   ├── common/      # Buttons, Modals, Loading
│   │   ├── learning/    # Learning-specific components
│   │   ├── practice/    # Practice mode components
│   │   ├── 3d/          # Three.js components
│   │   └── camera/      # Camera/MediaPipe components
│   ├── pages/           # Page components
│   ├── services/        # Firebase, API services
│   ├── store/           # Zustand stores
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utilities and helpers
│   └── styles/          # Global styles and theme
└── ...config files
```

---

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#6366F1` | Main brand color (Indigo) |
| Secondary | `#8B5CF6` | Accents (Purple) |
| Accent | `#EC4899` | Highlights (Hot Pink) |
| Success | `#10B981` | Success states (Emerald) |
| Warning | `#F59E0B` | Warnings (Amber) |
| Error | `#EF4444` | Errors (Red) |
| Background | `#0F172A` | Dark background (Slate 900) |
| Surface | `#1E293B` | Card backgrounds (Slate 800) |

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🚧 Challenges Faced

### 1. Creating Custom 3D Hand Models
None of our team members had prior 3D modelling experience, and we were unable to find existing hand models online that were both accurate enough for sign language demonstration and compatible with our Three.js setup. We made the decision to learn Blender from scratch to create custom hand pose models, rigging each pose to accurately represent individual sign gestures before exporting them into the app. This process is ongoing as we continue expanding the model library.

### 2. Gesture Recognition Accuracy
Our gesture recognition system initially flagged correctly performed signs as incorrect due to overly strict evaluation thresholds that did not account for natural variation in how different users perform signs. We recalibrated the landmark evaluation thresholds to be more accommodating, which partially resolved the issue. Further model refinement remains an active priority as we work toward consistently achieving above 85% recognition accuracy.

### 3. Client-Side Performance Across Devices
Running MediaPipe in the browser via WebAssembly and WebGL delivers excellent performance on modern devices, but users on lower-end hardware experienced occasional frame drops during gesture recognition. We addressed this by optimising the rendering pipeline and reducing unnecessary re-renders in the React component tree.

### 4. Sourcing Sign Language Demonstration Videos
After user feedback revealed that 3D models alone were not intuitive enough for all users, we decided to incorporate video examples alongside them. Sourcing and creating high-quality demonstration videos for each sign proved time-consuming, as videos either needed to be created in-house or carefully verified for accuracy. This feature is partially implemented and remains in active development.

---

## 🔮 Future Roadmap

### Short Term
- Complete the 3D hand model library to cover a broader MSL vocabulary
- Expand video example library to accompany all 3D sign demonstrations
- Improve gesture recognition accuracy beyond the current 70–85% threshold
- Refine Gemini tutoring to deliver more personalised learning paths based on individual progress

### Medium Term
- Launch a mobile version of NeuralSign to reach users who primarily access the internet via smartphones
- Establish partnerships with schools, hospitals, and government agencies in Malaysia to deploy NeuralSign as an accessibility tool in environments where deaf and hearing communication is most critical
- Introduce Firestore query optimisation and Firebase Cloud Functions for leaderboard aggregation and institutional progress reporting

### Long Term
- Evolve NeuralSign into a two-way real-time translation tool that not only teaches sign language but also translates live signed communication into text or speech for hearing individuals
- Expand support beyond Malaysian Sign Language to cover other regional sign languages across Southeast Asia
- Build an educator dashboard for teachers and institutions to track student progress and customise learning content

---

## 📈 Analytics (Firebase)

From January 1st to February 26th 2026, NeuralSign has recorded:
- **12** active users (all based in Malaysia)
- **104** sessions started
- **392** total page views
- **149** practice attempts
- **27** signs successfully learned
- **6** achievements unlocked

---

## 👥 Team

- **Bryan Low Zhern Yang** - Team Leader
- **Evin Kor Kar Hei** - Team Member
- **Ng Xue Qing** - Team Member
- **Gooi Hooi Qi** - Team Member

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. All rights reserved by the NeuralSign team.

---

<div align="center">
  <p>Built with ❤️ for KitaHack 2026</p>
  <p>Powered by Google Technologies</p>
</div>
