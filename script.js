
import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBfwZAWz_ZA8k1tMIXnZMOCZ_OKElXdZ5Y",
    authDomain: "chating-4f317.firebaseapp.com",
    projectId: "chating-4f317",
    storageBucket: "chating-4f317.firebasestorage.app",
    messagingSenderId: "774716815154",
    appId: "1:774716815154:web:b85a2dfaf455932b51892b",
    measurementId: "G-WXZ1JB32E8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;
let unsubscribe = null;

const loginPage = document.getElementById("loginPage");
const chatPage = document.getElementById("chatPage");
const messagesBox = document.getElementById("messages");


function isAllowedUser() {
  return request.auth != null &&
    request.auth.uid in [
      "3WhYWGiPqPWxSD6l13MgeS2RZZ",
      "5JRvSxFaNVhVk9"
    ];
}
// Login

window.login = async function () {
    const id = document.getElementById("userId").value.trim();
    const password = document.getElementById("password").value;

    const errorBox = document.getElementById("error");
    errorBox.textContent = "";

    if (!id || !password) {
        errorBox.textContent = "Please enter email and password.";
        return;
    }

    try {
        const result = await signInWithEmailAndPassword(
            auth,
            id,
            password
        );

        // IMPORTANT: Correct Firebase user property
        currentUser = result.user;

        console.log("LOGIN UID:", currentUser.uid);
        console.log("LOGIN EMAIL:", currentUser.email);
        console.log("AUTH STATE:", auth.currentUser !== null);

        loginPage.style.display = "none";
        chatPage.style.display = "flex";

        document.getElementById("welcomeUser").textContent =
            currentUser.email;

        loadMessages();

    } catch (error) {
        console.error("LOGIN ERROR:", error.code);
        console.error("LOGIN MESSAGE:", error.message);

        errorBox.textContent =
            error.code + ": " + error.message;
    }
};


// Load messages
function loadMessages() {
    const q = query(
        collection(db, "messages"),
        orderBy("createdAt", "asc")
    );

    unsubscribe = onSnapshot(q, (snapshot) => {
        messagesBox.innerHTML = "";

        snapshot.forEach((doc) => {
            const data = doc.data();

            const div = document.createElement("div");

            div.className = "message " +
                (data.sender === currentUser.uid
                    ? "sent" : "received");

            const messageText = document.createElement("div");
            messageText.textContent = data.text;

            const time = document.createElement("small");
            time.textContent = data.createdAt
                ? data.createdAt.toDate().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                })
                : "Sending...";

            div.append(messageText, time);
            messagesBox.appendChild(div);
        });

        messagesBox.scrollTop = messagesBox.scrollHeight;

    }, (error) => {
        console.error("Message loading error:", error);
         alert("Loading failed: " + error.code);
    });
}

// Send message
window.sendMessage = async function () {
    const input = document.getElementById("messageInput");
    const text = input.value.trim();

    if (!text || !currentUser) return;

    input.disabled = true;

    try {
        await addDoc(collection(db, "messages"), {
            sender: currentUser.uid,
            text: text,
            createdAt: serverTimestamp()
        });

        input.value = "";

    } catch (error) {
        console.error("Send error:", error);
        alert("Message could not be sent: " + error.message);

    } finally {
        input.disabled = false;
        input.focus();
    }
};

// Enter key to send
document.getElementById("messageInput")
    .addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            window.sendMessage();
        }
    });

// Logout
window.logout = async function () {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }

    await signOut(auth);

    currentUser = null;
    messagesBox.innerHTML = "";

    chatPage.style.display = "none";
    loginPage.style.display = "flex";
};

