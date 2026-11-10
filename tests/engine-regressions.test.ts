import assert from "node:assert/strict";
import test from "node:test";
import { assessApplicationReadiness } from "../lib/atlas/opportunities/application-readiness";
import { analyzeOpportunityDeadline, isOpportunityExpired } from "../lib/atlas/opportunities/deadline";
import { filterOpportunities } from "../lib/atlas/opportunities/filter";
import type { OpportunityProfile } from "../lib/atlas/opportunities/profile";
import type { Opportunity } from "../lib/atlas/opportunities/types";
import { isRepeatedMissionTitle } from "../lib/engine/missionSimilarity";
import {
  isUsableMissionTitle,
  normalizeMissionContent,
} from "../lib/atlas/missionContent";
import { normalizeAtlasListArtifacts } from "../lib/atlas/replyFormatting";
import {
  hasPersonalizedSnapshotScore,
  resolveOpportunityMatchScore,
} from "../lib/atlas/opportunities/match-score";
import { isOnboardingContextComplete } from "../lib/atlas/onboardingCompletion";
const beginnerProfile: OpportunityProfile = {
  clerkId: "test-user",
  careerGoal: "Build a finance career",
  skills: ["Excel"],
  interests: ["finance"],
  experienceLevel: "beginner",
  education: "Bachelor's degree",
  location: "Lagos, Nigeria",
  preferredCountries: ["Nigeria"],
  remoteOnly: false,
  industries: ["finance"],
  languages: ["English"],
};

const seniorRole: Opportunity = {
  id: "senior-role",
  title: "Senior Investment Director",
  company: "Example Capital",
  description: "Lead investment research and portfolio strategy.",
  requirements: ["10 years of investment management experience", "CFA certification"],
  source: "test",
  location: "Lagos, Nigeria",
  tags: ["finance", "investment management", "CFA"],
};

test("new and partial accounts cannot bypass onboarding", () => {
  assert.equal(isOnboardingContextComplete(null), false);
  assert.equal(
    isOnboardingContextComplete({
      identity: "",
      goal: "Find a Job",
      north_star: "Build a meaningful career",
    }),
    false,
  );
  assert.equal(
    isOnboardingContextComplete({
      identity: "Recent Graduate",
      goal: "Find a Job",
      north_star: "Build a meaningful career",
    }),
    true,
  );
});

test("senior-role experience mismatch cannot be application-ready", () => {
  const result = assessApplicationReadiness(seniorRole, beginnerProfile, 98, 95);

  assert.equal(result.experienceRequirement, "advanced");
  assert.equal(result.experienceAligned, false);
  assert.ok(result.score <= 49);
  assert.equal(result.level, "Research First");
});

test("expired opportunities are excluded and readiness-capped", () => {
  const expired = { ...seniorRole, id: "expired", deadline: "2020-01-01" };

  assert.equal(isOpportunityExpired(expired.deadline), true);
  assert.equal(analyzeOpportunityDeadline(expired.deadline).status, "expired");
  assert.deepEqual(filterOpportunities([expired], beginnerProfile), []);
  assert.ok(assessApplicationReadiness(expired, beginnerProfile, 100, 100).score <= 20);
});

test("personalized feeds do not fall back to unrelated opportunities", () => {
  const unrelated: Opportunity = {
    id: "unrelated",
    title: "Marine Biology Field Research",
    company: "Ocean Lab",
    description: "Study coral reef ecology.",
    source: "test",
    location: "Australia",
    tags: ["marine biology", "ecology"],
  };

  assert.deepEqual(filterOpportunities([unrelated], beginnerProfile), []);
});

test("missions with cosmetic title changes are treated as repeated", () => {
  assert.equal(
    isRepeatedMissionTitle("Build Customer Evidence", ["Building Your Customer Evidence"]),
    true,
  );
  assert.equal(
    isRepeatedMissionTitle("Map Finance Requirements", ["Publish a Design Portfolio"]),
    false,
  );
});

