import type { Opportunity } from "./types";

type GeographyRule = {
  name: string;
  aliases: string[];
};

const NIGERIAN_STATE_RULES: GeographyRule[] = [
  { name: "Abia", aliases: ["abia", "umuahia", "aba"] },
  { name: "Adamawa", aliases: ["adamawa", "yola", "mubi", "jimeta"] },
  {
    name: "Akwa Ibom",
    aliases: ["akwa ibom", "uyo", "eket", "ikot ekpene", "oron"],
  },
  {
    name: "Anambra",
    aliases: ["anambra", "awka", "onitsha", "nnewi", "ogidi", "ihiala", "igbariam"],
  },
  { name: "Bauchi", aliases: ["bauchi", "azare"] },
  { name: "Bayelsa", aliases: ["bayelsa", "yenagoa"] },
  { name: "Benue", aliases: ["benue", "makurdi", "gboko", "otukpo"] },
  { name: "Borno", aliases: ["borno", "maiduguri", "biu"] },
  { name: "Cross River", aliases: ["cross river", "calabar", "ikom", "obudu"] },
  {
    name: "Delta",
    aliases: ["delta state", "asaba", "warri", "sapele", "ughelli", "abraka"],
  },
  { name: "Ebonyi", aliases: ["ebonyi", "abakaliki", "afikpo"] },
  { name: "Edo", aliases: ["edo state", "benin city", "auchi", "ekpoma"] },
  { name: "Ekiti", aliases: ["ekiti", "ado ekiti", "ikere ekiti"] },
  { name: "Enugu", aliases: ["enugu", "nsukka", "oji river"] },
  { name: "Gombe", aliases: ["gombe"] },
  { name: "Imo", aliases: ["imo state", "owerri", "orlu", "okigwe"] },
  { name: "Jigawa", aliases: ["jigawa", "dutse", "hadejia"] },
  { name: "Kaduna", aliases: ["kaduna", "zaria", "kafanchan"] },
  { name: "Kano", aliases: ["kano"] },
  { name: "Katsina", aliases: ["katsina", "daura", "funtua"] },
  { name: "Kebbi", aliases: ["kebbi", "birnin kebbi", "argungu"] },
  { name: "Kogi", aliases: ["kogi", "lokoja", "okene", "idah"] },
  { name: "Kwara", aliases: ["kwara", "ilorin", "offa"] },
  {
    name: "Lagos",
    aliases: [
      "lagos",
      "ikeja",
      "lekki",
      "victoria island",
      "ikoyi",
      "yaba",
      "ajah",
      "surulere",
      "apapa",
      "epe",
    ],
  },
  { name: "Nasarawa", aliases: ["nasarawa", "lafia", "keffi", "karu"] },
  {
    name: "Niger",
    aliases: ["niger state", "minna", "suleja", "bida", "kontagora"],
  },
  { name: "Ogun", aliases: ["ogun", "abeokuta", "ota", "ijebu ode", "sagamu"] },
  { name: "Ondo", aliases: ["ondo", "akure", "owo"] },
  { name: "Osun", aliases: ["osun", "osogbo", "ile ife", "ilesa"] },
  { name: "Oyo", aliases: ["oyo", "ibadan", "ogbomoso"] },
  { name: "Plateau", aliases: ["plateau state", "jos", "bukuru"] },
  {
    name: "Rivers",
    aliases: ["rivers state", "port harcourt", "portharcourt", "bonny", "eleme"],
  },
  { name: "Sokoto", aliases: ["sokoto"] },
  { name: "Taraba", aliases: ["taraba", "jalingo"] },
  { name: "Yobe", aliases: ["yobe", "damaturu", "potiskum"] },
  { name: "Zamfara", aliases: ["zamfara", "gusau"] },
  {
    name: "Federal Capital Territory",
    aliases: [
      "federal capital territory",
      "abuja",
      "fct abuja",
      "gwagwalada",
      "kubwa",
      "wuse",
      "maitama",
      "asokoro",
    ],
  },
];

