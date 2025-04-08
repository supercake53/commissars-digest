# Commissar's Digest

A React Native application built with Expo, featuring a dark theme interface.

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- For mobile development:
  - iOS: Xcode (Mac only)
  - Android: Android Studio & Android SDK

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd commissars-digest
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
# For web
npm run web

# For iOS
npm run ios

# For Android
npm run android
```

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run web` - Start the web version
- `npm run ios` - Start the iOS version
- `npm run android` - Start the Android version
- `npm run build` - Build the web version
- `npm run vercel-build` - Build for Vercel deployment

## Deployment to DigitalOcean

### Prerequisites
1. Create a DigitalOcean account
2. Install the DigitalOcean CLI (doctl):
   
   **Windows Installation:**
   ```powershell
   # Using Scoop (recommended)
   scoop install doctl

   # OR using Chocolatey
   choco install doctl

   # OR Manual Installation:
   # 1. Download the latest release from:
   # https://github.com/digitalocean/doctl/releases
   # 2. Extract the ZIP file
   # 3. Add the extracted folder to your PATH
   ```

3. Generate a DigitalOcean API token

### Step-by-Step Deployment Guide

1. **Prepare Your Application**
   ```bash
   # Build the web version
   npm run build
   ```

2. **Set Up DigitalOcean App Platform**
   - Log in to DigitalOcean
   - Go to the App Platform section
   - Click "Create App"
   - Choose "Web Service" as your app type

3. **Configure Your App**
   ```bash
   # Authenticate with your API token
   doctl auth init

   # Create a new app
   doctl apps create --spec app.yaml
   ```

4. **Create app.yaml Configuration**
   ```yaml
   name: commissars-digest
   region: nyc
   services:
   - name: web
     github:
       repo: your-username/commissars-digest
       branch: main
     build_command: npm run build
     run_command: npx serve web-build
     environment_slug: node-js
     instance_size_slug: basic-xxs
     instance_count: 1
   ```

5. **Set Environment Variables**
   - Go to App Settings in DigitalOcean
   - Add necessary environment variables
   - Include any API keys or configuration needed

6. **Deploy**
   ```bash
   # Deploy using doctl
   doctl apps create --spec app.yaml

   # Or update existing app
   doctl apps update YOUR_APP_ID --spec app.yaml
   ```

7. **Monitor Deployment**
   ```bash
   # Check deployment status
   doctl apps list

   # Get deployment logs
   doctl apps logs YOUR_APP_ID
   ```

8. **Post-Deployment**
   - Set up your custom domain (if needed)
   - Configure SSL certificates
   - Set up monitoring and alerts

### Troubleshooting

- If the app fails to build, check the build logs using `doctl apps logs YOUR_APP_ID`
- Ensure all environment variables are properly set
- Verify that the build command and run command are correct in app.yaml
- Check that the Node.js version matches your local development environment

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=production
API_URL=your_api_url
```

## Project Structure

```
commissars-digest/
├── src/               # Source files
├── assets/           # Static assets
├── web-build/        # Built web files
├── app.json          # Expo configuration
├── package.json      # Dependencies and scripts
└── webpack.config.js # Web configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details 