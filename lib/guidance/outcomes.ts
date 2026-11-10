// Shared by chat and Home; only the relevant outcome should reach the user.
export const outcomePolicy = "Choose the smallest action justified by the user's latest evidence. No replies means the test was inconclusive: check reach or ask one intended recipient. Likes or compliments show attention: ask one specific question. A concrete inquiry merits a direct reply now; do not require an arbitrary number of responses. A refusal or objection is feedback: respect it and learn from the reason, without pressure. Mixed feedback: clarify the specific difference. An order is not payment; a confirmed payment supports that transaction only, not repeat demand. Apply the same distinction to applications, interviews, offers and other goals. If the result is unclear ask one essential question. Never invent thresholds, identities, prices, channels the user owns, or prerequisites. During exploration do not turn interest into an email collection, preorder, payment link or sales funnel. Only discuss transaction logistics when the user actually asks or reports a transaction needing fulfilment. ASCEND never handles payouts. Show only the relevant next move, not a menu of hypothetical outcomes.";

// Catch recurring bad advice in the narrow first-customer experiment. Other domains
// and explicit checkout/fulfilment requests keep their own context and wording.
export function refineFirstCustomer(question:string, answer:string) {
  if (!/\bfashion\b/i.test(question) || !/\bfirst (?:customer|buyer)\b/i.test(question) ||
      !/\b(?:one way|one step|test)\b/i.test(question) ||
      /\b(?:checkout|payments?|paid|ship|fulfil|collect emails?)\b/i.test(question)) return answer;
  const premature=/\b(?:paypal|payment links?|collect(?:ing)? (?:their )?emails?|pre[- ]?orders?)\b/i;
  const quota=/\b(?:if|once|after|until|at least)\b[^.!?\n]{0,65}\b(?:[2-9]|\d{2,}|two|three|four|five|ten)\b[^.!?\n]{0,36}\b(?:inquiries|enquiries|replies|leads|responses|people)\b/i;
  if (!premature.test(answer) && !quota.test(answer)) return answer;
  return "Show one sketch to someone who might wear it and ask, “What would you want to know before ordering this?” Listen for a specific question, such as size or availability. If they ask one, answer it and find out whether that resolves their hesitation.";
}

// A single buyer inquiry with no order calls for a conversation, not a demand forecast.
export function buyerInquiryReply(message: string): string | null {
  const text = message.toLowerCase().replace(/[’‘]/g, "'");
  if (!/\b(?:what should i do next|what do i (?:do|say)|how (?:do|should) i (?:reply|respond)|what should i say)\b/.test(text) ||
      !/\b(?:one person|someone|one (?:buyer|customer))\s+asked\b/.test(text) ||
      !/\b(?:nobody ordered|no one (?:has )?ordered|no orders(?: yet)?|no sales(?: yet)?)\b/.test(text) ||
      /\b(?:poll|survey|compare|detailed plan|pre-?orders?|already replied|already answered)\b/.test(text)) return null;
  const inquiry = text.split(/\basked\b/)[1].split(/[,;.!?]|\bbut\b/)[0];
  if (/\bsiz(?:e|es|ing)\b/.test(inquiry))
    return "Reply to the person who asked. If you’ve decided which sizes you’ll offer, tell them; if you haven’t, say so. Then ask, “Which size were you looking for?” Their answer tells you what this person needs.";
  if (/\b(?:price|cost|how much)\b/.test(inquiry))
    return "Reply directly with your price if you’ve set it. If you haven’t, say so and ask whether they’d like you to let them know once you have one.";
  return null;
}
