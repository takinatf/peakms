import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const msgEl = document.getElementById("msg");

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");

function setMsg(text, good = false) {
  msgEl.textContent = text;
  msgEl.className = "text-sm text-center mt-4 " + (good ? "text-green-400" : "text-red-400");
}

async function isAdmin(email) {
  // admins/{email}
  const ref = doc(db, "admins", email.toLowerCase());
  const snap = await getDoc(ref);
  return snap.exists();
}

loginBtn.addEventListener("click", async () => {
  const email = emailEl.value.trim().toLowerCase();
  const password = passEl.value.trim();

  if (!email || !password) return setMsg("Enter your email and password.");

  try {
    await signInWithEmailAndPassword(auth, email, password);

    const ok = await isAdmin(email);
    if (!ok) {
      setMsg("You are not approved as an admin.");
      return;
    }

    window.location.href = "./dashboard.html";
  } catch (err) {
    setMsg(err.message);
  }
});

signupBtn.addEventListener("click", async () => {
  const email = emailEl.value.trim().toLowerCase();
  const password = passEl.value.trim();

  if (!email || !password) return setMsg("Enter your email and password.");

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    setMsg("Account created. Waiting for admin approval.", true);
  } catch (err) {
    setMsg(err.message);
  }
});
