
(function(){
'use strict';const KEY='solo_tools_tenball_v1';const $=id=>document.getElementById(id);let sessions=[];
const str=(x,n)=>String(x??'').slice(0,n);
const num=(x)=>{const n=Number(x);return Number.isInteger(n)&&n>=0&&n<=999?n:0;};
const validDate=d=>/^\d{4}-\d{2}-\d{2}$/.test(d);
function toast(msg){const el=$('toast');el.textContent=msg;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>el.hidden=true,3000);}
function save(){try{localStorage.setItem(KEY,JSON.stringify(sessions));}catch(e){toast('Storage full. Export a backup.');}}
function load(){try{const o=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(o))sessions=o.slice(0,4000).map(s=>({id:str(s.id,50),date:validDate(s.date)?s.date:'',drill:['Ghost — 10-ball','Break practice','Position play','Other'].includes(s.drill)?s.drill:'Other',wins:num(s.wins),losses:num(s.losses),breaks:num(s.breaks),attempts:num(s.attempts),notes:str(s.notes,500)})).filter(s=>s.id&&s.date&&s.breaks<=s.attempts);}catch(e){toast('Could not read saved data.');}}
function el(tag,text,attrs){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(attrs)for(const [k,v] of Object.entries(attrs))node.setAttribute(k,v);return node;}
function percent(a,b){return b?Math.round((100*a/b)*10)/10+'%':'—'}
function render(){
const wins=sessions.reduce((t,s)=>t+s.wins,0),racks=sessions.reduce((t,s)=>t+s.wins+s.losses,0);
const breaks=sessions.reduce((t,s)=>t+s.breaks,0),attempts=sessions.reduce((t,s)=>t+s.attempts,0);
$('count').textContent=sessions.length;$('winRate').textContent=percent(wins,racks);$('breakRate').textContent=percent(breaks,attempts);
$('days').textContent=new Set(sessions.map(s=>s.date)).size;$('entriesLabel').textContent=sessions.length+' sessions';
const sorted=sessions.slice().sort((a,b)=>b.date.localeCompare(a.date));
const last=sorted.slice(0,5),before=sorted.slice(5,10);
const rate=list=>{let w=0,t=0;list.forEach(s=>{w+=s.wins;t+=s.wins+s.losses});return t?100*w/t:null;};
const r1=rate(last),r2=rate(before);
$('trend').textContent=sorted.length<2?'Keep logging sessions to build a trend.':r1===null?'No ghost racks logged in recent sessions.':r2===null?'Most recent '+last.length+' sessions: '+r1.toFixed(1)+'% ghost rack win rate.': 'Most recent '+last.length+' sessions: '+r1.toFixed(1)+'% vs previous '+before.length+': '+r2.toFixed(1)+'% ('+(r1-r2>=0?'+':'')+(r1-r2).toFixed(1)+' percentage points).';
const tbody=$('rows');tbody.replaceChildren();
if(!sorted.length){const tr=el('tr');tr.append(el('td','No sessions yet. Log your first practice.',{colspan:'5',class:'empty'}));tbody.append(tr);return;}
sorted.forEach(s=>{
const tr=el('tr');const first=el('td');first.append(el('strong',s.date),el('div',s.drill,{class:'smallfoot'}));tr.append(first);
tr.append(el('td',s.wins+' W / '+s.losses+' L'),el('td',s.breaks+' / '+s.attempts),el('td',s.notes||'—'));
const last=el('td',undefined,{class:'no-print'});const b=el('button','Delete',{type:'button',class:'btn small danger'});b.addEventListener('click',()=>{if(confirm('Delete this session?')){sessions=sessions.filter(x=>x.id!==s.id);save();render();}});last.append(b);tr.append(last);tbody.append(tr);
});
}
function download(name,text,type){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);}
const csv=s=>'"'+String(s??'').replace(/"/g,'""')+'"';
$('sessionForm').addEventListener('submit',e=>{
e.preventDefault();const date=$('date').value,wins=Number($('wins').value),losses=Number($('losses').value),breaks=Number($('breaks').value),attempts=Number($('attempts').value);
if(!validDate(date)||![wins,losses,breaks,attempts].every(x=>Number.isInteger(x)&&x>=0&&x<=999)||breaks>attempts){toast('Check date, rack numbers and successful breaks (cannot exceed attempts).');return;}
if(wins+losses===0&&attempts===0){toast('Record at least one rack or break attempt.');return;}
sessions.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,8),date,drill:$('drill').value,wins,losses,breaks,attempts,notes:str($('notes').value.trim(),500)});
save();render();$('notes').value='';toast('Session saved on your device.');
});
$('csv').addEventListener('click',()=>{const rows=[['Date','Drill','Racks won','Racks lost','Successful breaks','Break attempts','Notes'],...sessions.map(s=>[s.date,s.drill,s.wins,s.losses,s.breaks,s.attempts,s.notes])];download('ten-ball-practice.csv',rows.map(r=>r.map(csv).join(',')).join('\r\n'),'text/csv;charset=utf-8');});
$('backup').addEventListener('click',()=>download('ten-ball-backup.json',JSON.stringify({schema:1,exportedAt:new Date().toISOString(),sessions},null,2),'application/json'));
$('import').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;if(file.size>1048576){toast('File too large (1 MB limit).');return;}
try{const o=JSON.parse(await file.text());if(o.schema!==1||!Array.isArray(o.sessions))throw Error('Invalid file');if(!confirm('Replace ALL local sessions with imported backup?'))return;sessions=o.sessions.slice(0,4000).map(s=>({id:str(s.id,50),date:validDate(s.date)?s.date:'',drill:['Ghost — 10-ball','Break practice','Position play','Other'].includes(s.drill)?s.drill:'Other',wins:num(s.wins),losses:num(s.losses),breaks:num(s.breaks),attempts:num(s.attempts),notes:str(s.notes,500)})).filter(s=>s.id&&s.date&&s.breaks<=s.attempts);save();render();toast('Backup imported.');}catch(err){toast('Invalid 10-Ball backup.');}finally{e.target.value='';}
});
$('clear').addEventListener('click',()=>{if(confirm('Permanently delete local 10-Ball records? Export a backup first.')){sessions=[];localStorage.removeItem(KEY);render();toast('Sessions cleared.');}});
$('print').addEventListener('click',()=>window.print());
$('date').value=new Date().toISOString().slice(0,10);load();render();
})();