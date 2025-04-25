import {addInfoBoxEventListener, sendServerRequest} from "../utils/serverResponseHandling.js"

const form = document.getElementById("loginForm");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const role = document.getElementById("role").value;
        const password = document.getElementById("pass").value;

        console.log("Login versendet:", role, password);

        const jsonData = await sendServerRequest("POST", "/api/auth/login", {role, password}, false)


        if (jsonData.hasOwnProperty("token")) {
            sessionStorage.setItem("token", jsonData.token);

            /* If the user has been on a different page when the login prompt was triggered, he will be sent back
            to his last location (referrer). If not, he will be sent to index.html.
            Source: https://chatgpt.com/share/6807b56d-66e4-8011-aaeb-5d074c8b0489 */
            if (window.history.length <= 1) {
                window.location = "index.html";
            } else {
                window.location = document.referrer
            }
        }
    });
}

addInfoBoxEventListener(()=>{
    document.getElementById("loginForm").reset();
})