const AFRICAN_COUNTRY_RULES: GeographyRule[] = [
  { name: "South Sudan", aliases: ["south sudan", "juba"] },
  {
    name: "Democratic Republic of the Congo",
    aliases: ["democratic republic of the congo", "dr congo", "drc", "kinshasa", "lubumbashi"],
  },
  { name: "Republic of the Congo", aliases: ["republic of the congo", "congo brazzaville", "brazzaville"] },
  { name: "Equatorial Guinea", aliases: ["equatorial guinea", "malabo"] },
  { name: "Guinea-Bissau", aliases: ["guinea bissau", "bissau"] },
  { name: "Central African Republic", aliases: ["central african republic", "bangui"] },
  { name: "Sao Tome and Principe", aliases: ["sao tome and principe", "sao tome"] },
  { name: "Cote d'Ivoire", aliases: ["cote d ivoire", "ivory coast", "abidjan", "yamoussoukro"] },
  { name: "Cabo Verde", aliases: ["cabo verde", "cape verde", "praia"] },
  { name: "South Africa", aliases: ["south africa", "johannesburg", "cape town", "pretoria", "durban"] },
  { name: "Burkina Faso", aliases: ["burkina faso", "ouagadougou"] },
  { name: "Sierra Leone", aliases: ["sierra leone", "freetown"] },
  { name: "Nigeria", aliases: ["nigeria", "nigerian"] },
  { name: "Ghana", aliases: ["ghana", "accra", "kumasi", "tema", "tamale", "cape coast"] },
  { name: "Kenya", aliases: ["kenya", "nairobi", "mombasa", "kisumu", "nakuru", "kiambu"] },
  { name: "Rwanda", aliases: ["rwanda", "kigali"] },
  { name: "Uganda", aliases: ["uganda", "kampala", "entebbe"] },
  { name: "Tanzania", aliases: ["tanzania", "dar es salaam", "dodoma", "arusha"] },
  { name: "Ethiopia", aliases: ["ethiopia", "addis ababa"] },
  { name: "Senegal", aliases: ["senegal", "dakar"] },
  { name: "Cameroon", aliases: ["cameroon", "yaounde", "douala"] },
  { name: "Zambia", aliases: ["zambia", "lusaka", "ndola"] },
  { name: "Zimbabwe", aliases: ["zimbabwe", "harare", "bulawayo"] },
  { name: "Botswana", aliases: ["botswana", "gaborone"] },
  { name: "Namibia", aliases: ["namibia", "windhoek"] },
  { name: "Mozambique", aliases: ["mozambique", "maputo"] },
  { name: "Malawi", aliases: ["malawi", "lilongwe", "blantyre"] },
  { name: "Angola", aliases: ["angola", "luanda"] },
  { name: "Benin", aliases: ["benin republic", "cotonou", "porto novo"] },
  { name: "Burundi", aliases: ["burundi", "bujumbura", "gitega"] },
  { name: "Chad", aliases: ["chad", "n djamena"] },
  { name: "Comoros", aliases: ["comoros", "moroni"] },
  { name: "Djibouti", aliases: ["djibouti"] },
  { name: "Egypt", aliases: ["egypt", "cairo", "alexandria"] },
  { name: "Eritrea", aliases: ["eritrea", "asmara"] },
  { name: "Eswatini", aliases: ["eswatini", "swaziland", "mbabane"] },
  { name: "Gabon", aliases: ["gabon", "libreville"] },
  { name: "The Gambia", aliases: ["the gambia", "gambia", "banjul"] },
  { name: "Guinea", aliases: ["guinea", "conakry"] },
  { name: "Lesotho", aliases: ["lesotho", "maseru"] },
  { name: "Liberia", aliases: ["liberia", "monrovia"] },
  { name: "Libya", aliases: ["libya", "tripoli"] },
  { name: "Madagascar", aliases: ["madagascar", "antananarivo"] },
  { name: "Mali", aliases: ["mali", "bamako"] },
  { name: "Mauritania", aliases: ["mauritania", "nouakchott"] },
  { name: "Mauritius", aliases: ["mauritius", "port louis"] },
  { name: "Morocco", aliases: ["morocco", "casablanca", "rabat", "marrakesh", "marrakech"] },
  { name: "Niger", aliases: ["niger republic", "niamey"] },
  { name: "Seychelles", aliases: ["seychelles", "victoria seychelles"] },
  { name: "Somalia", aliases: ["somalia", "mogadishu"] },
  { name: "Sudan", aliases: ["sudan", "khartoum"] },
  { name: "Togo", aliases: ["togo", "lome"] },
  { name: "Tunisia", aliases: ["tunisia", "tunis"] },
  { name: "Algeria", aliases: ["algeria", "algiers"] },
];