test("Atlas reply artifacts become clean numbered and bullet lists", () => {
  const result = normalizeAtlasListArtifacts(
    "1️⃣ Draft (≈150 words).:\n- [ ] Save it.\nWhy these items matter: - **Alignment** with the North Star. - **Confidence** through evidence.\nI finished. a real win.\n“Done.”.",
  );

  assert.equal(
    result,
    "1. Draft (about 150 words):\n• Save it.\nWhy these items matter:\n• **Alignment** with the North Star.\n• **Confidence** through evidence.\nI finished. A real win.\n“Done.”",
  );
  assert.equal(result.includes(":."), false);
});

test("opportunity decision preserves the personalized snapshot match score", () => {
  assert.equal(
    resolveOpportunityMatchScore(
      { score: 68, snapshotId: "629472" },
      54,
    ),
    68,
  );

  assert.equal(
    resolveOpportunityMatchScore(
      { score: undefined, snapshotId: undefined },
      54,
    ),
    54,
  );
});

test("mission content removes model markup and retains an actionable outcome", () => {
  const mission = normalizeMissionContent(
    "**Create a Finance Evidence Pack**",
    "### Outcome\n- Build one Excel model.\n- Save a shareable PDF.",
  );

  assert.equal(mission.title, "Create a Finance Evidence Pack");
  assert.equal(mission.description.includes("**"), false);
  assert.equal(mission.description.includes("###"), false);
  assert.match(mission.description, /Build one Excel model/);
  assert.match(mission.description, /Save a shareable PDF/);
  assert.equal(isUsableMissionTitle(mission.title), true);
});

test("mission titles remain concise labels without clipped endings", () => {
  const mission = normalizeMissionContent(
    "Outcome: Create a one-page value pitch tailored to a specific high-value contact and send it by email",
    "Build a focused value pitch for one relevant contact. Save the final message as evidence before sending it.",
  );

  assert.equal(mission.title, "Create a One-page Value Pitch");
  assert.equal(mission.title.includes("…"), false);
  assert.equal(mission.title.split(/\s+/).length <= 6, true);
  assert.match(mission.description, /high-value contact/i);
  assert.match(mission.description, /Save the final message/i);
  assert.equal(isUsableMissionTitle(mission.title), true);
});

test("mission repetition catches inflections but permits genuinely new work", () => {
  assert.equal(
    isRepeatedMissionTitle("Preparing Finance Interview Evidence", [
      "Prepare Your Finance Interview Evidence",
    ]),
    true,
  );
  assert.equal(
    isRepeatedMissionTitle("Draft Three Tailored Outreach Messages", [
      "Prepare Your Finance Interview Evidence",
    ]),
    false,
  );
});

test("readiness cannot be inflated when required skills are unverified", () => {
  const result = assessApplicationReadiness(
    {
      ...seniorRole,
      id: "skills-gap",
      title: "Finance Analyst",
      requirements: ["Power BI experience", "SQL proficiency"],
      tags: ["finance", "Power BI", "SQL"],
    },
    beginnerProfile,
    100,
    100,
  );

  assert.equal(result.matchedSkills.length, 0);
  assert.ok(result.skillsToVerify.length >= 2);
  assert.ok(result.score <= 54);
  assert.notEqual(result.level, "Ready to Apply");
});

test("deadline states distinguish urgent, upcoming, invalid, and absent listings", () => {
  const now = new Date("2026-08-25T12:00:00.000Z");

  assert.equal(analyzeOpportunityDeadline(undefined, now).status, "none");
  assert.equal(analyzeOpportunityDeadline("not-a-date", now).status, "invalid");
  assert.equal(analyzeOpportunityDeadline("2026-08-28", now).status, "urgent");
  assert.equal(analyzeOpportunityDeadline("2026-09-10", now).status, "soon");
  assert.equal(analyzeOpportunityDeadline("2026-12-31", now).status, "open");
});

test("relevant finance opportunities remain while unrelated listings stay excluded", () => {
  const relevant: Opportunity = {
    id: "finance-analyst",
    title: "Graduate Finance Analyst",
    company: "Example Bank",
    description: "Build financial models and support investment analysis.",
    source: "test",
    location: "Lagos, Nigeria",
    category: "job",
    tags: ["finance", "Excel"],
  };

  const filtered = filterOpportunities([relevant], beginnerProfile);

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0]?.id, relevant.id);
  assert.ok((filtered[0]?.score ?? 0) > 0);
});

