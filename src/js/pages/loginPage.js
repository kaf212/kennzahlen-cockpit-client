import {addInfoBoxEventListener, sendServerRequest} from "../utils/serverResponseHandling.js"

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

addInfoBoxEventListener(()=>{
    document.getElementById("loginForm").reset();
})