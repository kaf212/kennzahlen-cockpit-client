// Put authentication logic here
import {addInfoBoxEventListener, sendServerRequest} from "../utils/serverResponseHandling.js";

// Login-Redirect
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();
        let userRole = document.getElementById("userRole").value;
        if (userRole === "admin") {
            window.location.href = "admin_dashboard.html";
        } else {
            window.location.href = "user_dashboard.html";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {

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



addInfoBoxEventListener(()=>{
    document.getElementById("loginForm").reset();
})