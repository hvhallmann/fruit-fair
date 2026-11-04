# Copilot instructions

## Commands

- Install dependencies: `npm ci`
- Start the Vite dev server: `npm run dev` (port 3000)
- Create a production build: `npm run build`
- Run the test suite: `npm test`
- Run one test file: `npm test -- src/App.test.jsx`
- Run one named test: `npm test -- src/App.test.jsx -t "loads the initial page"`
- Run tests in watch mode: `npm run test:watch`

There is no lint script configured in `package.json`. CI uses Node.js 26, `npm ci`, and `npm run build`.

## Architecture

- `index.html` loads `src/index.jsx`, which mounts the React app and global styles. `App.jsx` owns navigation and the seasonal, profile, and vitamins/minerals views; `Card.jsx`, `ProfileSection.jsx`, and `VitaminSection.jsx` implement the respective UI pieces.
- `src/db/db.js` is the canonical produce and seasonality list. `dbWithNutrients.js` enriches those records by `key` with vitamin, mineral, and energy data from the neighboring profile modules. `seasonalMenu.js` uses those records to generate the illustrative daily menu; `VitaminSection.jsx` displays nutrient estimates.
- User profiles are stored as `userProfiles/{anonymous-auth-uid}` in Firestore by `cloudProfileStorage.js`, with a local IndexedDB cache in `profileStorage.js`. Existing local profiles require explicit user approval before migration. Create the Firestore database, enable Anonymous sign-in in Firebase Console, and deploy rules from `firestore.rules` with `firebase deploy --only firestore:rules`.
- Firebase initialization and Analytics are in `src/firebase.js`; Vite environment overrides use the `VITE_FIREBASE_*` names in `.env.example`. The optional profile email is user-entered and is not an authenticated or verified identity.
- Vite configures the React plugin, PWA manifest/service worker, and Vitest's jsdom test environment. Firebase Hosting serves the `dist/` build and rewrites routes to `index.html`.

## Repository conventions

- Keep user-facing copy in Brazilian Portuguese. Month indexes use JavaScript's `0`–`11` convention, from January through December.
- Seasonal records use a 12-entry `season` array with the exact values `"Forte"`, `"Medio"`, or `"Fraco"`. Category/header rows have `isClass: true`; produce records use `isClass: false`. A produce `key` connects seasonality, nutrient/energy profiles, and its image at `src/assets/images/<key>.webp`.
- When adding produce, keep the same key across these sources and provide a vitamin profile in `dbWithNutrients.js` (module initialization throws if one is missing). Mineral and energy profiles can be incomplete, but missing values must remain unknown rather than being presented as zero.
- Nutrient values are per 100 g and carry explicit units/source metadata (primarily TBCA). `null` means not quantified, not zero. Preserve unit conversions, source attribution, and the UI's distinction between complete and partial estimates.
- Component tests use Vitest, React Testing Library, and jsdom; shared test setup is `src/setupTests.js`. The production build and Firebase deployment workflows both run `npm run build`.
