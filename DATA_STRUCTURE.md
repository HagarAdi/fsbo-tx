# FSBO Texas Guide — Data Structure

This file defines the data structure used throughout the app.
Every Claude Code session that touches data storage must read this file first.

## localStorage Keys

### `fsbo_completedSteps`
Array of step IDs (numbers) that the user has marked complete.
Default: []
Example: [1, 3, 5]

### `fsbo_homeAddress`
String — the user's home address.
Default: ""
Example: "123 Elm St, Round Rock TX 78664"

### `fsbo_stepData`
Object — data entered by the user within each step.
Default: {}
Example:
{
  "step1": {
    "comps": [
      { "address": "456 Oak St", "price": 485000, "sqft": 2050, "dom": 12 }
    ],
    "recommendedPrice": 498000
  },
  "step3": {
    "stagingPhotos": [],
    "stagingNotes": ""
  }
}

### `fsbo_lastVisited`
Number — the ID of the last step the user visited.
Default: null
Example: 2

### `fsbo_priceEstimate`
Object — the living price estimate that updates as steps are completed.
Default: null
Example:
{
  "basePrice": 485000,
  "adjustments": [
    { "step": 1, "reason": "comp average", "amount": 485000 },
    { "step": 2, "reason": "new roof", "amount": 8000 },
    { "step": 3, "reason": "staging", "amount": 5000 }
  ],
  "currentEstimate": 498000
}

## Storage Strategy
- Current: localStorage (browser only, no login required)
- Future: Supabase database (when multi-user accounts are needed)
- Migration plan: replace localStorage calls in index.js with Supabase calls — no other files change

## Rules
- All localStorage keys must be prefixed with `fsbo_`
- Never change a key name without updating this file first
- Never change the data shape without updating this file first
- When adding new step data fields, add them to the fsbo_stepData example above
