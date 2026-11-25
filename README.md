# TouristCare

TouristCare is a mobile-first React, Vite and Material UI travel-safety demonstration for Cape Town visitors. Public visitor tools work without an account or backend. The emergency, incident, case, support, notification and staff workflows use a browser-local mock service.

## Run and verify

```bash
npm install
npm run dev
npm test
npm run build
npm run preview
```

## Vercel deployment

The project builds to `dist/` and includes `vercel.json` SPA rewrites, so React Router routes work when opened or refreshed directly. Configure the Vercel project environment variable `VITE_APP_URL` to the deployed HTTPS origin (for example `https://tourist-care.vercel.app`) and redeploy. `.env.production` supplies the current public deployment URL for production builds; `.env.example` documents the setting.

The official public QR at `/admin/qr` opens the welcome page and can be downloaded or printed. It never contains a visitor reference. If `VITE_APP_URL` is unset or is not HTTPS, QR generation is disabled with a configuration warning rather than falling back to localhost.

## Local demonstration data

- One demo visitor reference and sample records are seeded per browser profile.
- Reports, case statuses and timelines, follow-up notes, document metadata, support requests, notifications, and demo staff activity persist in that browser's `localStorage`.
- Vercel does not provide a shared database: browser data is not visible on another device or another visitor's browser. The staff demo shows sample records plus records created in the same browser only; it has no authentication and is not an operational staff console.
- Use **Reset Demo Data** in Settings to restore the sample set for the current browser.
- Do not enter real names, exact locations, passwords, phone numbers, identity/passport details, or sensitive incident descriptions. The demo only persists a report reference, category, date, and non-personal status/timeline information; staff pages omit sensitive descriptions and exact locations.
- Uploaded file contents stay in memory for the current browser tab (including in-app navigation) and are lost on reload or tab close. Only non-identifying document metadata persists; file contents are never stored in `localStorage`.
- SOS location and trusted-contact sharing are simulated. The fixed sample coordinates are not device location, sharing does not send anything, and TouristCare does not automatically dispatch emergency responders.
- A production backend, authentication, secure storage, and cross-device access are future integration requirements. `src/services/api.js` retains the explicit authentication integration placeholder.

## Progressive Web App

The manifest, icons, optional install prompt, service worker, and offline safety guidance are served from `public/`. QR links open the normal mobile browser; installation is optional. Offline mode cannot submit or synchronize demo records.
