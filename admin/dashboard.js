import { auth, db } from "./firebase.js";
import {
collection, addDoc, getDocs, updateDoc,
doc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let driversCache = [];

// LOGOUT
document.getElementById("logoutBtn").onclick = () => {
signOut(auth);
location.href="./";
};

// ADD DRIVER
document.getElementById("addDriver").onclick = async () => {
await addDoc(collection(db,"drivers"),{
name:name.value,
tag:tag.value,
role:role.value,
photo:photo.value,
notes:notes.value,
stats:{races:0,wins:0,podiums:0,points:0}
});
loadDrivers();
};

// LOAD DRIVERS
async function loadDrivers(){
const snap = await getDocs(collection(db,"drivers"));
drivers.innerHTML="";
driverSelect.innerHTML="";
driversCache=[];

snap.forEach(d=>{
const data=d.data();
driversCache.push({id:d.id,...data});

driverSelect.innerHTML+=
`<option value="${d.id}">${data.name}</option>`;

drivers.innerHTML+=`
<div class="border-b border-zinc-700 py-3 flex justify-between items-center">
<div class="flex gap-4 items-center">
<img src="${data.photo}" class="w-12 h-12 rounded-full object-cover">
<div>
<div class="font-bold">${data.name}</div>
<div class="text-sm text-zinc-400">${data.notes}</div>
<div class="text-xs">Pts:${data.stats.points} Wins:${data.stats.wins}</div>
</div>
</div>

<button onclick="deleteDriver('${d.id}')"
class="bg-red-600 px-3 py-1 rounded">
Delete
</button>
</div>`;
});

drawCharts();
}
window.deleteDriver=async id=>{
await deleteDoc(doc(db,"drivers",id));
loadDrivers();
};

// ADD RESULT
document.getElementById("addResult").onclick = async ()=>{
const id=driverSelect.value;
const pos=parseInt(position.value);
const pts=parseInt(points.value);

const driver=driversCache.find(d=>d.id===id);
let s=driver.stats;

s.races++;
s.points+=pts;
if(pos===1) s.wins++;
if(pos<=3) s.podiums++;

await updateDoc(doc(db,"drivers",id),{stats:s});
loadDrivers();
};

// EVENTS
document.getElementById("addEvent").onclick=async()=>{
await addDoc(collection(db,"events"),{
name:eventName.value,
date:eventDate.value,
notes:eventNotes.value
});
loadEvents();
};

async function loadEvents(){
const snap=await getDocs(collection(db,"events"));
eventsList.innerHTML="";
snap.forEach(e=>{
const d=e.data();
eventsList.innerHTML+=
`<div class="border-b border-zinc-700 py-2">
${d.date} — ${d.name}
</div>`;
});
}

// CHARTS
function drawCharts(){
const names=driversCache.map(d=>d.name);
const pts=driversCache.map(d=>d.stats.points);
const wins=driversCache.map(d=>d.stats.wins);

new Chart(pointsChart,{
type:"bar",
data:{labels:names,datasets:[{label:"Points",data:pts}]}
});

new Chart(winsChart,{
type:"bar",
data:{labels:names,datasets:[{label:"Wins",data:wins}]}
});
}

loadDrivers();
loadEvents();

