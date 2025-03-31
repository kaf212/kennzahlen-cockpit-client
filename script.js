document.addEventListener("DOMContentLoaded", function () {
    // Tabs wechseln
    function showTab(tab) {
        document.getElementById("graph-section").classList.add("hidden");
        document.getElementById("table-section").classList.add("hidden");

        document.getElementById(tab + "-section").classList.remove("hidden");

        document.querySelectorAll(".tab-button").forEach(button => {
            button.classList.remove("border-gray-800");
            button.classList.add("border-transparent");
        });

        document.getElementById("tab-" + tab).classList.add("border-gray-800");
        document.getElementById("tab-" + tab).classList.remove("border-transparent");
    }

    // Tabs initial anzeigen
    if (document.getElementById("tab-graph") && document.getElementById("tab-table")) {
        showTab('graph');

        document.getElementById("tab-graph").addEventListener("click", function() {
            showTab('graph');
        });

        document.getElementById("tab-table").addEventListener("click", function() {
            showTab('table');
        });
    }

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

    // Datei-Upload per Drag & Drop
    const dropArea = document.getElementById("drop");
    const fileInput = document.getElementById("file");
    const uploadButton = document.getElementById("upload");
    let selectedFile = null;

    if (dropArea && fileInput && uploadButton) {
        dropArea.addEventListener("click", () => {
            fileInput.click();
        });

        fileInput.addEventListener("change", (event) => {
            if (event.target.files.length > 0) {
                selectedFile = event.target.files[0];
                updateDropArea(selectedFile.name);
            }
        });

        dropArea.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropArea.classList.add("border-blue-500");
        });

        dropArea.addEventListener("dragleave", () => {
            dropArea.classList.remove("border-blue-500");
        });

        dropArea.addEventListener("drop", (e) => {
            e.preventDefault();
            dropArea.classList.remove("border-blue-500");

            if (e.dataTransfer.files.length > 0) {
                selectedFile = e.dataTransfer.files[0];
                updateDropArea(selectedFile.name);
            }
        });

        uploadButton.addEventListener("click", () => {
            if (selectedFile) {
                alert("Datei hochgeladen: " + selectedFile.name);
            } else {
                alert("Bitte eine Datei auswählen.");
            }
        });

        function updateDropArea(fileName) {
            dropArea.innerHTML = `<p class='text-green-600 font-bold'>${fileName} wurde ausgewählt</p>`;
        }
    } else {
        console.error("Elemente nicht gefunden! Stelle sicher, dass IDs korrekt sind.");
    }
});
