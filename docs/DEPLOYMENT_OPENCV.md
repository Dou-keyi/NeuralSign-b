# OpenCV.js Deployment Guide

## Pre-Deployment Checklist

- [ ] Verify OpenCV CDN URL is accessible: `https://docs.opencv.org/4.8.0/opencv.js`
- [ ] Run `npm run build` — no errors
- [ ] Test in Chrome, Firefox, Safari with camera permissions
- [ ] Confirm enhanced detection toggle defaults to ON
- [ ] Confirm fallback to base validator when OpenCV fails to load

## Build

```bash
npm run build
```

OpenCV.js is **not bundled** — it loads from CDN at runtime.  
Bundle size impact: **~2 KB** (loader code only).

## CDN Configuration

If your CSP (Content Security Policy) blocks external scripts, add:

```
script-src 'self' https://docs.opencv.org;
```

## Fallback Strategy

If OpenCV fails to load:
1. `useOpenCV` hook sets `error` state
2. `OpenCVLoader` component shows error message
3. `EnhancedWordValidator` falls back to `WordValidator` (position-only)
4. Users can manually toggle off "Enhanced Detection"

## Monitoring

Watch for these console messages:
- `OpenCV.js loaded successfully` — normal
- `OpenCV.js loading timeout` — CDN issue
- `Enhanced validator: OpenCV services unavailable` — graceful fallback
- `Performance: Switched to LOW mode` — device is struggling

## Rollback

To disable OpenCV entirely without a code change:
1. Set `useEnhanced` default to `false` in `PracticeWords.jsx` (line ~104)
2. Or block the CDN URL in your Content Security Policy
