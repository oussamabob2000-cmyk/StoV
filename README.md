# PromoGen AI 🎬

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0-blue)
![Remotion](https://img.shields.io/badge/Remotion-4.0-ff0055)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38bdf8)
![Vite](https://img.shields.io/badge/Vite-6.2-646cff)

PromoGen AI is an advanced, fully client-side AI video generator built with React, Remotion, and Tailwind CSS. It leverages the power of Large Language Models (Gemini & OpenRouter) to write high-converting promotional scripts and automatically renders them into dynamic, animated videos directly in your browser using FFmpeg.wasm and WebCodecs.

## ✨ Features

- **🤖 AI-Powered Scripting**: Generate professional video scripts from a simple prompt, URL, or idea.
- **🎨 Dynamic Layouts**: Automatically selects between Center, Split, Mockup, and Data visualization layouts for maximum engagement.
- **⚡ In-Browser Rendering**: Renders MP4, WebM, and GIF files entirely client-side using `@ffmpeg/ffmpeg` and `mp4-muxer`. No server required.
- **🔐 Secure API Key Management**: API keys are encrypted locally using AES encryption and a user-defined PIN.
- **📱 PWA Ready**: Installable as a Progressive Web App for offline access and native-like experience.
- **🎭 Customizable Styles**: Choose from multiple video tones (Cyberpunk, Professional, Funny, etc.) and typography options.
- **⏱️ Flexible Durations**: Generate videos for TikTok, Reels, or Shorts with precise frame-level duration control (15s, 30s, 60s, or custom).

## 🏗️ Architecture

The project is structured for scalability and maintainability:

```text
src/
├── components/
│   ├── DynamicVideo.tsx  # Core Remotion composition with advanced layouts
│   └── ClickDzVideo.tsx  # Fallback/default video template
├── lib/
│   └── crypto.ts         # AES encryption utilities for secure local storage
├── App.tsx               # Main application state, AI logic, and UI
├── index.css             # Global Tailwind styles and Google Fonts
└── main.tsx              # React entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/promogen-ai.git
   cd promogen-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and add your API keys (optional, as they can be added via the UI).
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Video Engine**: Remotion
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **AI Integration**: `@google/genai` & OpenRouter API
- **Rendering**: `@ffmpeg/ffmpeg`, `mp4-muxer`, `html-to-image`
- **Security**: `crypto-js`

## 🔒 Security

API keys entered into the application are **never** sent to a backend server. They are encrypted using AES encryption with a PIN you provide and stored securely in your browser's `localStorage`. You must enter your PIN to decrypt the keys before generating a video.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
