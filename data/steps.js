const steps = [
  {
    id: 1,
    title: "Price Your Home Correctly",
    subtitle: "Set a competitive asking price based on market data",
    phase: "Prepare",
    whyItMatters:
      "Texas has no state income tax, which draws relocating buyers willing to pay a premium—but only at the right price. County Central Appraisal District (CAD) records are publicly searchable and savvy buyers will compare your ask to the appraised value before writing an offer. In fast-moving Texas metros like Houston, DFW, and Austin, homes priced more than 3–5% above comparable sales typically sit for 30+ days and then require a visible price cut that signals desperation.",
    actionPlan: [
      "Pull your county CAD record at your county appraisal district's website (e.g., hcad.org for Harris County, dcad.org for Dallas County) to see the assessed value and square footage buyers will use as a baseline.",
      "Run a Comparative Market Analysis on HAR.com (Houston), Zillow, and Redfin using sold comps within 0.5 miles and 90 days, filtering for similar bed/bath count and square footage within 15%.",
      "Adjust your CMA price up or down for key differences: +$10–15/sq ft for a remodeled kitchen, –$5–10/sq ft for a busy road, +$5/sq ft per year of roof age relative to comps.",
      "Order a pre-listing appraisal from a Texas-licensed appraiser (typically $300–$500) to get a defensible, lender-grade value opinion you can share with skeptical buyers.",
      "Set your final list price just below a psychological threshold (e.g., $349,900 instead of $350,000) and commit to reviewing all offers after 7 days on market to create urgency.",
    ],
    proTips: [
      {
        tip: "HAR.com shows Texas MLS data unavailable on national portals—use the 'Sold' filter to find true closed prices, not just list prices, within your specific ZIP code.",
        source: "Houston Association of Realtors (HAR.com)",
      },
      {
        tip: "Texas CAD records are public. Buyers routinely check them—if your list price is more than 20% above the CAD assessed value, expect buyers to use that gap as a negotiating hammer.",
        source: "Texas Property Tax Code § 23.01",
      },
      {
        tip: "Price-per-square-foot matters more in Texas than many other states. Calculate yours against sold comps and be ready to defend any premium during negotiations.",
        source: "Texas Real Estate Research Center, Texas A&M",
      },
      {
        tip: "Overpriced homes that eventually reduce their price sell for less on average than homes priced correctly from day one, because days-on-market erodes perceived value.",
        source: "National Association of Realtors Profile of Home Buyers and Sellers",
      },
    ],
    vendors: [
      { name: "HAR.com (Texas MLS Search)", url: "https://www.har.com" },
      { name: "HCAD – Harris County Appraisal District", url: "https://hcad.org" },
      { name: "DCAD – Dallas County Appraisal District", url: "https://www.dcad.org" },
      { name: "TCAD – Travis County Appraisal District", url: "https://traviscad.org" },
      { name: "Texas Real Estate Research Center", url: "https://trerc.tamu.edu" },
      { name: "Redfin Texas Home Values", url: "https://www.redfin.com/state/Texas/housing-market" },
    ],
  },
];

export default steps;
