# Datadog PM Summit 2026

Internal event website for the Datadog Product Management Summit 2026 in Paris.

**Live site:** https://www.pm-summit.xyz

## Project Structure

```
pm-summit-2026/
├── landing-page/          # Main summit website (static HTML)
│   ├── index.html         # Homepage with auth, agenda, speakers, Q&A, FAQ
│   ├── images/            # Speaker photos, logos, assets
│   ├── *.mp4              # Video content
│   ├── package.json
│   └── vercel.json
│
└── game/                  # Game tab - React swag store (embedded via iframe)
    ├── src/
    │   ├── App.jsx        # Main store application
    │   ├── components/    # Cart, Checkout, ProductCard, etc.
    │   └── *.css
    ├── public/images/     # Product images
    ├── package.json
    └── vite.config.js
```

## Features

- **Google SSO** - Only @datadoghq.com accounts can access
- **Speaker Lineup** - Photos and bios for all summit speakers
- **Interactive Agenda** - Day 1 & Day 2 schedules with session details
- **Q&A System** - Submit questions for speakers before/during sessions
- **Game Tab** - Interactive swag store to order summit merchandise
- **Logistics & FAQ** - Travel info, venue details, common questions

## Tech Stack

- **Landing Page:** Vanilla HTML/CSS/JS with CSS animations
- **Game:** React + Vite + Framer Motion
- **Authentication:** Google OAuth (restricted to @datadoghq.com)
- **Deployment:** Vercel
- **Analytics:** Vercel Analytics + Datadog RUM

## Deployment

### Landing Page (Main Site)

```bash
cd landing-page
vercel --prod
```

Vercel project: `pm-summit-2026`  
Domain: `www.pm-summit.xyz`

### Game (Swag Store)

```bash
cd game
npm install
npm run build
vercel --prod
```

Vercel project: `pm-summit-game`

## Local Development

```bash
# Landing page (static)
cd landing-page
npx serve .

# Game (React)
cd game
npm install
npm run dev
```

## Environment Variables

### Game (optional)
```env
VITE_DD_APP_ID=your-datadog-app-id
VITE_DD_CLIENT_TOKEN=your-datadog-client-token
```
