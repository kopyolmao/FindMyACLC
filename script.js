// script.js (type="module")
/*
 Minimal client-side app:
 - Firebase init (auth, firestore, storage)
 - Auth: register/login/logout + show user
 - Browse recent found items (simple pagination)
 - Report found item (upload image limited to 2MB)
 - Chat: send to Cloudflare Worker /api/chat -> worker forwards to OpenRouter
 - Save conversation to Firestore (conversations/)
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-app-compat.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-auth-compat.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, startAfter, serverTimestamp, where } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-firestore-compat.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-storage-compat.js";

/* ---------- FIREBASE CONFIG (from supplied file) ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyBASqZ7VDxU_j6VEDN9pmhIDuDM1SU9qoI",
  authDomain: "findmyaclc.firebaseapp.com",
  projectId: "findmyaclc",
  storageBucket: "findmyaclc.firebasestorage.app",
  messagingSenderId: "351280538849",
  appId: "1:351280538849:web:7b930e2e2885b40f4083a0",
  measurementId: "G-ZH9V9KH3H2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

/* ---------- UI ELEMENTS ---------- */
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userEmailLabel = document.getElementById("userEmail");

const modalOverlay = document.getElementById("modalOverlay");
const closeModal = document.getElementById("closeModal");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const modalTitle = document.getElementById("modalTitle");
const reportFoundBtn = document.getElementById("reportFoundBtn");
const reportFormWrap = document.getElementById("reportFormWrap");

const itemsList = document.getElementById("itemsList");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const refreshBtn = document.getElementById("refreshBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const chatBubble = document.getElementById("chatBubble");
const chatWindow = document.getElementById("chatWindow");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendChat = document.getElementById("sendChat");
const minimizeChat = document.getElementById("minimizeChat");

/* ---------- State ---------- */
let currentUser = null;
let lastDocSnapshot = null;
let pageSize = 10;
let localItemsCache = []; // client-side cached items for small searches

/* ---------- AUTH UI ---------- */
loginBtn.addEventListener("click", () => openAuthModal("login"));
registerBtn.addEventListener("click", () => openAuthModal("register"));
closeModal.addEventListener("click", closeModalFn);

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

function openAuthModal(mode){
  modalOverlay.classList.remove("hidden");
  if(mode==="login"){
    modalTitle.textContent="Login";
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    reportFormWrap.classList.add("hidden");
  } else if(mode==="register"){
    modalTitle.textContent="Register";
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    reportFormWrap.classList.add("hidden");
  }
}
function closeModalFn(){ modalOverlay.classList.add("hidden"); }

/* ---------- LOGIN / REGISTER ---------- */
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const pw = document.getElementById("loginPassword").value;
  try {
    await signInWithEmailAndPassword(auth, email, pw);
    closeModalFn();
  } catch(err){
    alert("Login error: "+err.message);
  }
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("regEmail").value.trim();
  const pw = document.getElementById("regPassword").value;
  const role = document.getElementById("regRole").value || "student";
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, pw);
    // minimal user doc in firestore
    await addDoc(collection(db, "users"), {
      uid: userCred.user.uid,
      email,
      role,
      createdAt: serverTimestamp()
    });
    closeModalFn();
  } catch(err){
    alert("Register error: "+err.message);
  }
});

/* ---------- AUTH STATE ---------- */
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if(user){
    userEmailLabel.textContent = user.email;
    userEmailLabel.classList.remove("hidden");
    loginBtn.classList.add("hidden");
    registerBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
  } else {
    userEmailLabel.textContent = "";
    loginBtn.classList.remove("hidden");
    registerBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
  }
});

/* ---------- FETCH RECENT FOUND ITEMS (paginated) ---------- */
async function loadRecentItems(next = false) {
  // simple ordering by timestamp desc
  const coll = collection(db, "foundItems");
  let q = query(coll, orderBy("postedAt", "desc"), limit(pageSize));
  if(next && lastDocSnapshot) {
    q = query(coll, orderBy("postedAt", "desc"), startAfter(lastDocSnapshot), limit(pageSize));
  }
  try {
    const snap = await getDocs(q);
    const items = [];
    snap.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });
    // set lastDocSnapshot for basic paging
    lastDocSnapshot = snap.docs[snap.docs.length - 1] || lastDocSnapshot;
    renderItems(items);
    localItemsCache = items; // keep for client-side search
  } catch(err){
    console.error("Load items error:", err);
    itemsList.innerHTML = `<p class="muted">Could not load items. Try again.</p>`;
  }
}

/* ---------- RENDER ITEMS ---------- */
function renderItems(items){
  if(!items || items.length === 0){
    itemsList.innerHTML = `<p class="muted">No recent found items.</p>`;
    return;
  }
  itemsList.innerHTML = "";
  items.forEach(i => {
    const card = document.createElement("div");
    card.className = "item-card";
    const imgHtml = i.imageUrl ? `<img src="${escapeHtml(i.imageUrl)}" alt="${escapeHtml(i.title)}" />` : "";
    card.innerHTML = `
      ${imgHtml}
      <h4>${escapeHtml(i.title)}</h4>
      <p>${escapeHtml(i.publicDescription || "")}</p>
      <div class="item-meta">Location: ${escapeHtml(i.location || "Unknown")} · Found: ${i.dateFound || "—"}</div>
      <div class="item-meta">Posted: ${i.postedAt ? new Date(i.postedAt.seconds * 1000).toLocaleString() : "—"}</div>
      <div style="margin-top:8px"><button class="btn ghost view-btn" data-id="${i.id}">View / Claim</button></div>
    `;
    itemsList.appendChild(card);
  });
}

