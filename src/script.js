import {sendServerRequest, addInfoBoxEventListener} from "./js/utils/serverResponseHandling.js";

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

    if (document.getElementById("tab-graph") && document.getElementById("tab-table")) {
        showTab('graph');

        document.getElementById("tab-graph").addEventListener("click", function() {
            showTab('graph');
        });

        document.getElementById("tab-table").addEventListener("click", function() {
            showTab('table');
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
        console.error("Elemente nicht gefunden! Stelle sicher, dask,iots IDs korrekt sind.");
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const companyInput = document.getElementById("companyNameInput");
    const companyList = document.getElementById("companyList");

    const defaultCompanies = [

    ];

    let companies = JSON.parse(localStorage.getItem("companies"));

    if (!companies) {
        companies = defaultCompanies;
        localStorage.setItem("companies", JSON.stringify(companies));
    }

    renderCompanies();


    function saveCompanies() {
        localStorage.setItem("companies", JSON.stringify(companies));
    }

    function renderCompanies() {
        companyList.innerHTML = "";
        companies.forEach((name, index) => {
            const li = document.createElement("li");
            li.className = "company-list-item";

            const link = document.createElement("a");
            link.href = "#";
            link.textContent = name;
            link.className = "company-link";

            const delBtn = document.createElement("button");
            delBtn.textContent = "×";
            delBtn.className = "delete-button";
            delBtn.addEventListener("click", () => {
                const confirmed = confirm(`Möchtest du "${name}" wirklich löschen?`);
                if (confirmed) {
                    companies.splice(index, 1);
                    saveCompanies();
                    renderCompanies();
                }
            });


            li.appendChild(link);
            li.appendChild(delBtn);
            companyList.appendChild(li);
        });
    }
});







