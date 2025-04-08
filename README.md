# Commissar's Digest

A React Native web application built with Expo for generating AI art using Stable Diffusion.

## Features

- Generate AI art using Stable Diffusion API
- Web-based interface
- Mobile-responsive design

## Tech Stack

- React Native Web
- Expo
- TypeScript
- Stable Diffusion API

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Stable Diffusion API key

## Environment Variables

Create a `.env` file in the root directory with:

```
STABILITY_API_KEY=your_api_key_here
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npx expo start --web
   ```

## Development

The app will be available at:
- Web: http://localhost:19006 (or the next available port)
- Mobile: Use Expo Go app to scan the QR code

## Project Structure

```
commissars-digest/
├── src/           # Source code
├── assets/        # Static assets
├── public/        # Public assets
└── web-build/     # Production build output
```

## Scripts

- `npx expo start --web` - Start the development server
- `npm run build` - Create a production build

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 