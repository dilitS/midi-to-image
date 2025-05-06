# MIDI to Image

Transform your MIDI melodies into AI-generated images. Play the virtual keyboard, record your melodies, and see them visualized as artwork.

## Features

- Virtual MIDI keyboard playable with mouse/touch or computer keyboard
- Melody recording with visualization
- AI-powered analysis to describe your melody's characteristics
- Translation of musical descriptions into image generation prompts
- Visual representation of your music through generated images

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **State Management**: Zustand
- **Audio**: Web Audio API
- **AI Integration**: Google Gemini API for melody analysis and prompt generation

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/midi-to-image.git
cd midi-to-image
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory with your API keys:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

> Note: If you don't provide API keys, the application will use mock responses for demonstration purposes.

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## How to Use

1. Use your computer keyboard or click/touch the virtual piano keys to play notes
2. Click "Start Recording" to begin capturing your melody
3. Play your melody (up to 30 seconds)
4. Click "Stop Recording" when finished
5. Select a musical style, tempo, and time signature in the right sidebar
6. Click "Generate Image" to:
   - Analyze your melody's musical characteristics
   - Create an image prompt based on the analysis
   - Generate a visual representation of your music

## Deployment

### Production Setup

1. Set up your environment variables:
   - Create a `.env.local` file with your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   - Make sure the API key has proper permissions for both text and image generation

2. Build the application for production:
   ```bash
   npm run build
   ```

3. Start the production server:
   ```bash
   npm run start
   ```

4. For deploying to platforms like Vercel or Netlify:
   - Connect your repository to the platform
   - Set up the environment variables in the platform's settings
   - Follow the platform's deployment instructions

### Important Production Notes

- **API Keys**: The Gemini API key used must have permissions for both text generation and image generation capabilities
- **Rate Limits**: Be aware of Gemini API rate limits for production use
- **Fallbacks**: The application includes fallbacks to Unsplash images if API generation fails
- **Security**: Ensure your API keys are properly secured as environment variables

## Configuration Options

- **Musical Style**: Classical, Jazz, Electronic, Rock, Ambient, Folk, Blues
- **Tempo**: 40-240 BPM
- **Time Signature**: 4/4, 3/4, 6/8, 5/4, 7/8

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- shadcn/ui for the component library
- Next.js team for the incredible framework
- Unsplash for placeholder images in demo mode
