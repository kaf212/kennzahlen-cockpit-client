// Put authentication logic here
import {addInfoBoxEventListener, sendServerRequest} from "../utils/serverResponseHandling";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const role = document.getElementById("role").value;
            const password = document.getElementById("pass").value;

            console.log("Login versendet:", role, password);

            const jsonData = await sendServerRequest("POST", "http://localhost:5000/auth/login", {role, password}, false)


            if (jsonData.hasOwnProperty("token")) {
                sessionStorage.setItem("token", jsonData.token);
                window.location.href = "index.html";
            }
        });
    }

    if (!window.location.pathname.endsWith("login.html")) { // Redirect to login except user is already on login page
        const token = sessionStorage.getItem("token");

        if (!token) {
            window.location.href = "login.html";
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));

            if (Date.now() >= payload.exp * 1000) {
                alert("Session abgelaufen");
                sessionStorage.removeItem("token");
                window.location.href = "login.html";
            }
        } catch {
            sessionStorage.removeItem("token");
            window.location.href = "login.html";
        }
    }
});

function logout() {
    sessionStorage.removeItem("token");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("logoutButton").addEventListener("click", logout);
})

addInfoBoxEventListener(()=>{
    document.getElementById("loginForm").reset();
})