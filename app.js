import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";
const supabase=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const $=id=>document.getElementById(id);let user=null,rows=[],tasks=[],work=50,rest=10,left=3000,started=null,interval=null,slips=0,breakMode=false;
const day=()=>new Date().toLocaleDateString("en-CA");
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function clock(){ $("clock").textContent=String(Math.floor(left/60)).padStart(2,"0")+":"+String(left%60).padStart(2,"0");}
function stop(){clearInterval(interval);interval=null;$("start").textContent="Resume";}
function tick(){if(left>0){left--;clock()}else{stop();$("hint").textContent="Block complete. Take a break, then log the session.";}}
function showApp(on){["appCard","dashboard","analytics"].forEach(id=>$(id).classList.toggle("hide",!on));$("authCard").classList.toggle("hide",on);}
async function load(){let a=await supabase.from("study_sessions").select("*").order("created_at",{ascending:false}).limit(300);if(a.error){alert(a.error.message);return}rows=a.data||[];let b=await supabase.from("study_tasks").select("*").order("created_at");if(b.error){alert(b.error.message);return}tasks=b.data||[];render();}
function render(){let today=rows.filter(x=>x.study_date===day()),m=today.reduce((s,x)=>s+x.minutes,0),goal=Math.max(1,+$("goal").value||6);
$("hours").textContent=m>=60?(m/60).toFixed(1)+"h":m+"m";$("count").textContent=today.length;$("slips").textContent=today.reduce((s,x)=>s+x.slips,0);$("avg").textContent=today.length?(today.reduce((s,x)=>s+x.rating,0)/today.length).toFixed(1):"—";
$("goalbar").style.width=Math.min(100,m/(goal*60)*100)+"%";$("goaltext").textContent=(m/60).toFixed(1)+" of "+goal+" hours";
$("tasks").innerHTML=tasks.map(t=>`<div class="task ${t.done?"done":""}"><input type="checkbox" data-task="${t.id}" ${t.done?"checked":""}><span>${esc(t.title)}</span><button data-del="${t.id}">×</button></div>`).join("")||'<p class="notice">Add 2–4 realistic tasks for today.</p>';
$("subjects").innerHTML=Object.entries(today.reduce((o,x)=>(o[x.subject]=(o[x.subject]||0)+x.minutes,o),{})).sort((a,b)=>b[1]-a[1]).map(([n,v])=>`<div class="bar"><label>${esc(n)}</label><div class="progress"><span style="width:${v/Math.max(...today.map(x=>x.minutes))*100}%"></span></div><b>${v}m</b></div>`).join("")||"No sessions yet.";
$("history").innerHTML=rows.slice(0,12).map(x=>`<div class="history"><b>${esc(x.subject)}</b> · ${x.minutes} min · focus ${x.rating}/5<br><small>${esc(x.topic)} · ${x.study_date}</small></div>`).join("")||"No saved sessions yet.";
}
$("sendLink").onclick=async()=>{let email=$("email").value.trim();if(!email){$("authMsg").textContent="Enter your email address.";return}let {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:new URL("./", location.href).href}});$("authMsg").textContent=error?error.message:"Sign-in link sent. Open the email on this device to sign in.";};
$("logout").onclick=()=>supabase.auth.signOut();
supabase.auth.onAuthStateChange(async(_event,session)=>{user=session?.user||null;showApp(!!user);if(user)await load();});
let {data:{session}}=await supabase.auth.getSession();user=session?.user||null;showApp(!!user);if(user)await load();
document.querySelectorAll("[data-w]").forEach(b=>b.onclick=()=>{stop();work=+b.dataset.w;rest=+b.dataset.b;left=work*60;breakMode=false;$("mode").textContent="FOCUS SESSION";document.querySelectorAll("[data-w]").forEach(x=>x.classList.toggle("active",x===b));clock()});
$("start").onclick=()=>{if(interval){stop();return}if(!started)started=Date.now();$("start").textContent="Pause";interval=setInterval(tick,1000)};
$("reset").onclick=()=>{stop();left=(breakMode?rest:work)*60;started=null;clock()};
$("distract").onclick=()=>{slips++;$("hint").textContent="Distraction slip recorded. Put the phone away and return to the exact line you left."};
$("break").onclick=()=>{stop();breakMode=!breakMode;left=(breakMode?rest:work)*60;$("mode").textContent=breakMode?"BREAK":"FOCUS SESSION";started=null;clock()};
$("log").onclick=async()=>{let elapsed=started?Math.max(1,Math.round((Date.now()-started)/60000)):Math.max(0,Math.round((work*60-left)/60));if(interval)stop();if(!elapsed){alert("Start the timer before logging.");return}let {error}=await supabase.from("study_sessions").insert({user_id:user.id,study_date:day(),subject:$("subject").value,topic:$("topic").value||"Unspecified topic",minutes:Math.min(elapsed,work+5),rating:+$("rating").value,slips});if(error){alert(error.message);return}slips=0;started=null;left=work*60;breakMode=false;$("mode").textContent="FOCUS SESSION";clock();$("hint").textContent="Saved to your cloud account. Do a quick recall before the next block.";await load()};
$("addtask").onclick=async()=>{let title=$("newtask").value.trim();if(!title)return;let {error}=await supabase.from("study_tasks").insert({user_id:user.id,title});if(error)alert(error.message);else{$("newtask").value="";await load()}};
$("newtask").onkeydown=e=>{if(e.key==="Enter")$("addtask").click()};
$("tasks").onclick=async e=>{let id=e.target.dataset.task||e.target.dataset.del;if(!id)return;if(e.target.dataset.del){await supabase.from("study_tasks").delete().eq("id",id)}else{await supabase.from("study_tasks").update({done:e.target.checked}).eq("id",id)}await load()};
$("goal").onchange=render;
$("export").onclick=()=>{let csv=[["date","subject","topic","minutes","rating","slips"],...rows.map(x=>[x.study_date,x.subject,x.topic,x.minutes,x.rating,x.slips])].map(r=>r.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\n");let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="mbbs-study-log.csv";a.click();URL.revokeObjectURL(a.href)};
clock();
if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});