/* ---------- EVENT: Search & Refresh ---------- */
searchBtn.addEventListener("click", () => {
  const q = searchInput.value.trim().toLowerCase();
  if(!q) return loadRecentItems(false);
  // client-side small filter to save reads
  const filtered = localItemsCache.filter(it => {
    const hay = `${it.title} ${it.publicDescription} ${it.location}`.toLowerCase();
    return hay.includes(q);
  });
  renderItems(filtered);
});

refreshBtn.addEventListener("click", () => {
  lastDocSnapshot = null;
  loadRecentItems(false);
});

prevBtn.addEventListener("click", () => {
  // For simplicity, prev is not implemented full; indicate disabled
  alert("Previous page not implemented in this demo. Use Refresh or Next.");
});

nextBtn.addEventListener("click", () => {
  loadRecentItems(true);
});

/* ---------- REPORT FOUND UI ---------- */
reportFoundBtn.addEventListener("click", () => {
  if(!currentUser){
    openAuthModal("login");
    return;
  }
  modalOverlay.classList.remove("hidden");
  loginForm.classList.add("hidden");
  registerForm.classList.add("hidden");
  reportFormWrap.classList.remove("hidden");
});

const reportForm = document.getElementById("reportForm");
reportForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if(!currentUser) { alert("Please login to report."); return; }

  const title = document.getElementById("itemTitle").value.trim();
  const desc = document.getElementById("itemDesc").value.trim();
  const location = document.getElementById("itemLocation").value.trim();
  const dateFound = document.getElementById("dateFound").value;
  const fileInput = document.getElementById("itemImage");
  const file = fileInput.files?.[0];

  try {
    let imageUrl = "";
    if(file){
      if(file.size > 2 * 1024 * 1024) { alert("Image must be <= 2MB"); return; }
      const path = `foundItems/${Date.now()}_${file.name}`;
      const stRef = storageRef(storage, path);
      await uploadBytes(stRef, file);
      imageUrl = await getDownloadURL(stRef);
    }

    await addDoc(collection(db, "foundItems"), {
      title,
      publicDescription: desc,
      location,
      dateFound,
      imageUrl,
      postedBy: currentUser.uid,
      postedAt: serverTimestamp(),
      isClaimed: false
    });

    alert("Report submitted. Staff will review the item.");
    closeModalFn();
    loadRecentItems(false);

  } catch(err){
    console.error("Report error:", err);
    alert("Failed to submit report: " + err.message);
  }
});

/* ---------- CHAT: Client -> Worker -> OpenRouter ---------- */
chatBubble.addEventListener("click", () => {
  chatWindow.classList.toggle("hidden");
});
minimizeChat.addEventListener("click", () => {
  chatWindow.classList.add("hidden");
});

sendChat.addEventListener("click", () => handleSendChat());
chatInput.addEventListener("keypress", (e) => { if(e.key === "Enter") handleSendChat(); });

let conversationId = null;
let isChatting = false;

async function handleSendChat(){
  const text = chatInput.value.trim();
  if(!text) return;
  displayChatMessage(text, "user");
  chatInput.value = "";
  // create conversation record if not exist
  if(!conversationId){
    const convRef = await addDoc(collection(db, "conversations"), {
      userId: currentUser ? currentUser.uid : null,
      userRole: null,
      startedAt: serverTimestamp(),
      messages: [],
      resolved: false
    });
    conversationId = convRef.id;
  }
  // save user message
  await addMessageToConversation(conversationId, { sender: "user", content: text });

  // show typing
  displayTyping(true);

  try {
    // Send to worker endpoint (no API key exposed)
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: text,
        meta: {
          // minimal meta; worker will apply system prompt
          userId: currentUser ? currentUser.uid : null
        }
      })
    });

    const data = await res.json();
    const reply = data.reply || "Sorry, I couldn't respond right now.";

    displayTyping(false);
    displayChatMessage(reply, "ai");

    await addMessageToConversation(conversationId, { sender: "ai", content: reply });

  } catch(err){
    displayTyping(false);
    displayChatMessage("⚠️ Connection error.", "ai");
    console.error("Chat error:", err);
  }
}

function displayChatMessage(text, type){
  const div = document.createElement("div");
  div.className = "chat-msg " + (type === "user" ? "user" : "ai");
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function displayTyping(on){
  if(on){
    const el = document.createElement("div");
    el.className = "typing-indicator";
    el.id = "typingIndicator";
    el.innerHTML = `<span>...</span>`;
    chatMessages.appendChild(el);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } else {
    const el = document.getElementById("typingIndicator");
    if(el) el.remove();
  }
}

async function addMessageToConversation(convId, message){
  // push message locally to messages array — simple append by fetching and updating doc.
  // For brevity: perform a naive addDoc to a subcollection "messages" to avoid large document writes.
  try {
    await addDoc(collection(db, `conversations/${convId}/messages`), {
      ...message,
      timestamp: serverTimestamp()
    });
  } catch(err){
    console.error("Save message error:", err);
  }
}

/* ---------- UTIL ---------- */
function escapeHtml(s){ if(!s) return ""; return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;"); }

/* ---------- INITIAL LOAD ---------- */
document.addEventListener("DOMContentLoaded", () => {
  loadRecentItems(false);
});
