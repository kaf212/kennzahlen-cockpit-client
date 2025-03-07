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
    let file; // Speichert die ausgewählte Datei

    // Klick auf Drop-Bereich öffnet Datei-Explorer
    dropArea.addEventListener("click", () => fileInput.click());

    // Datei per Drag & Drop hinzufügen
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

    // Datei per Datei-Explorer hinzufügen
    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            file = fileInput.files[0];
            dropArea.innerHTML = `<p class='text-green-600'>${file.name} wurde ausgewählt</p>`;
        }
    });

    // Datei hochladen
    uploadButton.addEventListener("click", () => {
        if (file) {
            alert("Datei hochgeladen: " + file.name);
        } else {
            alert("Bitte eine Datei auswählen.");
        }
    });
});