const AFRICA_FOCUSED_SOURCES = new Set([
  "africanfashionfoundation",
  "afterschoolafrica",
  "fatefoundation",
  "hotnigerianjobs",
  "jobgurus",
  "musicinafrica",
  "myjobmag",
  "nigeriafinance",
  "opportunitiesforafricans",
  "opportunitydesk",
  "opportunityforafrica",
  "scholarshipregion",
  "trybeafrica",
]);

export function normalizeGeography(value?: string): string {
  return (
    value
      ?.normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim() ?? ""
  );
}

function findRule(value: string, rules: GeographyRule[]): string | null {
  const searchable = ` ${normalizeGeography(value)} `;

  if (searchable.trim().length === 0) {
    return null;
  }

  for (const rule of rules) {
    for (const alias of rule.aliases) {
      if (searchable.includes(` ${normalizeGeography(alias)} `)) {
        return rule.name;
      }
    }
  }

  return null;
}

function opportunityText(opportunity: Opportunity): string {
  return [
    opportunity.location,
    opportunity.title,
    opportunity.company,
    ...(opportunity.tags ?? []),
    opportunity.description,
  ]
    .filter(Boolean)
    .join(" ");
}

export function inferNigerianState(value: string): string | null {
  return findRule(value, NIGERIAN_STATE_RULES);
}

export function inferAfricanCountry(value: string): string | null {
  if (inferNigerianState(value)) {
    return "Nigeria";
  }

  return findRule(value, AFRICAN_COUNTRY_RULES);
}

export function getNigerianState(opportunity: Opportunity): string | null {
  const locationCountry = findRule(
    opportunity.location ?? "",
    AFRICAN_COUNTRY_RULES,
  );
  const tagCountry = findRule(
    (opportunity.tags ?? []).join(" "),
    AFRICAN_COUNTRY_RULES,
  );

  if (
    (locationCountry && locationCountry !== "Nigeria") ||
    (tagCountry && tagCountry !== "Nigeria")
  ) {
    return null;
  }

  return (
    inferNigerianState(opportunity.location ?? "") ??
    inferNigerianState((opportunity.tags ?? []).join(" ")) ??
    inferNigerianState(opportunityText(opportunity))
  );
}

export function getAfricanCountry(opportunity: Opportunity): string | null {
  const locationCountry = inferAfricanCountry(opportunity.location ?? "");

  if (locationCountry) {
    return locationCountry;
  }

  const tagCountry = inferAfricanCountry((opportunity.tags ?? []).join(" "));

  if (tagCountry) {
    return tagCountry;
  }

  if (getNigerianState(opportunity)) {
    return "Nigeria";
  }

  return inferAfricanCountry(opportunityText(opportunity));
}

export function isNigerianOpportunity(opportunity: Opportunity): boolean {
  return getAfricanCountry(opportunity) === "Nigeria";
}

export function isAfricanOpportunity(opportunity: Opportunity): boolean {
  if (getAfricanCountry(opportunity)) {
    return true;
  }

  const searchable = normalizeGeography(opportunityText(opportunity));

  return (
    searchable.includes("africa") ||
    searchable.includes("african") ||
    AFRICA_FOCUSED_SOURCES.has(normalizeGeography(opportunity.source))
  );
}

export function enrichOpportunityGeography(
  opportunity: Opportunity,
): Opportunity {
  const state = getNigerianState(opportunity);
  const country = state ? "Nigeria" : getAfricanCountry(opportunity);
  const tags = new Map(
    (opportunity.tags ?? []).map((tag) => [normalizeGeography(tag), tag]),
  );

  if (state) {
    tags.set(normalizeGeography(state), state);
  }

  if (country) {
    tags.set(normalizeGeography(country), country);
    tags.set("africa", "Africa");
  }

  const normalizedLocation = normalizeGeography(opportunity.location);
  const genericLocation = new Set([
    "",
    "africa",
    "africa global",
    "nigeria",
  ]).has(normalizedLocation);

  let location = opportunity.location;

  if (!opportunity.remote && genericLocation && state) {
    location = `${state}, Nigeria`;
  } else if (!opportunity.remote && genericLocation && country) {
    location = country;
  }

  return {
    ...opportunity,
    location,
    tags: Array.from(tags.values()),
  };
}
