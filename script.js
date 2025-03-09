document.getElementById("tab-graph").addEventListener("click", function() {
    document.getElementById("graph-section").classList.remove("hidden");
    document.getElementById("table-section").classList.add("hidden");

    this.classList.add("active-tab");
    document.getElementById("tab-table").classList.remove("active-tab");
});

document.getElementById("tab-table").addEventListener("click", function() {
    document.getElementById("table-section").classList.remove("hidden");
    document.getElementById("graph-section").classList.add("hidden");

    this.classList.add("active-tab");
    document.getElementById("tab-graph").classList.remove("active-tab");
});

document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Verhindert Neuladen der Seite

    let userRole = document.getElementById("userRole").value;

    if (userRole === "admin") {
        window.location.href = "admin_dashboard.html";
    } else {
        window.location.href = "user_dashboard.html";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const dropArea = document.getElementById("drop-area");
    const fileInput = document.getElementById("file-input");
    const uploadButton = document.getElementById("upload-file");
    let file;

    dropArea.addEventListener("click", () => fileInput.click());

    dropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropArea.classList.add("active");
    });

    dropArea.addEventListener("dragleave", () => {
        dropArea.classList.remove("active");
    });

    dropArea.addEventListener("drop", (e) => {
        e.preventDefault();
        dropArea.classList.remove("active");

        if (e.dataTransfer.files.length > 0) {
            file = e.dataTransfer.files[0];
            dropArea.innerHTML = `<p class='text-green-600'>${file.name} wurde ausgewählt</p>`;
        }
    });

    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            file = fileInput.files[0];
            dropArea.innerHTML = `<p class='text-green-600'>${file.name} wurde ausgewählt</p>`;
        }
    });

    uploadButton.addEventListener("click", () => {
        if (file) {
            alert("Datei hochgeladen: " + file.name);
        } else {
            alert("Bitte eine Datei auswählen.");
        }
    });
});


function showTab(tab) {
    // Alle Tabs verstecken
    document.getElementById("graph-section").classList.add("hidden");
    document.getElementById("table-section").classList.add("hidden");

    // Ausgewählten Tab anzeigen
    document.getElementById(tab + "-section").classList.remove("hidden");

    document.querySelectorAll(".tab-button").forEach(button => {
        button.classList.remove("border-gray-800");
        button.classList.add("border-transparent");
    });

    document.getElementById("tab-" + tab).classList.add("border-gray-800");
    document.getElementById("tab-" + tab).classList.remove("border-transparent");
}
