# MIDI to Image

Transform your MIDI melodies into AI-generated images. Play the virtual keyboard, record your melodies, and see them visualized as beautiful artwork.

![MIDI to Image Demo](/public/demo-screenshot.webp)

## ✨ Features

- **Interactive Piano**: Virtual MIDI keyboard playable with mouse/touch or computer keyboard
- **Melody Recording**: Record and visualize your musical creations
- **AI Analysis**: Analyze your melody's musical characteristics, harmony, and mood
- **Image Generation**: Transform musical descriptions into stunning visuals
- **Style Selection**: Choose from multiple musical styles to influence generation
- **Image History**: Save and view your generated images
- **Dark/Light Mode**: Full theme support for comfortable viewing
- **Responsive Design**: Works on mobile, tablet, and desktop

## 🛠️ Technologies

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router and React 19
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Audio Processing**: Web Audio API and WebMIDI
- **AI Integration**: [Google Gemini API](https://ai.google.dev/)
- **UI Components**: Radix UI primitives

## 🏁 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn
- Google Gemini API key (optional for full functionality)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/midi-to-image.git
cd midi-to-image
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

> Note: If you don't provide an API key, the app will use mock responses for demonstration.

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📝 How to Use

1. **Play the Piano**: Use your computer keyboard (keys A-L for one octave, Z-M for another) or click/tap the piano keys
2. **Record a Melody**: 
   - Click "Start Recording" to begin capturing
   - Play your melody (up to 30 seconds)
   - Click "Stop Recording" when finished
3. **Customize Settings**:
   - Select a musical style from the dropdown
   - Adjust tempo with the slider (optional)
4. **Generate an Image**:
   - Click "Generate Image" 
   - The app will analyze your melody, create a prompt, and generate a visual representation
5. **View & Save Images**:
   - Images are saved in your browser's local storage
   - Browse your image history in the right sidebar
   - Click any thumbnail to view details or download

## 🌐 Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Deploy on Vercel

The easiest way to deploy is using Vercel:

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com/import)
3. Add your environment variables
4. Deploy!

## ⚙️ Configuration

The app supports several configuration options:

- **Musical Styles**: Classical, Jazz, Electronic, Rock, Ambient, Folk, Blues, Pop, Hip Hop, Reggae, Country, Cinematic, Lo-Fi
- **Tempo Range**: 40-240 BPM
- **Image Storage**: Images are stored in browser localStorage for 3 days

## 🔮 How It Works

1. **Recording**: The app captures MIDI notes including pitch, timing, and velocity
2. **Analysis**: The Gemini API analyzes musical elements like harmony, melody, rhythm, and mood
3. **Prompt Creation**: Musical descriptions are transformed into image generation prompts
4. **Image Generation**: The AI generates an image based on the prompt
5. **Display & Storage**: Images are displayed and saved to your local history

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Google Gemini](https://ai.google.dev/) for the AI capabilities
- [Next.js](https://nextjs.org/) team for the incredible framework
- [Tone.js](https://tonejs.github.io/) for audio processing inspiration
- [WebMIDI](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API) for MIDI functionality
