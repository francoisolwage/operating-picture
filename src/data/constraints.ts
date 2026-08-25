export type ConstraintStatus = "tight" | "moving" | "easing";

export type Metric = {
  label: string;
  value: string;
  detail?: string;
  asOf: string;
  source: string;
  href: string;
};

export type Constraint = {
  slug: string;
  order: number;
  name: string;
  shortName: string;
  status: ConstraintStatus;
  slot: string;
  hero: Metric;
  throughput: string;
  test: string;
  why: string[];
  metrics: Metric[];
  symptom: { name: string; whyWrong: string };
  instrument: { code: string; text: string };
  falsifier: string;
  unlocks: string;
  story: string;
};

export const SNAPSHOT_DATE = "2026-08-25";

export const constraints: Constraint[] = [
  {
    slug: "state-hardware",
    order: 1,
    name: "State hardware",
    shortName: "Hardware",
    status: "tight",
    slot: "The civil service cannot hire, fire, merge, or finish a major project at the speed the rest of the programme requires.",
    hero: {
      label: "Major projects rated Green",
      value: "15%",
      detail:
        "NISTA: 29 of 189 GMPP projects Green at 31 Mar 2026. 34 (18%) Red: successful delivery appears unachievable. 109 Amber. IPA's 2024 'likely to succeed' figure was 11%, down from 48% in 2013.",
      asOf: "31 Mar 2026",
      source: "NISTA Major Projects Annual Report 2025-26",
      href: "https://www.gov.uk/government/news/government-major-projects-demonstrate-strong-foundations-for-delivery",
    },
    throughput: "Finished public projects: nuclear, prisons, hospitals, grid corridors.",
    test: "If we doubled policy papers and left the delivery machine unchanged, would more megawatts, cells, or beds appear? No.",
    why: [
      "The Progress diagnosis is that sophisticated policy on failing institutional hardware is futile. The machine must be fixed first. NISTA (end-March 2026): 15% Green, 18% Red, on a £924.2bn whole-life portfolio.",
      "Administrative (front-line) civil service posts have fallen about 45% since 2010 while policy-oriented senior grades have swollen: more people writing, fewer people implementing.",
      "About 20% of Senior Civil Service appointments come from outside government. The service is hard to enter and harder to leave for failure.",
      "The Public Accounts Committee has described public procurement as littered with waste, failure, and bad value. Annual procurement is about £400bn.",
    ],
    metrics: [
      {
        label: "NISTA Green share",
        value: "15%",
        detail: "29 of 189 GMPP projects. Snapshot before the April 2026 reset to 81 projects.",
        asOf: "31 Mar 2026",
        source: "NISTA / GOV.UK",
        href: "https://www.gov.uk/government/news/government-major-projects-demonstrate-strong-foundations-for-delivery",
      },
      {
        label: "NISTA Red share",
        value: "18%",
        detail: "34 projects. Highways Magazine: about £244bn of £924.2bn whole-life cost.",
        asOf: "31 Mar 2026",
        source: "NISTA Major Projects Annual Report 2025-26",
        href: "https://www.gov.uk/government/publications/nista-major-projects-annual-report-2025-26",
      },
      {
        label: "IPA success confidence",
        value: "11%",
        detail: "Share of the Government Major Projects Portfolio rated likely to succeed. Historic vintage. Do not blend with NISTA 15%.",
        asOf: "2024",
        source: "Infrastructure and Projects Authority",
        href: "https://www.gov.uk/government/organisations/infrastructure-and-projects-authority",
      },
      {
        label: "IPA success confidence (2013)",
        value: "48%",
        asOf: "2013",
        source: "IPA historic series (Progress Economy book)",
        href: "https://www.gov.uk/government/organisations/infrastructure-and-projects-authority",
      },
      {
        label: "External SCS hires",
        value: "~20%",
        asOf: "early 2020s",
        source: "Rewiring the State / civil service data",
        href: "https://www.gov.uk/government/organisations/civil-service",
      },
    ],
    symptom: {
      name: "Waste headlines and £100bn lumps",
      whyWrong:
        "A lump sum does not tell you which slot is full. Contract value is not spend. The bind is that the state cannot complete what it starts.",
    },
    instrument: {
      code: "CS1, CS9, CS10, E10",
      text: "Ministerial hire-and-fire of senior officials; 24 departments to 10; the Angliot (public-service academy); procurement revolution.",
    },
    falsifier:
      "Two years after CS reform, NISTA Green share still in the teens and median time from business case to first output has not fallen.",
    unlocks:
      "Every other constraint. Without this, nuclear, prisons, beds, and grid corridors are metabolised by the existing machine.",
    story:
      "A factory can wait ten years for a grid offer because the people who could force the corridor through cannot hire the engineers or fire the blockage.",
  },
  {
    slug: "grid-slot",
    order: 2,
    name: "Grid connection slot",
    shortName: "Grid",
    status: "tight",
    slot: "A physical connection to the transmission system. Ready projects wait years. Names on a queue are not megawatts.",
    hero: {
      label: "Contracted vs built",
      value: "737 GW / 85 GW",
      detail: "2,204 projects on the GB register. 73.5% still at scoping: NESO has no planning application.",
      asOf: "14 Aug 2026",
      source: "GB connections register analysis",
      href: "https://solargridcheck.co.uk/uk-grid-connection-queue",
    },
    throughput: "Megawatts actually connected this year: generation, storage, and demand (factories, data centres, housing).",
    test: "If we doubled subsidy for solar but left the connection date in 2035, would Britain get cheaper power this parliament? No.",
    why: [
      "The Progress energy book states it plainly: the grid has become the binding constraint on all new generation. A power station without a connection is a stranded asset.",
      "The old queue grew above 700 GW, about four times what 2030 needs. Shovel-ready projects waited up to ten years. NESO reform reordered names. It did not pour concrete.",
      "Transmission projects still take 12 to 14 years (Winser review). Wind farms can be built in less than half that.",
      "The demand queue is a second hopper. Contracted demand rose to 125 GW by June 2025, of which about 73 GW was data centres. A port or mill can still be offered a connection in 2040.",
    ],
    metrics: [
      {
        label: "Contracted capacity",
        value: "737 GW",
        detail: "Generation, storage, and interconnection on the GB transmission register.",
        asOf: "14 Aug 2026",
        source: "GB connections register",
        href: "https://solargridcheck.co.uk/uk-grid-connection-queue",
      },
      {
        label: "Actually built and connected",
        value: "85 GW",
        asOf: "14 Aug 2026",
        source: "GB connections register",
        href: "https://solargridcheck.co.uk/uk-grid-connection-queue",
      },
      {
        label: "Still at scoping",
        value: "73.5%",
        detail: "No planning application known to NESO.",
        asOf: "14 Aug 2026",
        source: "GB connections register",
        href: "https://solargridcheck.co.uk/uk-grid-connection-queue",
      },
      {
        label: "NESO old queue",
        value: ">700 GW",
        detail: "Official NESO line: four times what 2030 needs. Shovel-ready waits of up to 10 years. Reform reorders names; it does not pour concrete.",
        asOf: "2025-26 reform",
        source: "NESO Connections Reform Results",
        href: "https://www.neso.energy/industry-information/connections-reform/connections-reform-results",
      },
      {
        label: "Contracted demand (T+D)",
        value: "125 GW",
        detail: "Rose from 41 GW (Nov 2024) to 125 GW (Jun 2025). About 315 data centres accounted for 73 GW of that surge. GB peak demand was about 45 GW in 2025.",
        asOf: "Jun 2025",
        source: "Ofgem / DESNZ demand-connections commentary",
        href: "https://www.gov.uk/government/consultations/accelerating-electricity-network-connections-for-strategic-demand",
      },
      {
        label: "Strategic transmission build",
        value: "12-14 years",
        asOf: "2023 Winser review",
        source: "Electricity Networks Commissioner to DESNZ",
        href: "https://www.gov.uk/government/publications/electricity-networks-commissioner-letter-to-the-secretary-of-state",
      },
    ],
    symptom: {
      name: "Wholesale price spikes and renewable GW announcements",
      whyWrong:
        "A wind farm in a press release is not a wind farm on the system. Weather moves wholesale prices. The slot that does not move is the connection date.",
    },
    instrument: {
      code: "E1.3",
      text: "National Grid Emergency Build Authority; compulsory purchase of corridors; statutory 12-month connection for nationally significant energy; 24 months otherwise.",
    },
    falsifier:
      "Ready projects still receive connection dates measured in years, not months, after the Energy Security Act is law.",
    unlocks:
      "Nuclear, data centres, mills, and new towns. Without the slot, Unicorn Farm and Prosperity Zones have nowhere to plug in.",
    story:
      "A site already has the kit for a 1.5 GW connection and still waits five years for power from a network that is physically there.",
  },
  {
    slug: "planning",
    order: 3,
    name: "Planning default-no",
    shortName: "Planning",
    status: "tight",
    slot: "Consent. Judicial review. The years between a shovel-ready scheme and a lawful start on site.",
    hero: {
      label: "Homes granted full consent",
      value: "186,000",
      detail:
        "Year to Q1 2026 (Savills / Glenigan / HBF). Labour's 1.5 million this parliament implies about 300,000 a year. Consents are the lawful-yes slot. Transmission still takes 12-14 years for the same reason.",
      asOf: "YE Q1 2026",
      source: "Savills English Housing Supply Q1 2026",
      href: "https://www.savills.com/research_articles/255800/390806-0",
    },
    throughput: "Homes started, nuclear sites prepared, colleges and zones stood up, corridors built.",
    test: "If we doubled Help to Buy and left consent times unchanged, would Britain build the houses? No.",
    why: [
      "Progress calls the planning system more destructive than tax and more costly than the regulatory burden. Every energy site, prosperity zone, training college, and transmission corridor waits here.",
      "Savills: about 186,000 homes gained full consent in the year to Q1 2026. MHCLG building-control completions were 143,110 in the year to 31 Mar 2026. Estimated net additional homes this parliament (9 Jul 2024 to 14 Jun 2026): 392,400 against a 1.5 million target.",
      "Brick, labour, and capital are not the scarce resource relative to a lawful yes. The default is no.",
      "Judicial review turns a consent into another lottery. Silent class changes in documents are banned inside Progress; the country has the opposite problem: a consent that is never final.",
    ],
    metrics: [
      {
        label: "Full planning consents",
        value: "186,000",
        detail: "Homes gaining consent, year to Q1 2026. Six of nine English regions consented fewer homes than they completed.",
        asOf: "YE Q1 2026",
        source: "Savills / Glenigan / HBF",
        href: "https://www.savills.com/research_articles/255800/390806-0",
      },
      {
        label: "New-build completions (building control)",
        value: "143,110",
        detail: "England, year to 31 Mar 2026. Down 6% on the previous year. Starts 130,170.",
        asOf: "YE 31 Mar 2026",
        source: "MHCLG housing supply indicators",
        href: "https://www.gov.uk/government/statistics/housing-supply-indicators-of-new-supply-england-january-to-march-2026/housing-supply-indicators-of-new-supply-england-january-to-march-2026",
      },
      {
        label: "Net additional this parliament",
        value: "392,400",
        detail: "9 Jul 2024 to 14 Jun 2026. Estimated from EPCs adjusted for demolitions. Target: 1.5 million.",
        asOf: "14 Jun 2026",
        source: "MHCLG",
        href: "https://www.gov.uk/government/statistics/housing-supply-indicators-of-new-supply-england-january-to-march-2026/housing-supply-indicators-of-new-supply-england-january-to-march-2026",
      },
      {
        label: "Transmission consent-to-build",
        value: "12-14 years",
        asOf: "2023",
        source: "Winser review",
        href: "https://www.gov.uk/government/publications/electricity-networks-commissioner-letter-to-the-secretary-of-state",
      },
      {
        label: "Labour housing target",
        value: "1.5 million",
        detail: "Output wish sitting on this constraint.",
        asOf: "Aug 2026",
        source: "MHCLG / government target",
        href: "https://www.gov.uk/government/statistics/housing-supply-indicators-of-new-supply-england-january-to-march-2026/housing-supply-indicators-of-new-supply-england-january-to-march-2026",
      },
    ],
    symptom: {
      name: "Housing targets and 'get Britain building' slogans",
      whyWrong:
        "A target is not a slot. Completions follow consents. Energy and data centres follow the same door.",
    },
    instrument: {
      code: "E4",
      text: "Great Planning Liberation: invert the default to yes; NSIP coverage; judicial review reform; Builders' Remedy where local plans fail to provide housing.",
    },
    falsifier:
      "After E4 is law, median determination times and the share of major schemes lost to JR still sit in the old distribution.",
    unlocks:
      "Grid corridors, nuclear sites, homes, Hallmark colleges, Prosperity Zones.",
    story:
      "The engineering of a high-voltage line is months. The inquiry is years. Britain is not short of steel. It is short of a lawful yes.",
  },
  {
    slug: "firm-power",
    order: 4,
    name: "Firm power",
    shortName: "Power",
    status: "tight",
    slot: "Dispatchable gigawatts that run when the wind does not. Nuclear is collapsing this decade. The bill is the highest in the industrial world.",
    hero: {
      label: "UK industrial electricity",
      value: "26.63p/kWh",
      detail: "Highest in the IEA (2024). 125% above the EU-14 median of 11.25p. France 12-14p. US 6-7p.",
      asOf: "2024",
      source: "IEA / DESNZ international industrial energy prices (Progress E1)",
      href: "https://www.gov.uk/government/statistical-data-sets/international-industrial-energy-prices",
    },
    throughput: "Steel, chemicals, data centres, and household real wages. Energy is not a sector. Energy is the economy.",
    test: "If we added another 10 GW of intermittent capacity still waiting on the grid, with nuclear falling to 1.2 GW, would industrial prices converge on France? No.",
    why: [
      "Nuclear provided about 12.2% of UK generation in 2025, down 2 points on 2024. Output was 35.9 TWh, the lowest since the 1980s (DUKES 2026).",
      "Operable nuclear capacity is about 5.9 GW. Most AGRs retire by 2030. Sizewell B (1.2 GW) is the remainder until new build arrives. Hinkley Point C is late and dear.",
      "Levies (CPS, CfD, RO, standing charges) are the immediate bind on the bill: £150-200 on a typical household and 20-30% on industrial prices. Firm power is the structural bind.",
      "British steel has paid an estimated £845 million more than French rivals since 2016/17 for equivalent output. Energy-intensive manufacturing is down about a third since 2021.",
    ],
    metrics: [
      {
        label: "Industrial price (UK)",
        value: "26.63p/kWh",
        asOf: "2024",
        source: "IEA / DESNZ",
        href: "https://www.gov.uk/government/statistical-data-sets/international-industrial-energy-prices",
      },
      {
        label: "Industrial price (France)",
        value: "12-14p/kWh",
        asOf: "2024",
        source: "IEA / DESNZ",
        href: "https://www.gov.uk/government/statistical-data-sets/international-industrial-energy-prices",
      },
      {
        label: "Operable nuclear",
        value: "5.9 GW",
        detail: "World Nuclear Association: about 5,883 MWe. Heading toward 1.2 GW (Sizewell B) as AGRs close.",
        asOf: "Aug 2026",
        source: "World Nuclear Association",
        href: "https://world-nuclear.org/information-library/country-profiles/countries-t-z/united-kingdom",
      },
      {
        label: "Nuclear generation 2025",
        value: "35.9 TWh",
        detail: "12.2% of generation. Lowest since the 1980s.",
        asOf: "2025",
        source: "DUKES 2026 chapter 5",
        href: "https://www.gov.uk/government/statistics/electricity-chapter-5-digest-of-united-kingdom-energy-statistics-dukes",
      },
      {
        label: "Progress target",
        value: "24 GW by 2038",
        asOf: "policy book",
        source: "Progress E1.1",
        href: "https://www.gov.uk/government/statistics/electricity-chapter-5-digest-of-united-kingdom-energy-statistics-dukes",
      },
    ],
    symptom: {
      name: "Net Zero rows and wholesale spikes",
      whyWrong:
        "The industrial price is a level, not a weather event. Intermittent GW in a queue does not replace retiring AGRs.",
    },
    instrument: {
      code: "E1.1-E1.4",
      text: "National Energy Security Act: 24 GW nuclear by 2038; CPS abolished day one; North Sea licences; seismic threshold 0.5 to 2.5; levies off bills.",
    },
    falsifier:
      "In 2030 nuclear GW is still falling and UK industrial electricity is still IEA-worst.",
    unlocks:
      "Reindustrialisation, data centres in Britain, and the 5p Heinz machine: when power is cheap, everything else can be.",
    story:
      "A mill in Port Talbot is not competing with a mill in Dunkirk on wages. It is competing on 26p versus 13p.",
  },
  {
    slug: "prison-places",
    order: 5,
    name: "Prison places",
    shortName: "Cells",
    status: "tight",
    slot: "A usable cell. Police can fill a hopper the rest of the system cannot empty.",
    hero: {
      label: "Population vs operational capacity",
      value: "85,858 / 89,120",
      detail: "96.3% of operational capacity (Jun 2026). Certified normal accommodation occupancy was 105.6% on 27 Jul 2026.",
      asOf: "Jun-Jul 2026",
      source: "MoJ offender management / World Prison Brief",
      href: "https://data.justice.gov.uk/prisons",
    },
    throughput: "Sentences served. Charge rates that courts will actually impose. Street crime that is no longer a revolving door.",
    test: "If we doubled neighbourhood officers and left places at the ceiling, would compound sentencing happen? No. Early release would.",
    why: [
      "Progress crime policy is Zero-Crime Britain: 100,000 places, then sentencing. Police expansion is not the first war-speed move.",
      "The government promised 20,000 new places and delivered 6,518 (Progress crime book).",
      "Adult men's estate has been running at about 98% in late 2025 (IfG). Crowding: 24.8% of prisoners in crowded accommodation (2024-25).",
      "Receptions (17,945 in Q1 2026) outrun releases (12,977). The stock rises because the slot is full.",
    ],
    metrics: [
      {
        label: "Prison population",
        value: "85,858",
        asOf: "30 Jun 2026",
        source: "MoJ, data.justice.gov.uk",
        href: "https://data.justice.gov.uk/prisons",
      },
      {
        label: "Operational capacity",
        value: "89,120",
        asOf: "Jun 2026",
        source: "MoJ",
        href: "https://data.justice.gov.uk/prisons",
      },
      {
        label: "CNA occupancy",
        value: "105.6%",
        detail: "Population 86,267 against certified normal accommodation 81,684.",
        asOf: "27 Jul 2026",
        source: "World Prison Brief / MoJ",
        href: "https://www.prisonstudies.org/country/united-kingdom-england-wales",
      },
      {
        label: "Crowded accommodation",
        value: "24.8%",
        asOf: "2024-25",
        source: "MoJ prison performance",
        href: "https://data.justice.gov.uk/prisons",
      },
      {
        label: "Progress target",
        value: "100,000 places",
        asOf: "policy book",
        source: "Progress C2",
        href: "https://data.justice.gov.uk/prisons",
      },
    ],
    symptom: {
      name: "Police numbers and 'tough on crime' speeches",
      whyWrong:
        "Arrests without cells become bail, delay, and early release. The bind is the place, not the speech.",
    },
    instrument: {
      code: "C2",
      text: "Build 100,000 prison places; then compound sentencing and knife minimums. Police doubling follows the hopper.",
    },
    falsifier:
      "After the first phase of the build, occupancy still sits at the ceiling and crowding has not fallen.",
    unlocks:
      "Sentencing that is actually served. Charge rates. The street.",
    story:
      "A magistrate can write a sentence. A full estate writes an early-release scheme.",
  },
  {
    slug: "acute-beds",
    order: 6,
    name: "Acute beds and discharge",
    shortName: "Beds",
    status: "tight",
    slot: "A general and acute bed that is empty tonight. Occupancy above 90% plus people who no longer meet the criteria to reside.",
    hero: {
      label: "Overnight G&A occupancy",
      value: "92.5%",
      detail: "102,423 available general and acute beds; 94,737 occupied. Q4 2025/26 (Jan-Mar 2026). Progress cap: 90%. Target beds: 120,000.",
      asOf: "Q4 2025/26",
      source: "NHS England KH03 / Nuffield Trust",
      href: "https://www.nuffieldtrust.org.uk/resource/hospital-bed-occupancy",
    },
    throughput: "Electives completed, A&E processed, corridors cleared. Patients who should be home, home.",
    test: "If we added 40,000 appointments a week and left occupancy at 92% with 13,000 delayed discharges, would the list fall sustainably? The list is inventory.",
    why: [
      "NICE and NHS guidance treat occupancy above about 85-90% as the point where flow and safety fail. England has sat above 90% as a habit, not a winter.",
      "About 13,750 people a day in January 2026 were ready to leave an acute hospital and had not (Nuffield). King's Fund: nearly 13,000 a day over four years, about 10% of beds, at a cost of £2.7bn in 2025/26.",
      "Corridor care: more than 2,000 patients a day in May 2026 (King's Fund / NHSE).",
      "The elective waiting list is what you see. The bed that social care has not released is the slot.",
    ],
    metrics: [
      {
        label: "G&A beds available",
        value: "102,423",
        asOf: "Q4 2025/26",
        source: "NHS England bed occupancy",
        href: "https://www.england.nhs.uk/statistics/statistical-work-areas/bed-availability-and-occupancy/",
      },
      {
        label: "Occupancy",
        value: "92.5%",
        asOf: "Q4 2025/26",
        source: "Nuffield Trust / NHSE",
        href: "https://www.nuffieldtrust.org.uk/resource/hospital-bed-occupancy",
      },
      {
        label: "Delayed discharges (acute, daily)",
        value: "13,750",
        detail: "Ready to leave, not discharged. January 2026 average. Up 12% from 12,201 in January 2022.",
        asOf: "Jan 2026",
        source: "Nuffield Trust",
        href: "https://www.nuffieldtrust.org.uk/resource/delayed-discharges-from-hospital",
      },
      {
        label: "Cost of delayed discharge",
        value: "£2.7bn",
        asOf: "2025/26",
        source: "The King's Fund",
        href: "https://www.kingsfund.org.uk/insight-and-analysis/blogs/waiting-to-get-in-waiting-to-get-out-corridor-care-delayed-discharges-rising-pressures-on-hospitals",
      },
      {
        label: "Progress target",
        value: "120,000 beds, 90% cap",
        asOf: "policy book",
        source: "Progress NHS1 / NHS7",
        href: "https://www.england.nhs.uk/statistics/statistical-work-areas/bed-availability-and-occupancy/",
      },
    ],
    symptom: {
      name: "The referral-to-treatment waiting list",
      whyWrong:
        "The list is stock. Flow is beds and discharge. Labour's '40,000 extra appointments a week' can tick a pledge while occupancy stays above 90%.",
    },
    instrument: {
      code: "NHS1, NHS7",
      text: "Core Mission Act: 120,000 hospital beds, 90% occupancy cap, 70% ring-fence for acute care. Discharge guarantee and social care integration.",
    },
    falsifier:
      "After the bed and discharge programme, occupancy still above 90% and electives still growing.",
    unlocks:
      "A&E, electives, and the end of corridor care as a business model.",
    story:
      "A night nurse does not need another strategy unit. She needs an empty bed that is not occupied by someone who was ready to go home on Tuesday.",
  },
  {
    slug: "returns",
    order: 7,
    name: "Returns slots",
    shortName: "Returns",
    status: "tight",
    slot: "An enforced removal: agreement, documents, detention, a flight. Hotels and boats are stock of people not returned.",
    hero: {
      label: "Enforced returns, year to Jul 2026",
      value: "9,679",
      detail: "Against 39,690 total returns (most voluntary). Small-boat arrivals were about 36,000 in the year to May 2026. About 4% of 2018-2025 boat arrivals had been returned by end-2025.",
      asOf: "YE Jul 2026",
      source: "Home Office returns transparency / Migration Observatory",
      href: "https://www.gov.uk/government/publications/returns-from-the-uk-and-illegal-working-activity-since-july-2024/returns-from-the-uk-between-1-july-2024-and-31-july-2026",
    },
    throughput: "People without a right to stay who actually leave. Not claims processed. Not hotels closed on paper.",
    test: "If we doubled caseworkers and left returns agreements, documents, and flights unchanged, would the hotel bill fall? The queue would change shape.",
    why: [
      "Progress watches returns, not pins on a map. Hotels are inventory. Boats are inflow. The slot is the removal.",
      "Enforced returns in the year to July 2026: 9,679. Total returns including voluntary: 39,690. Voluntary departures are not the same instrument as state removal.",
      "Migration Observatory: around 4% of people who arrived by small boat from 2018 to 2025 were returned in that period.",
      "Asylum initial-decision backlog: 48,758 at end-March 2026. Processing without returns lengthens the queue and the pull.",
      "Labour pledged 1,000 extra returns staff. Full Fact marked the pledge not kept (July 2026).",
    ],
    metrics: [
      {
        label: "Enforced returns",
        value: "9,679",
        asOf: "Aug 2025-Jul 2026",
        source: "Home Office",
        href: "https://www.gov.uk/government/publications/returns-from-the-uk-and-illegal-working-activity-since-july-2024/returns-from-the-uk-between-1-july-2024-and-31-july-2026",
      },
      {
        label: "All returns (inc. voluntary)",
        value: "39,690",
        asOf: "Aug 2025-Jul 2026",
        source: "Home Office",
        href: "https://www.gov.uk/government/publications/returns-from-the-uk-and-illegal-working-activity-since-july-2024/returns-from-the-uk-between-1-july-2024-and-31-july-2026",
      },
      {
        label: "Small-boat arrivals",
        value: "~36,000",
        detail: "Year ending 31 May 2026. 41,500 in calendar 2025.",
        asOf: "YE May 2026",
        source: "Migration Observatory / Home Office",
        href: "https://migrationobservatory.ox.ac.uk/resources/briefings/people-crossing-the-english-channel-in-small-boats/",
      },
      {
        label: "Boat arrivals later returned",
        value: "~4%",
        detail: "Share of 2018-2025 small-boat arrivals returned from the UK by end-2025.",
        asOf: "2025",
        source: "Migration Observatory",
        href: "https://migrationobservatory.ox.ac.uk/resources/briefings/returns-of-unauthorised-migrants-from-the-uk/",
      },
      {
        label: "Asylum initial-decision backlog",
        value: "48,758",
        asOf: "31 Mar 2026",
        source: "Home Office immigration system statistics",
        href: "https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-march-2026",
      },
    ],
    symptom: {
      name: "Hotel maps and daily boat counts",
      whyWrong:
        "Those are stocks and inflows. Other sites already own the map. The bind is whether the state can complete a return.",
    },
    instrument: {
      code: "PP1.3 / FP returns diplomacy",
      text: "Migration Compacts with published KPIs (returns accepted, documents issued, flights). Offshore processing. HRA surgery on immigration. Not a hotel map.",
    },
    falsifier:
      "After the compact programme, enforced returns are still a rounding error against inflow, and the boat-return rate stays in the low single digits.",
    unlocks:
      "Hotel cost as a lagging stock. Pull factor. Prison places currently held by foreign national offenders awaiting removal.",
    story:
      "A hotel is not a policy. It is a warehouse for a return that did not happen.",
  },
];

