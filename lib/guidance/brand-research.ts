import {safePublicLink} from './types';
import type {Research} from './sources';

type Plan = {kind:'ask'} | {kind:'search';subject:string;query:string} | {kind:'chat'};
export function brandResearchPlan(message:string,awaiting:boolean):Plan{
 let s=message.trim().replace(/^[“"‘]|[”"’]$/g,'').trim();
 if(/\b(?:how (?:do|can|should) I|teach me (?:how )?to)\b/i.test(s))return {kind:'chat'};
 const intent=/\b(?:research|investigate|look (?:up|into))\b/i.test(s);
 if(intent && /\b(?:one of (?:these|those|the|my)|these|those|both|that|this|my)\s+(?:fashion\s+)?brands?\b/i.test(s)){
  // A question followed by a name or website already answers the clarification.
  const tail=s.match(/\bbrands?(?:\s+(?:with|for) me)?\s*[?:—]\s*[”"']?\s*(.+)$/i)?.[1]?.trim();
  if(!tail)return {kind:'ask'};
  s=tail.split(/[.!?]\s+(?=(?:find|show|include|use|look|check|please|tell|give|what|how)\b)/i,1)[0];awaiting=true;
 }
 const direct=s.match(/^(?:(?:can|could|would) you |please |let['’]s )?(?:research|investigate|look (?:up|into))\s+(?:(?:the |a )?(?:fashion )?brand (?:called |named )?)?(.+?)(?:\s+(?:with|for) me)?[?.!]*$/i);
 if(!awaiting && (!direct || !/\bbrand\b/i.test(s)))return {kind:'chat'};
 if(!direct&&!awaiting)return {kind:'chat'};
 let name=(direct?.[1]??s).replace(/^(?:it['’]s|the brand is|the brand is called|the name is)\s+/i,'').trim();
 if(/^(?:cancel|stop|thanks?|never mind|what|why|how|who|where|when|can you|help|I (?:want|need|am|have)|my )\b/i.test(name)||/\?/.test(name)&&!/^https?:\/\//i.test(name))return {kind:'chat'};
 if(/^(?:https?:\/\/|(?:www\.)?[a-z\d-]+(?:\.[a-z\d-]+)+[/:?#]?)/i.test(name)){
  const link=safePublicLink(/^https?:\/\//i.test(name)?name:'https://'+name);
  if(!link)return {kind:'ask'};name=new URL(link).hostname;
 }else if(!name||name.length>70||name.split(/\s+/).length>6||!/^\p{L}[\p{L}\p{N}&.'’ -]*$/u.test(name)||/\b(?:password|email|address|phone|account|private|secret|these|brands?|mine|someone|my|please|want|need|instead|that|not|with|you|your|me)\b/i.test(name))return {kind:'ask'};
 return {kind:'search',subject:name,query:name+' official website products sales channels'};
}
export const askForBrand='Which brand should I look into first? Send its public name or official website. I’ll look for evidence of how it sells and distinguish that from what we can’t tell about its revenue.';
export function noBrandEvidence(status:Research['status'],name:string){
 if(status==='ready')return null;
 if(status==='no_results')return 'I couldn’t find usable sources for '+name+'. Is there an official website I can use to narrow the search?';
 if(status==='limit')return 'Atlas has reached its web-search limit. I haven’t verified how '+name+' sells. We can retry later, or I can help interpret an excerpt you already have.';
 return 'Live search is unavailable, so I couldn’t verify how '+name+' sells. We can retry later, or I can help interpret a product-page excerpt you already have.';
}
