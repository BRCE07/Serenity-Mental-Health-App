# Changelog

## [1.1.5] — 2026-11-08

### 🔒 Security Hardening
- Migrated auth tokens from `AsyncStorage` to `SecureStore` (encrypted device storage)
- Migrated mind data (moods, journal entries, contacts) to `SecureStore`
- Enforced strict CORS origin validation (via `CORS_ORIGIN` env var)
- Added mandatory database environment variable checks (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`)
- Enforced password strength policy: minimum 8 characters, must include letters and numbers
- Reduced JWT token expiry from 30 days to 7 days
- Added session expiry checking — auto-logout when JWT expires
- Switched Strava token revocation to header-based `Authorization: ***` (removed query string exposure)
- Wrapped Strava token save in error handling to prevent silent failures
- Added express-rate-limit: 100 req/15min (general), 10 req/15min (auth endpoints)

### 🐛 Bug Fixes
- Fixed Android emulator dev mode connection — changed dev API URL to `http://localhost:3000` (TLS/mixed-content fix)
- Fixed Metro `image-size` dependency vulnerability via postinstall patch script (Windows-safe)
- Fixed 27 Dependabot alerts via npm overrides (tar, postcss, @xmldom/xmldom, decode-uri-component, minimatch, glob, uuid)
- Fixed 26 CodeQL/SCA alerts (rate limiting, CORS, insecure storage, cleartext transmission, session expiry)

### 📦 Dependency Updates
- Added `image-size` ^2.1.0 to direct dependencies
- Added `express-rate-limit` ^7.4.0 to API server
- Updated npm overrides for transitive vulnerability fixes

---

## [1.1.4] — 2026-11-06

### ✨ Features
- Added version number and copyright footer to the Settings screen
- Updated app icon to transparent emblem design (removed solid background)

### 📝 Documentation
- Updated README.md with comprehensive setup guide
- Added LICENSE file

---

## [1.1.3] — 2026-11-06

### 🎨 UI Improvements
- Redesigned login and register screens with modern logo watermark design
- Updated greeting time logic: 12am–11am "Good morning", 12pm–7pm "Good afternoon", 7pm+ "Good evening!"

---

## [1.1.2] — 2026-10-2026

### 🐛 Bug Fixes
- Various bug fixes and improvements
