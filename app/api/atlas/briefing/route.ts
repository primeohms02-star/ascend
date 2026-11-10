import {NextResponse} from 'next/server';
import {auth} from '@clerk/nextjs/server';
import {loadJourney} from '@/lib/guidance/journey';
import {activeStep} from '@/lib/guidance/types';
export async function GET(){const {userId}=await auth();if(!userId)return NextResponse.json({error:'Sign in required.'},{status:401});try{const j=await loadJourney(userId);return NextResponse.json({summary:j.direction,focus:j.history[0]?.event==='achieved'?'You reached this goal':activeStep(j.history)||'Choose a next step on Home',oracle:j.history[0]?.note||'Tell Atlas what you want to achieve and what is getting in the way.'},{headers:{'Cache-Control':'private, no-store'}});}catch{return NextResponse.json({error:'Briefing unavailable.'},{status:503});}}
