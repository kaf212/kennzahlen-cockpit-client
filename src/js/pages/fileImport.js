import {sendServerRequest, addInfoBoxEventListener} from "../utils/serverResponseHandling.js";
import {escapeHtml} from "../utils/escapeHtml.js";

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
            uploadFile()
        } else {
            alert("Bitte eine Datei auswählen.");
        }
    });

    function updateDropArea(fileName) {
        // Escape the name of the file as it's directly inserted into the DOM.
        const secureFilename = escapeHtml(fileName)
        dropArea.innerHTML = `<p class='text-green-600 font-bold'>${secureFilename} wurde ausgewählt</p>`;
    }
} else {
    console.error("Elemente nicht gefunden! Stelle sicher, dask,iots IDs korrekt sind.");
}

function uploadFile() {
    /**
     * Creates a formdata object with the selected file inside and sends it to the upload endpoint in the API.
     *
     * @returns {void}
     */
    const formData = new FormData()
    formData.append("file", selectedFile)

    // Upload the file to the upload endpoint in the API
    sendServerRequest("POST", "/api/upload", formData, true, false)
}

function resetUploadField() {
    fileInput.value = ""
    dropArea.innerHTML = "<p>Datei auswählen oder per Drag & Drop hochladen</p>"
}

addInfoBoxEventListener(resetUploadField)