test("snapshot match scores are safely clamped", () => {
  assert.equal(
    resolveOpportunityMatchScore({ score: 120, snapshotId: "snapshot" }, 40),
    100,
  );
  assert.equal(
    resolveOpportunityMatchScore({ score: -10, snapshotId: "snapshot" }, 40),
    0,
  );
});

test("only personalized snapshot scores can bypass detail reranking", () => {
  assert.equal(
    hasPersonalizedSnapshotScore({ score: 68, snapshotId: "snapshot" }),
    true,
  );
  assert.equal(
    hasPersonalizedSnapshotScore({ score: 68, snapshotId: undefined }),
    false,
  );
  assert.equal(
    hasPersonalizedSnapshotScore({ score: Number.NaN, snapshotId: "snapshot" }),
    false,
  );
});


import {activeStep,safePublicLink,type JourneyEntry} from '../lib/guidance/types';
import {publicTopic,readResults} from '../lib/guidance/sources';
import {pickForDirection} from '../lib/guidance/picks';
const testEntry:JourneyEntry={id:"one",direction:"Build a fashion career",event:"accept",step:"Sketch one garment",note:"",recorded_at:"2026-11-09"};
test("check-ins keep the agreed step; completion closes it",()=>{
 assert.equal(activeStep([]),null);assert.equal(activeStep([{...testEntry,event:'stuck'},testEntry]),testEntry.step);assert.equal(activeStep([{...testEntry,event:'done'},testEntry]),null);assert.equal(activeStep([{...testEntry,event:'achieved'},testEntry]),null);
});
test("automatic research sends topic words, not a private message",()=>{
 const topic=publicTopic("My name is Jane Example. Search the web for fashion training in Nigeria. Email jane@example.com.");
 assert.match(topic,/fashion/);assert.match(topic,/Nigeria/);assert.doesNotMatch(topic,/jane|example|@|email/i);assert.equal(publicTopic("private details only"),"");
});
test("source links reject unsafe schemes and deduplicate results",()=>{
 assert.equal(safePublicLink("javascript:alert(1)"),null);assert.equal(safePublicLink("https://u:p@host.example/path"),null);
 const row={title:"Training",url:"https://provider.example/training",content:"Applications open in March",published_date:"2026-01-01"};
 const sources=readResults({results:[row,row,{...row,url:'file:///private'},{...row,content:'',url:'https://other.example/'}]});assert.equal(sources.length,1);assert.equal(sources[0].published,"2026-01-01");
});
test("dashboard matches need a real topic, valid source and an undecided listing",()=>{
 const base={id:'f1',title:'Fashion design fellowship',company:'Example',category:'fashion',source:'provider',url:'https://provider.example/listing',tags:['design'],score:75};
 const page={profile:{...beginnerProfile,careerGoal:'fashion designer',skills:['design'],interests:['fashion'],industries:[]},snapshotId:'123',opportunities:[base,{...base,id:'f2',deadline:'2001-01-01'},{...base,id:'f3',title:'Unrelated role',category:'legal',tags:[]},{...base,id:'f4',url:'javascript:void(0)'},{...base,id:'f5'}]};
 const picks=pickForDirection(page,['f5']);assert.deepEqual(picks.map(p=>p.id),['f1']);assert.match(picks[0].href,/123/);assert.match(picks[0].reason,/design|fashion/);
});

import {searchPublicTopic} from '../lib/guidance/tavily';
test('research transport sends only a public query and retains linked, dated evidence',async()=>{
 let sent='';const mock:typeof fetch=async(url,options)=>{assert.equal(url,'https://api.tavily.com/search');sent=String(options?.body);return Response.json({results:[{title:'Design programme',url:'https://school.example/design',content:'Requirements include a portfolio.',published_date:'2026-10-15'}]});};
 const r=await searchPublicTopic('fashion training Nigeria','fixture',mock);assert.equal(r.status,'ready');assert.equal(JSON.parse(sent).query,'fashion training Nigeria');assert.equal(r.sources[0].published,'2026-10-15');assert.equal(JSON.parse(sent).include_raw_content,false);
});
test('unavailable search and successful empty search stay distinct',async()=>{
 assert.equal((await searchPublicTopic('design','fixture',async()=>new Response(null,{status:429}))).status,'unavailable');
 assert.equal((await searchPublicTopic('design','fixture',async()=>Response.json({results:[]}))).status,'no_results');
 assert.equal((await searchPublicTopic('design','fixture',async()=>Response.json({bad:true}))).status,'unavailable');
});

