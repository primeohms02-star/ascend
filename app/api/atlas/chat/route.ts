import {buyerInquiryReply} from "@/lib/guidance/outcomes";
import {brandResearchPlan,askForBrand,noBrandEvidence} from "@/lib/guidance/brand-research";
import {researchForReply} from "@/lib/guidance/research";
import {getAtlasPicks} from "@/lib/guidance/opportunities";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { auth } from "@clerk/nextjs/server";

import {
  extractPermanentMemory,
  persistAtlasResponse,
  runAtlasBrain,
} from "@/lib/atlas/brain";
import {
  analyzeAtlasImage,
  isValidAtlasImage,
} from "@/lib/atlas/vision";
import { consumeAtlasRateLimit } from "@/lib/atlas/rateLimit";

const MAX_ATLAS_MESSAGE_LENGTH = 6_000;

function shouldExtractPermanentMemory(message: string) {
  if (
    /\b(?:password|passcode|security answer|secret key|api[- ]?key|one[- ]time (?:password|code)|otp|pin|cvv|credit card|debit card|bank account|bvn|nin|social security number)\b/i.test(
      message
    )
  ) {
    return false;
  }

  return /\b(?:my (?:long[- ]term )?(?:goal|goals|values|preference|preferences|career|ambition|ambitions)|i (?:prefer|value|work as|study|have experience in|am skilled in)|i['’]m (?:a|an)|i am (?:a|an)|i want to become|i plan to become)\b/i.test(
    message
  );
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const image = body.image;
    const hasImage = image !== undefined && image !== null;

    if (hasImage && !isValidAtlasImage(image)) {
      return NextResponse.json(
        { error: "Atlas supports JPEG, PNG and WebP image attachments that fit within the vision request limit." },
        { status: 400 }
      );
    }

    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message && !hasImage) {
      return NextResponse.json(
        { error: "A message or image is required." },
        { status: 400 }
      );
    }

    if (message.length > MAX_ATLAS_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          error: `Atlas messages must be ${MAX_ATLAS_MESSAGE_LENGTH.toLocaleString()} characters or fewer.`,
        },
        { status: 400 }
      );
    }

    const topic=body.researchTopic??"";
    if(typeof topic!=="string"||topic.length>240||/https?:|@|\b\d{7,}\b/.test(topic))return NextResponse.json({error:"Use a short public search topic without contact details."},{status:400});
    const cleanMessage = message || "Please analyze this image.";
    const pageContext =
      typeof body.context === "string" ? body.context.trim().slice(0, 2200) : "";

    const userAllowed = await consumeAtlasRateLimit({
      userId,
      bucket: "atlas-chat",
      windowSeconds: 300,
      maxRequests: 20,
    });
    const serviceAllowed = userAllowed
      ? await consumeAtlasRateLimit({
          userId: "__ascend_global__",
          bucket: "groq-requests",
          windowSeconds: 60,
          maxRequests: 120,
        })
      : false;

    if (!userAllowed || !serviceAllowed) {
      return NextResponse.json(
        {
          error:
            "Atlas has received several requests in a short period. Wait a moment, then continue.",
        },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }

    const brand=topic.trim()||hasImage?{kind:"chat" as const}:brandResearchPlan(cleanMessage,body.awaitingBrand===true);
    async function directReply(reply:string,awaitingBrand:boolean){
      try{await persistAtlasResponse({clerkId:userId!,userMessage:cleanMessage,reply,fact:"NONE"});}catch{ /* The answer still reaches the user. */ }
      return NextResponse.json({reply,awaitingBrand,sources:[]});
    }
    if(brand.kind==="ask")return directReply(askForBrand,true);
    const inquiry = brand.kind==="chat" && !topic.trim() && !hasImage && !pageContext ? buyerInquiryReply(cleanMessage) : null;
    if(inquiry)return directReply(inquiry,false);
    const factPromise = shouldExtractPermanentMemory(cleanMessage)
      ? extractPermanentMemory(cleanMessage).catch((error) => {
          console.error("Atlas Permanent Memory Extraction Error:", error);
          return "NONE";
        })
      : Promise.resolve("NONE");

    let visualContext = "";

    if (hasImage && isValidAtlasImage(image)) {
      try {
        const visualSummary = await analyzeAtlasImage({
          image,
          userMessage: cleanMessage,
        });

        visualContext = `Uploaded image analysis:\n${visualSummary}`;
      } catch (error) {
        console.error("Atlas Image Analysis Error:", error);

        return NextResponse.json(
          {
            error:
              "Atlas could not analyze that image right now. Your text conversations are still available.",
          },
          { status: 502 }
        );
      }
    }

    const surfaceContext = [pageContext, visualContext]
      .filter(Boolean)
      .join("\n\n");

    const [research,picks]=await Promise.all([researchForReply(userId,cleanMessage,brand.kind==="search"?brand.query:topic.trim()),
      /opportunit|internship|fellowship|scholarship|grant|vacanc|job opening/i.test(cleanMessage)?getAtlasPicks(userId).catch(()=>null):Promise.resolve(undefined)]);
    if(brand.kind==="search"){
      const unavailable=noBrandEvidence(research.status,brand.subject);
      if(unavailable)return directReply(unavailable,research.status==="no_results");
    }
    const [atlasResult, fact] = await Promise.all([
      runAtlasBrain({
        clerkId: userId,
        message: cleanMessage,
        surfaceContext: surfaceContext || undefined,
        research,picks,brandSubject:brand.kind==="search"?brand.subject:undefined,
      }),
      factPromise,
    ]);

    const cited=new Set(Array.from(atlasResult.reply.matchAll(/(?:\[(\d+)\]|【(\d+)】)/g),m=>Number(m[1]??m[2])));
    const links=research.sources.map((source,i)=>({source,n:i+1})).filter(({n})=>brand.kind!=="search"||!cited.size||cited.has(n));
    const summary=research.status==='ready'?`\n\nSources retrieved ${research.checked.slice(0,10)}:\n${links.map(({source:x,n})=>`[${n}] ${x.title}${x.published?' (published '+x.published+')':''}: ${x.url}`).join('\n')}`:
      research.status==='needs_topic'?'\n\nFor a live search, enter a public topic in Research a web topic with Atlas.':research.status==='not_requested'?'':'\n\nLive research did not return usable sources for this reply.';
    const reply=atlasResult.reply+summary;
    try {
      await persistAtlasResponse({
        clerkId: userId,
        userMessage: cleanMessage,
        reply,
        fact,
      });
    } catch (persistenceError) {
      /*
       * A temporary memory-store failure must not discard a response Atlas
       * already completed successfully. Log it for operations while keeping
       * the live conversation usable for the user.
       */
      console.error("Atlas Conversation Persistence Error:", persistenceError);
    }

    return NextResponse.json({reply:research.status==='ready'?atlasResult.reply:reply,sources:links.map(({source,n})=>({title:source.title,url:source.url,n}))});
  } catch (error) {
    console.error("Atlas Chat Error:", error);

    return NextResponse.json(
      {
        error: "Atlas encountered an error.",
        reply: "I encountered a problem while thinking about that. Please try again.",
      },
      { status: 500 }
    );
  }
}
