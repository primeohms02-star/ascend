// Diagnostic for the local Next production environment. Never print the key or raw provider response.
(async()=>{
 const {default: nextEnv} = await import('@next/env');
 nextEnv.loadEnvConfig(process.cwd(),false,{info(){},error(){}}); const key=process.env.TAVILY_API_KEY?.trim();
 if(!key){console.log('Atlas search: KEY MISSING');return;}
 try{
 const response=await fetch('https://api.tavily.com/search',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},signal:AbortSignal.timeout(8000),body:JSON.stringify({query:'Fendi official website products sales channels',search_depth:'basic',max_results:2,include_answer:false,include_raw_content:false,include_published_date:true,safe_search:true})});
 if(!response.ok){console.log('Atlas search: provider returned HTTP '+response.status);return;}
 const data=await response.json();console.log(Array.isArray(data.results)?'Atlas search: HTTP 200, '+data.results.length+' results':'Atlas search: HTTP 200, unexpected response format');
 }catch(e){console.log('Atlas search: '+(e?.name==='TimeoutError'?'request timed out':'network or response error'));}
})();
