# Datadog PM Summit 2026

Internal event website for the Datadog Product Management Summit 2026 in Paris.

## Project Structure

```
├── landing-page/          # Main summit website (static HTML)
│   ├── index.html         # Homepage with auth, agenda, speakers
│   ├── images/            # Speaker photos, logos, assets
│   ├── *.mp4              # Video content
│   ├── package.json
│   └── vercel.json
│
└── swag-store/            # React swag store (embedded via iframe)
    ├── src/
    │   ├── App.jsx        # Main store application
    │   ├── components/    # Cart, Checkout, ProductCard, etc.
    │   └── *.css
    ├── public/images/     # Product images
    ├── package.json
    └── vite.config.js
```

## Tech Stack

- **Landing Page:** Vanilla HTML/CSS/JS with CSS animations
- **Swag Store:** React + Vite + Framer Motion
- **Authentication:** Google OAuth (restricted to @datadoghq.com)
- **Deployment:** Vercel
- **Analytics:** Vercel Analytics + Datadog RUM

## Deployment

### Landing Page

```bash
cd landing-page
vercel --prod
```

Domain: `www.pm-summit.xyz`

### Swag Store

```bash
cd swag-store
npm install
npm run build
vercel --prod
```

## Environment Variables

### Swag Store (optional)
```env
VITE_DD_APP_ID=your-datadog-app-id
VITE_DD_CLIENT_TOKEN=your-datadog-client-token
```

## Features

- **Google SSO** - Only @datadoghq.com accounts can access
- **Speaker Lineup** - Photos and bios for all speakers
- **Interactive Agenda** - Day 1 & Day 2 schedules
- **Q&A System** - Submit questions for speakers
- **Swag Store** - Order summit merchandise
- **Logistics & FAQ** - Travel info, venue details

## Local Development

```bash
# Landing page (static)
cd landing-page
npx serve .

# Swag store (React)
cd swag-store
npm install
npm run dev
```
