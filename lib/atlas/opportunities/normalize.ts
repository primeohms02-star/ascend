export function normalizeOpportunityDescription(
  raw: string | undefined
): string {

  if (!raw) {
    return "No description available.";
  }

  let text = raw;

  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");

  text = text.replace(/<[^>]+>/g, " ");

  text = text
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  const blacklist = [
    "Home",
    "About",
    "About Us",
    "Privacy Policy",
    "Cookie",
    "Cookies",
    "Contact",
    "Contact Us",
    "Projects",
    "News",
    "Search",
    "Request A Quote",
    "Enable JavaScript",
    "Phone",
    "Full Name",
  ];

  blacklist.forEach((word) => {
    text = text.replace(new RegExp(word, "gi"), "");
  });

  text = text.replace(/\s+/g, " ").trim();

  if (text.length > 1800) {
    text = text.substring(0, 1800) + "...";
  }

  return text;
}

/*
 Backwards compatibility.
 Existing connectors still call normalizeOpportunity().
*/
import { Opportunity } from "./types";

export function normalizeOpportunity(
  opportunity: Opportunity
): Opportunity {

  return {
    ...opportunity,

    description: normalizeOpportunityDescription(
      opportunity.description
    ),
  };

}