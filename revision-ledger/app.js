
(function(){
'use strict';
const KEY='solo_tools_revision_v1'; const $=id=>document.getElementById(id);
const defaults=()=>({project:'',client:'',currency:'USD',rate:50,fee:1000,rounds:2,scope:'',entries:[]});
let state=defaults();
const allowed=['included','extra','approved','paid'];
const maxLen=(x,n)=>String(x??'').slice(0,n);
const cleanNum=(x,max)=>{const n=Number(x);return Number.isFinite(n)&&n>=0&&n<=max?n:0};
const money=(v)=>{try{return new Intl.NumberFormat('en-US',{style:'currency',currency:state.currency,maximumFractionDigits:state.currency==='VND'?0:2}).format(v)}catch{return String(v)}};
function toast(msg){const el=$('toast');el.textContent=msg;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>{el.hidden=true},3400);}
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(x&&typeof x==='object'){state=sanitize(x);}}catch(e){toast('Could not load browser data.');}}
function sanitize(x){
const out=defaults();out.project=maxLen(x.project,100);out.client=maxLen(x.client,80);
out.currency=['USD','EUR','GBP','AUD','VND'].includes(x.currency)?x.currency:'USD';
out.rate=cleanNum(x.rate,1e8);out.fee=cleanNum(x.fee,1e11);out.rounds=Math.floor(cleanNum(x.rounds,1000));out.scope=maxLen(x.scope,2500);
out.entries=(Array.isArray(x.entries)?x.entries:[]).slice(0,3000).map(e=>({
id:maxLen(e.id,50),date:/^\d{4}-\d{2}-\d{2}$/.test(e.date)?e.date:new Date().toISOString().slice(0,10),
description:maxLen(e.description,600),status:allowed.includes(e.status)?e.status:'included',hours:cleanNum(e.hours,10000),
amount:cleanNum(e.amount,1e11),evidence:maxLen(e.evidence,250)
})).filter(e=>e.id&&e.description);return out;
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));$('saved').textContent='Saved on this device';}catch(e){$('saved').textContent='Storage full — export backup';toast('Unable to save locally; export your project now.');}}
function el(tag,text,attrs){const x=document.createElement(tag);if(text!==undefined)x.textContent=text;if(attrs)for(const [k,v] of Object.entries(attrs))x.setAttribute(k,v);return x;}
function readProject(){for(const id of ['project','client','currency','scope'])state[id]=$(id).value.trim();state.rate=cleanNum($('rate').value,1e8);state.fee=cleanNum($('fee').value,1e11);state.rounds=Math.floor(cleanNum($('rounds').value,1000));save();render();}
function render(){
['project','client','currency','rate','fee','rounds','scope'].forEach(id=>{if(document.activeElement!==$(id))$(id).value=state[id]});
const e=state.entries;const extra=e.filter(r=>r.status==='extra'||r.status==='approved').reduce((a,r)=>a+r.amount,0);
const paid=e.filter(r=>r.status==='paid').reduce((a,r)=>a+r.amount,0);
$('totalCount').textContent=e.length;$('extraTotal').textContent=money(extra);$('paidTotal').textContent=money(paid);
$('entriesLabel').textContent=e.length+' entries';const body=$('items');body.replaceChildren();
if(e.length===0){const row=el('tr');const cell=el('td','No revisions yet. Add the first one above.',{colspan:'5',class:'empty'});row.append(cell);body.append(row);return;}
e.slice().sort((a,b)=>b.date.localeCompare(a.date)).forEach((r)=>{
const row=el('tr');const first=el('td');first.append(el('div',r.date,{class:'smallfoot'}),el('strong',r.description));
if(r.evidence)first.append(el('div','Ref: '+r.evidence,{class:'smallfoot'}));row.append(first);
const opt=el('select',undefined,{'aria-label':'Classification for '+r.description,class:'no-print'});
[['included','Included'],['extra','Potential extra'],['approved','Approved extra'],['paid','Paid extra']].forEach(([v,l])=>{const o=el('option',l,{value:v});if(r.status===v)o.selected=true;opt.append(o)});
opt.addEventListener('change',()=>{r.status=opt.value;save();render()});const statusCell=el('td');statusCell.append(opt,el('span',r.status.replace('extra','extra'),{class:'print-only'}));row.append(statusCell);
row.append(el('td',String(r.hours)),el('td',r.status==='included'?'Included':money(r.amount)));
const action=el('td',undefined,{class:'no-print'});const del=el('button','Delete',{class:'btn small danger',type:'button'});del.addEventListener('click',()=>{if(confirm('Delete this revision?')){state.entries=state.entries.filter(x=>x.id!==r.id);save();render();}});action.append(del);row.append(action);body.append(row);
});
}
function download(name,text,type){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);}
function csvValue(x){const s=String(x??'');return '"'+s.replace(/"/g,'""')+'"';}
$('projectForm').addEventListener('input',readProject);$('projectForm').addEventListener('change',readProject);
$('revisionForm').addEventListener('submit',event=>{
event.preventDefault();readProject();
const date=$('date').value;const description=$('description').value.trim();const hours=Number($('hours').value);const val=$('value').value.trim();
if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||description.length<3||!Number.isFinite(hours)||hours<0||hours>10000){toast('Check the date, description and hours.');return;}
let amount=val===''?Math.round(hours*state.rate*100)/100:Number(val);
if(!Number.isFinite(amount)||amount<0||amount>1e11){toast('Please enter a valid non-negative amount.');return;}
state.entries.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,8),date,description:maxLen(description,600),status:$('status').value,hours,amount,evidence:maxLen($('evidence').value.trim(),250)});
save();render();$('description').value='';$('evidence').value='';$('value').value='';$('hours').value='1';toast('Revision saved on your device.');
});
$('csv').addEventListener('click',()=>{
const head=['Project','Client','Currency','Original fee','Included rounds','Scope','Date','Description','Classification','Extra hours','Estimated amount','Reference'];
const rows=state.entries.map(r=>[state.project,state.client,state.currency,state.fee,state.rounds,state.scope,r.date,r.description,r.status,r.hours,r.status==='included'?0:r.amount,r.evidence]);
download('revision-ledger.csv',[head,...rows].map(row=>row.map(csvValue).join(',')).join('\r\n'),'text/csv;charset=utf-8');
});
$('json').addEventListener('click',()=>download('revision-ledger-backup.json',JSON.stringify({schema:1,exportedAt:new Date().toISOString(),data:state},null,2),'application/json'));
$('import').addEventListener('change',async event=>{
const file=event.target.files[0];if(!file)return;
if(file.size>1048576){toast('JSON file is too large (max 1MB).');return;}
try{const o=JSON.parse(await file.text());if(o.schema!==1||!o.data||!Array.isArray(o.data.entries))throw Error('Invalid backup');
if(!confirm('Replace current local project with imported backup?'))return;state=sanitize(o.data);save();render();toast('Backup imported.');}
catch(e){toast('Cannot import: file is not a valid Revision Ledger backup.');}finally{event.target.value='';}
});
$('print').addEventListener('click',()=>window.print());
$('clear').addEventListener('click',()=>{if(confirm('Permanently delete all local Revision Ledger data on this device? Export a backup first.')){state=defaults();localStorage.removeItem(KEY);render();toast('Local data cleared.');}});
$('mail').addEventListener('click',()=>{
const extras=state.entries.filter(e=>e.status==='extra'||e.status==='approved');
const details=extras.map(e=>e.date+': '+e.description+' — '+money(e.amount)+' ('+e.status+')').join('\n');
const total=extras.reduce((s,e)=>s+e.amount,0);
const subject='Revision summary — '+(state.project||'Project');
const body='Hi'+(state.client?' '+state.client:'')+',\n\nHere is a summary of potential additional work on '+(state.project||'our project')+'. Please review and confirm any billable changes before invoicing.\n\n'+(details||'No potential extra items recorded.')+'\n\nEstimated total for review: '+money(total)+'\n\nThanks!';
window.location.href='mailto:?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
});
$('date').value=new Date().toLocaleDateString('en-CA');load();render();
})();