test('a generic transferable skill does not override a specific ambition',()=>{
 const unrelated={id:'office',company:'Example',title:'Office assistant',category:'administration',source:'provider',url:'https://provider.example/office',tags:['communication'],score:80};
 assert.deepEqual(pickForDirection({profile:{...beginnerProfile,careerGoal:'Fashion design',skills:['communication']},opportunities:[unrelated],snapshotId:'123'},[]),[]);
});

import {readStepDraft,draftKey} from '../lib/guidance/draft';
test('refresh restores an editable draft only for the same direction and journey revision',()=>{
 const state={direction:'Build a strong reliable business.',history:[]};
 const raw=JSON.stringify({direction:state.direction,previous:null,step:'Study one fashion brand',why:'Understand its customers'});
 assert.deepEqual(readStepDraft(raw,state),{step:'Study one fashion brand',why:'Understand its customers'});
 assert.notEqual(draftKey('user-A'),draftKey('user-B'));
 assert.equal(readStepDraft(raw,{...state,direction:'New direction'}),null);
 assert.equal(readStepDraft(raw,{...state,history:[testEntry]}),null);
 assert.equal(readStepDraft('{',state),null);assert.equal(readStepDraft(null,state),null);
});
test('a broad business goal cannot justify unrelated climate or marketing picks',()=>{
 const profile={...beginnerProfile,careerGoal:'Build a strong reliable business',skills:['Fashion Design','digital marketing'],industries:['Business'],interests:['business','FASHION DESIGN']};
 const item={id:'climate',title:'Climate leadership programme',company:'Example',tags:['Business','Leadership'],score:81,source:'example',url:'https://provider.example/info',requirements:['fashion design']};
 const picks=pickForDirection({profile,opportunities:[item,{...item,id:'manager',title:'Marketing Manager at Agrocom'}, {...item,id:'fashion',title:'Fashion Design mentorship'}],snapshotId:'123'},[]);
 assert.deepEqual(picks.map(x=>x.id),['fashion']);assert.equal(picks[0].reason,'The listing mentions fashion design, which connects to your saved profile.');
});

test('a matching skill does not make a senior vacancy a beginner recommendation',()=>{
 const profile={...beginnerProfile,careerGoal:'Start a business',skills:['Digital Marketing']};
 const item={id:'senior',title:'Digital Marketing Manager',company:'Example',tags:['business'],score:80,source:'provider',url:'https://provider.example/listing'};
 const picks=pickForDirection({profile,snapshotId:'123',opportunities:[item,{...item,id:'junior',title:'Digital Marketing Internship'}]},[]);
 assert.deepEqual(picks.map(x=>x.id),['junior']);
});

import {followUpMessages,wantsSingleStep} from '../lib/guidance/follow-up';
test('a next-step follow-up uses the current obstacle rather than unrelated older advice',()=>{
 const note="I found two fashion brands, but I can't tell how they make money from their websites.";
 const state={direction:'Build a reliable business',history:[{...testEntry,event:'stuck' as const,note},{...testEntry,step:'Build a landing page',note:'Old plan'}]};
 const messages=followUpMessages('What should I do next?',state)?.messages;
 assert.ok(messages);assert.ok(messages[1].content.includes(note));assert.ok(!messages[1].content.includes('landing page'));
 assert.ok(followUpMessages('Given what I just told you, what could I try next?',state)?.messages);
 assert.equal(followUpMessages('What should I do next?',null)?.unavailable,true);
 assert.equal(followUpMessages('What should I do next?',{direction:state.direction,history:[]}),null);
 assert.equal(followUpMessages('Help me write a headline for a new landing page',state),null);
});