export const symptoms = [
  {
    name: "NHS waiting list / RTT",
    is: "Inventory of untreated demand",
    behind: "acute-beds",
  },
  {
    name: "Small boats and asylum hotels",
    is: "Inflow and stock of people not returned",
    behind: "returns",
  },
  {
    name: "Lump 'waste' figures",
    is: "A sum, often mixing contract value with spend",
    behind: "state-hardware",
  },
  {
    name: "Housing targets",
    is: "An output wish",
    behind: "planning",
  },
  {
    name: "Police headcount",
    is: "An input",
    behind: "prison-places",
  },
  {
    name: "Wholesale power spikes",
    is: "Weather and gas, on top of missing firm power",
    behind: "firm-power",
  },
  {
    name: "Net migration headline",
    is: "A mix of work, study, and asylum",
    behind: "returns",
  },
  {
    name: "Water for 420,000 of 1.5 million homes",
    is: "A regional slot, and often planning of reservoirs in disguise",
    behind: "planning",
  },
  {
    name: "Lowest-G7 investment share of GDP",
    is: "An output. Firms do not pour concrete into a 2035 connection date.",
    behind: "planning",
  },
  {
    name: "9.1 million economically inactive",
    is: "A mix of students, carers, early retirement, and long-term sickness. Not one physical slot.",
    behind: "acute-beds",
  },
];

export function getConstraint(slug: string): Constraint | undefined {
  return constraints.find((c) => c.slug === slug);
}
