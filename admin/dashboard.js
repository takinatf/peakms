import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const userEmailEl = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

const driverCountEl = document.getElementById("driverCount");
const resultCountEl = document.getElementById("resultCount");
const reportCountEl = document.getElementById("reportCount");

const driverName = document.getElementById("driverName");
const driverTag = document.getElementById("driverTag");
const driverRole = document.getElementById("driverRole");
const addDriverBtn = document.getElementById("addDriverBtn");
const driverMsg = document.getElementById("driverMsg");

const driversTable = document.getElementById("driversTable");
const refreshBtn = document.getElementById("refreshBtn");

function setDriverMsg(text, good = false) {
  driverMsg.textContent = text;
  driverMsg.className = "text-sm mt-3 " + (good ? "text-green-400" : "text-red-400");
}

async function isAdmin(email) {
  const ref = doc(db, "admins", email.toLowerCase());
  const snap = await getDoc(ref);
  return snap.exists();
}

async function loadDrivers() {
  driversTable.innerHTML = "";

  const snap = await getDocs(collection(db, "drivers"));
  driverCountEl.textContent = snap.size;

  snap.forEach((d) => {
    const data = d.data();

    const tr = document.createElement("tr");
    tr.className = "border-b border-zinc-800";

    tr.innerHTML = `
      <td class="py-3">${data.name || ""}</td>
      <td class="py-3 text-zinc-300">${data.tag || ""}</td>
      <td class="py-3 text-zinc-300">${data.role || ""}</td>
      <td class="py-3 text-right">
        <button data-id="${d.id}" class="delBtn px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 transition">
          Delete
        </button>
      </td>
    `;

    driversTable.appendChild(tr);
  });

  // Placeholder counts for later
  resultCountEl.textContent = "0";
  reportCountEl.textContent = "0";

  document.querySelectorAll(".delBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await deleteDoc(doc(db, "drivers", id));
      loadDrivers();
    });
  });
}

addDriverBtn.addEventListener("click", async () => {
  const name = driverName.value.trim();
  const tag = driverTag.value.trim();
  const role = driverRole.value.trim();

  if (!name) return setDriverMsg("Driver name is required.");

  try {
    await addDoc(collection(db, "drivers"), {
      name,
      tag,
      role,
      createdAt: Date.now()
    });

    driverName.value = "";
    driverTag.value = "";
    driverRole.value = "";

    setDriverMsg("Driver saved!", true);
    loadDrivers();
  } catch (err) {
    setDriverMsg(err.message);
  }
});

refreshBtn.addEventListener("click", loadDrivers);

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "./login.html";
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  const ok = await isAdmin(user.email);
  if (!ok) {
    alert("Not approved as admin.");
    await signOut(auth);
    window.location.href = "./login.html";
    return;
  }

  userEmailEl.textContent = user.email;
  loadDrivers();
});
