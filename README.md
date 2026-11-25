# TouristCare

A responsive React and Material UI frontend for tourist safety assistance, incident reporting, document organisation, case tracking and victim support.

The start screen is designed for mobile, with QR scanning, access-code entry and sign-in options. A working backend is not configured in this repository; authentication, code verification, incident submission and secure cloud document storage remain explicit integration points. Local document previews are temporary browser-session data only.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## API integration

API methods are defined in `src/services/api.js` as explicit placeholders until the backend contract and authentication mechanism are available. Setting an API URL alone does not enable these integrations. QR scanning uses the camera only after the visitor taps the scan action and grants browser permission.