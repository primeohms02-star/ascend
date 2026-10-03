"use client";
import { useState } from "react";
export default function SharePortfolio({id,token}:{id:string;token:string|null}) {
  const [shareToken,setShareToken]=useState(token);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  async function change(share:boolean) {
    if(share&&!window.confirm("Anyone with the link can read this entry's title, reflection, skills and full deliverable text. Check the preview for personal information and private links before sharing. Continue?"))return;
    setBusy(true);setMessage("");
    try {
      const response=await fetch(`/api/projects/evidence/${id}/sharing`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({share})});
      const result=await response.json();if(!response.ok)throw new Error(result.error);
      setShareToken(result.share_token);setMessage(share?"Sharing enabled. Copy your link below.":"Sharing disabled. The old link no longer opens this entry.");
    }catch(error){setMessage(error instanceof Error?error.message:"Unable to update sharing.");}finally{setBusy(false);}
  }
  return <div className="mt-4 border-t border-white/10 pt-4"><p className="text-xs text-slate-400">{shareToken?"Anyone with the link can view":"Private — only you and authorised reviewers"}</p><button disabled={busy} onClick={()=>change(!shareToken)} className="mt-2 rounded-lg border border-cyan-300/20 px-3 py-2 text-xs text-cyan-200">{busy?"Updating…":shareToken?"Stop sharing":"Create share link"}</button>{shareToken&&<button className="ml-2 text-xs text-cyan-200" onClick={async()=>{try{await navigator.clipboard.writeText(`${window.location.origin}/projects/share/${shareToken}`);setMessage("Link copied.");}catch{setMessage(`Copy this link: ${window.location.origin}/projects/share/${shareToken}`);}}}>Copy link</button>}{shareToken&&<a className="ml-2 text-xs text-cyan-200" target="_blank" rel="noreferrer" href={`/projects/share/${shareToken}`}>Preview shared page</a>}{message&&<p role="status" className="mt-2 break-all text-xs text-slate-300">{message}</p>}</div>;
}
