# RiskWise Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

Create a `.env.local` file in the project root with your Firebase credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=riskwise-c9df3.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=riskwise-c9df3
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=riskwise-c9df3.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1083013340579
NEXT_PUBLIC_FIREBASE_APP_ID=1:1083013340579:web:9643d3995874421b458210
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-R5002S021C

# Genkit AI Configuration (Optional - for AI features)
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Where to get Firebase credentials:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Open the **riskwise-c9df3** project
3. Click the gear icon ⚙️ > **Project Settings**
4. Scroll to **Your apps** section
5. Click the **Web app** (</> icon)
6. Copy the config values to your `.env.local` file

#### Where to get Gemini API key (for AI features):

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Get API Key**
3. Copy the key to your `.env.local` file

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at: http://localhost:9002

---

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"

This means your `.env.local` file is missing or has an incorrect API key.

**Solution:**
1. Ensure `.env.local` exists in the project root (same folder as `package.json`)
2. Verify the `NEXT_PUBLIC_FIREBASE_API_KEY` value is correct
3. Restart the development server after creating/editing `.env.local`

### "Missing required environment variables"

The application will show a helpful error message in the console telling you which variables are missing.

**Solution:**
1. Check the console output for specific missing variables
2. Add them to your `.env.local` file
3. Restart the server

### Port 9002 already in use

**Solution:**
```bash
# Stop the current dev server (Ctrl+C)
# Change the port in package.json or run:
npm run dev -- -p 3000
```

---

## Project Structure

```
riskwise-main/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── (main)/       # Main application pages
│   │   │   ├── dashboard/
│   │   │   ├── executive-dashboard/
│   │   │   ├── benchmarking/
│   │   │   ├── leaderboard/
│   │   │   └── add/
│   │   ├── error.tsx     # Error boundary
│   │   └── page.tsx      # Root page (redirects to dashboard)
│   ├── components/       # React components
│   ├── lib/              # Utilities and configurations
│   ├── services/         # Data services
│   └── ai/               # AI/Genkit integration
├── .env.local           # Your local environment variables (DO NOT COMMIT)
├── .gitignore           # Git ignore rules
├── package.json         # Project dependencies
└── SETUP.md            # This file
```

---

## Available Scripts

- `npm run dev` - Start development server on port 9002
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Check TypeScript types

---

## Security Notes

⚠️ **IMPORTANT:** Never commit your `.env.local` file to version control!

The `.gitignore` file is already configured to exclude `.env*` files, but always double-check before committing.

---

## Next Steps

Once the application is running:

1. The app will redirect to `/dashboard`
2. Currently there's no authentication, so you'll have direct access
3. Use the **Add Entry** page to create risks and issues
4. Explore the different dashboards and features

---

## Need Help?

- **Testing Report:** See detailed findings in `testing_report.md`
- **Implementation Plan:** See roadmap in `implementation_plan.md`
- **Firebase Docs:** https://firebase.google.com/docs
- **Next.js Docs:** https://nextjs.org/docs

---

## Known Issues

1. **Authentication not implemented** - No login/logout functionality yet (Phase 2)
2. **Edit/Delete missing** - Can only create new entries, not edit/delete (Phase 2)
3. **Security vulnerabilities** - Run `npm audit fix` to address (Phase 1)

See `implementation_plan.md` for the full roadmap.
