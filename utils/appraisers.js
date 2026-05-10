export const TX_METROS = ['Austin', 'Houston', 'DFW', 'San Antonio']

const CITY_TO_METRO = {
  'austin': 'Austin', 'round rock': 'Austin', 'pflugerville': 'Austin',
  'cedar park': 'Austin', 'leander': 'Austin', 'georgetown': 'Austin',
  'kyle': 'Austin', 'buda': 'Austin', 'lakeway': 'Austin',
  'houston': 'Houston', 'sugar land': 'Houston', 'katy': 'Houston',
  'pearland': 'Houston', 'the woodlands': 'Houston', 'spring': 'Houston',
  'cypress': 'Houston', 'humble': 'Houston', 'kingwood': 'Houston',
  'dallas': 'DFW', 'fort worth': 'DFW', 'plano': 'DFW', 'frisco': 'DFW',
  'arlington': 'DFW', 'irving': 'DFW', 'mckinney': 'DFW', 'garland': 'DFW',
  'mesquite': 'DFW', 'denton': 'DFW', 'allen': 'DFW', 'richardson': 'DFW',
  'san antonio': 'San Antonio', 'new braunfels': 'San Antonio',
  'schertz': 'San Antonio', 'boerne': 'San Antonio', 'seguin': 'San Antonio',
  'helotes': 'San Antonio',
}

export function detectMetroFromAddress(address) {
  if (!address || typeof address !== 'string') return null
  const lower = address.toLowerCase()
  for (const [city, metro] of Object.entries(CITY_TO_METRO)) {
    if (lower.includes(city)) return metro
  }
  return null
}

// Placeholder directory. Replace each entry with vetted TALCB-licensed
// appraisers per metro; until then every entry routes users to TALCB's
// official lookup so they have an actionable next step.
export const TX_APPRAISERS = [
  {
    id: 'tbd-austin',
    name: 'Austin metro — coming soon',
    metros: ['Austin'],
    feeRange: '$350–500 typical',
    phone: null,
    website: 'https://www.talcb.texas.gov/license-lookup',
    placeholder: true,
  },
  {
    id: 'tbd-houston',
    name: 'Houston metro — coming soon',
    metros: ['Houston'],
    feeRange: '$375–525 typical',
    phone: null,
    website: 'https://www.talcb.texas.gov/license-lookup',
    placeholder: true,
  },
  {
    id: 'tbd-dfw',
    name: 'DFW metro — coming soon',
    metros: ['DFW'],
    feeRange: '$350–500 typical',
    phone: null,
    website: 'https://www.talcb.texas.gov/license-lookup',
    placeholder: true,
  },
  {
    id: 'tbd-san-antonio',
    name: 'San Antonio metro — coming soon',
    metros: ['San Antonio'],
    feeRange: '$325–475 typical',
    phone: null,
    website: 'https://www.talcb.texas.gov/license-lookup',
    placeholder: true,
  },
]