import {brandResearchPlan,noBrandEvidence} from '../lib/guidance/brand-research';
test('ambiguous brand research asks once, then searches a public name or hostname',()=>{
 assert.equal(brandResearchPlan('“Can you research one of these brands with me?”',false).kind,'ask');
 assert.deepEqual(brandResearchPlan('Everlane',true),{kind:'search',subject:'Everlane',query:'Everlane official website products sales channels'});
 assert.deepEqual(brandResearchPlan('https://brand.example/shop?token=private',true),{kind:'search',subject:'brand.example',query:'brand.example official website products sales channels'});
 assert.equal(brandResearchPlan('Everlane',false).kind,'chat');
 assert.equal(brandResearchPlan('Look up fashion scholarships in Nigeria',false).kind,'chat');
 assert.equal(brandResearchPlan('Research the brand Everlane',false).kind,'search');
 assert.equal(brandResearchPlan('What should I do next?',true).kind,'chat');
 assert.equal(brandResearchPlan('How do I research a brand?',false).kind,'chat');
 assert.equal(brandResearchPlan('name@example.com',true).kind,'ask');
});
test('a failed lookup does not imply verified brand findings',()=>{
 assert.match(noBrandEvidence('unavailable','Example')??'',/couldn’t verify/);
 assert.match(noBrandEvidence('no_results','Example')??'',/couldn’t find usable sources/);
 assert.equal(noBrandEvidence('ready','Example'),null);
});

test('brand supplied at the end of the original question is used immediately',()=>{
 assert.deepEqual(brandResearchPlan('“Can you research one of these brands with me? fendi',false),{kind:'search',subject:'fendi',query:'fendi official website products sales channels'});
 assert.equal(brandResearchPlan('Can you research one of these brands with me?',false).kind,'ask');
 assert.equal(brandResearchPlan('Can you research one of these brands with me? name@example.com',false).kind,'ask');
});

test("Brand followed by source instructions is recognised on the first turn",()=>{
 const plan=brandResearchPlan("Can you research one of these brands with me? Fendi. Find one clue on Fendi’s official website that shows how it sells its products. Include the source link.",false);
 assert.equal(plan.kind==="search"&&plan.subject,"Fendi");
});

test("a request for one practical experiment uses concise guidance without taking over detailed planning",()=>{
 assert.equal(wantsSingleStep("I’m starting a small fashion business and don’t have a website or boutique yet. Based on what we learned, what’s one way I can test how to reach my first customer this week?"),true);
 assert.equal(wantsSingleStep("Compare multiple options and recommend one way forward"),false);
 assert.equal(wantsSingleStep("How does Fendi sell its products?"),false);
});

import {refineFirstCustomer} from "../lib/guidance/outcomes";
test("a first-customer test does not require a quota or unsolicited checkout",()=>{
 const q="I’m starting a small fashion business. What’s one way to reach my first customer?";
 for(const reply of ["If you get at least three solid inquiries, follow up.","Send a payment link.","Ask for pre-order interest."]) assert.notEqual(refineFirstCustomer(q,reply),reply);
 const grounded="Answer their sizing question.";assert.equal(refineFirstCustomer(q,grounded),grounded);
 assert.equal(refineFirstCustomer(q+" How do I handle payment?","Send a payment link."),"Send a payment link.");
});
test("different reported outcomes reach check-in guidance without upgrading or replacing the evidence",()=>{
 for(const note of ["Nobody replied.","Someone liked it.","One person asked about sizing.","One liked it; another said no.","One buyer ordered but hasn't paid.","My first buyer paid."]){
 const ctx=followUpMessages("What should I do next?",{direction:testEntry.direction,history:[{...testEntry,event:"tried",note}]});
 assert.equal(JSON.parse(ctx!.messages![1].content).latestSavedUpdate.note,note);
 }
});

import {buyerInquiryReply} from "../lib/guidance/outcomes";
test("one sizing inquiry gets a direct answer without invented sizes, order or quota",()=>{
 const reply=buyerInquiryReply("“One person asked what sizes I’ll offer, but nobody ordered. What should I do next?”");
 assert.match(reply??"",/Which size were you looking for/);
 assert.doesNotMatch(reply??"",/votes?|poll|pre-order|XS|inventory/i);
 assert.match(buyerInquiryReply("Someone asked about price, but no orders yet. How should I respond?")??"",/if you’ve set it/);
 assert.equal(buyerInquiryReply("Nobody ordered. What should I do next?"),null);
 assert.equal(buyerInquiryReply("Someone asked about sizes, but nobody ordered. I already replied. What should I do next?"),null);
});
