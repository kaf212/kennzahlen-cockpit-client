import { sendServerRequest } from '../utils/serverResponseHandling.js';
import { checkUserPrivileges } from '../utils/userPrivilegeVerification.js';
import { getCurrentKeyFigureData } from '../keyFigureData/loadCompanyData.js';

const keyFigureNames = {
    cashRatio: "Liquiditätsgrad 1",
    quickCash: "Liquiditätsgrad 2",
    currentRatio: "Liquiditätsgrad 3",
    debtRatio: "Verschuldungsgrad",
    equityRatio: "Eigenfinanzierungsgrad",
    fixedAssetCoverage1: "Anlagedeckungsgrad 1",
    fixedAssetCoverage2: "Anlagedeckungsgrad 2",
    fixedAssetIntensity: "Anlageintensität",
    profitMargin: "Gewinnmarge",
    roa: "Gesamtkapitalrendite",
    roe: "Eigenkapitalrendite",
    selfFinancingRatio: "Selbstfinanzierungsgrad",
    workingCapitalIntensity: "Umlaufintensität"
}

export function showTab(tab) {
    const url = new URL(window.location.href)
    url.searchParams.set("view", tab)
    window.history.replaceState(null, '', url.toString())

    document.getElementById("graph-section").classList.add("hidden");
    document.getElementById("table-section").classList.add("hidden");

    document.getElementById(`${tab}-section`).classList.remove("hidden");

    document.querySelectorAll(".tab-button").forEach(button => {
        button.classList.remove("border-gray-800");
        button.classList.add("border-transparent");
    });

    document.getElementById(`tab-${tab}`).classList.add("border-gray-800");
    document.getElementById(`tab-${tab}`).classList.remove("border-transparent");

    const dropdownElement = document.getElementById("historicTabDropdown")
    if (tab === "graph") {
        dropdownElement.style.visibility = ""
    } else {
        dropdownElement.style.visibility = "hidden"
    }

    if (url.searchParams.get("id") === null) {
        displayUserMessageInTab("Bitte wählen Sie ein Unternehmen aus.")
    }
}

export function restrictCustomKeyFigureAccess() {
    /* Due to reformatting of the file, this function appears so be authored by laiba-bzz in the git blame.
       The original author is Jan (kaf212). */
    const button = document.getElementById("customKeyFigureEditorButton")
    if (!button) return;
    checkUserPrivileges().then((result) => {
        if (result === true) {
            button.setAttribute("href", "custom_figure.html")
            button.classList.remove("greyed-out")
        } else {
            button.removeAttribute("href")
            button.classList.add("greyed-out")
        }
    })
}

export async function insertKeyFiguresToTable(data) {
    const figures = data.keyFigures;
    const period = data.period ? data.period : "";
    const urlParams = new URLSearchParams(window.location.search);
    const companyName = urlParams.get("company");
    const companyInfoDiv = document.getElementById("currentKeyFiguresCompanyInfo");
    companyInfoDiv.innerHTML = `<b>Unternehmen: </b>${companyName}<br><b>Rechnungsjahr:</b> ${period}`;

    const customKeyFigures = await sendServerRequest("GET", "http://localhost:5000/customKeyFigures", null, false);
    const customKeyFigureTypes = {};
    const customKeyFigureNames = [];

    customKeyFigures.forEach(customKeyFigure => {
        customKeyFigureTypes[customKeyFigure.name] = customKeyFigure.type;
        customKeyFigureNames.push(customKeyFigure.name);
    });

    for (const key in figures) {
        const value = figures[key];
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.className = "p-2 border";
        nameCell.textContent = keyFigureNames[key] || key;

        const valueCell = document.createElement("td");
        valueCell.className = "p-2 border";

        if (customKeyFigureTypes[key] === "percentage" || !customKeyFigureNames.includes(key)) {
            const percentage = (value * 100).toFixed(0);
            valueCell.textContent = `${percentage} %`;
        } else {
            const monetaryAmount = value * 1000;
            const formattedAmount = monetaryAmount.toLocaleString('en-US').replace(/,/g, "'");
            valueCell.textContent = `${formattedAmount} CHF`;
        }

        let targetTable = document.getElementById("keyFigureTable");
        if (customKeyFigureNames.includes(key)) {
            targetTable = document.getElementById("customKeyFigureTable");
        }

        row.appendChild(nameCell);
        row.appendChild(valueCell);
        targetTable.appendChild(row);
    }
}

function displayUserMessageInTab(message) {
    /**
     * Hides the empty historic chart element in the historic tab and inserts a message informing the user
     * why no chart is displayed (no company selected, no key figure selected etc.)
     *
     * @returns {void}
     */
    const url = new URL(window.location.href)
    const htmlToInsert = `<p id="tabMessage" class="text-center text-gray-500">${message}</p>`

    const existingMessage = document.getElementById("tabMessage")
    if (existingMessage) {
        existingMessage.remove()
    }

    if (url.searchParams.get("view") === "graph") {
        const chartCanvas = document.getElementById("historicChart")
        if (chartCanvas) {
            chartCanvas.classList.add("hidden")

            chartCanvas.parentElement.innerHTML += htmlToInsert
        }
    } else {
        const tableTab = document.getElementById("table-section")
        Array.from(tableTab.querySelectorAll("table")).forEach(table => {
            table.classList.add("hidden")
        })
        tableTab.innerHTML += htmlToInsert
    }



}

async function findCustomKeyFigure(customKeyFigureName) {
    /**
     * Searches for a custom key figure by name via the API and returns the object if found.
     *
     * @param {String} customKeyFigureName - The name of the searched custom key figure
     * @returns {Object|void} The found custom key figure or nothing, if none was found
     */
    const customKeyFigures = await sendServerRequest("GET", "http://localhost:5000/customKeyFigures", null, false)
    customKeyFigures.forEach(customKeyFigure => {
        if (customKeyFigure.name === customKeyFigureName) {
            return customKeyFigure
        }
    })
}

function multiplyKeyFigureValuesBasedOnType(historicDataObject) {
    /**
     * Takes a historic data object and multiplies all the historic key figure values based on their type.
     * Percentage key figures are delivered by the server as the raw ratios,
     * so they need to be multiplied with 100.
     * Numeric key figures are delivered by the server as accounting short figures,
     * so they need to be multiplied with 1000.
     *
     * @param {Object} historicDataObject - An object containing historic data for multiple key figures
     * @returns {Object} The modified historicDataObject with the multiplied values
     */

    for (const [keyFigureName, historicValueArray] of Object.entries(historicDataObject)) {
        let multiplicator = 100

        // Only custom key figures can have a non-percentage type, so it is checked, if it is one
        const foundCustomKeyFigure = findCustomKeyFigure(keyFigureName)
        if (foundCustomKeyFigure && foundCustomKeyFigure.type === "numeric") {
            multiplicator = 1000
        }

        // Multiply the key figure values for all years in the historical array
        historicValueArray.forEach(yearlyValue => {
            yearlyValue.key_figure = (yearlyValue.key_figure * multiplicator).toFixed(0)
        })
    }

    return historicDataObject
}

async function renderMultiChart(selectedLabels, ctx, chartCanvas, companyId, labelToKey, setChart, getChart) {
    const currentChart = getChart();
    if (currentChart) currentChart.destroy();
    setChart(null);

    if (selectedLabels.length === 0) {
        displayUserMessageInTab("Bitte Kennzahl auswählen.")
        return;
    }


    let historicData;
    try {
        historicData = await sendServerRequest("GET", `http://localhost:5000/keyFigures/historic/${companyId}`, null, false);
    } catch (err) {
        chartCanvas.classList.add("hidden");

        const messageElement = document.getElementById("noChartMessage");
        if (!messageElement) {
            const p = document.createElement("p");
            p.id = "noChartMessage";
            p.className = "text-center text-gray-500";
            p.textContent = "Bitte Kennzahlen auswählen.";
            chartCanvas.parentElement.appendChild(p);
        }
        return;
    }

    historicData = multiplyKeyFigureValuesBasedOnType(historicData)

    const datasets = [];
    let commonLabels = [];

    for (const label of selectedLabels) {
        const key = label
        if (!key) continue;

        let keyData = historicData[key];

        if (!Array.isArray(keyData) || keyData.length === 0) continue;
        keyData.sort((a, b) => (a.period || 0) - (b.period || 0));

        const labels = [];
        const values = [];

        keyData.forEach(entry => {
            const label = entry.period || "Unbekannt";
            const value = entry.key_figure ?? entry.customKeyFigure ?? entry.value;
            if (value !== undefined && value !== null) {
                labels.push(label);
                values.push(value);
            }
        });

        if (labels.length === 0 || values.length === 0) continue;
        if (commonLabels.length === 0) commonLabels = labels;

        const translation = keyFigureNames[label] || label

        console.log(values)

        datasets.push({
            label: translation,
            data: values,
            fill: false,
            tension: 0.3
        });
    }

    if (datasets.length === 0) {
        chartCanvas.parentElement.innerHTML = "<p class='text-center text-gray-500'>Keine Daten gefunden oder Fehler beim Abrufen.</p>";
        return;
    }
    const existingMsg = document.getElementById("noChartMessage");
    if (existingMsg) existingMsg.remove();
    chartCanvas.classList.remove("hidden");


    const chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: commonLabels,
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: false } },
            plugins: { legend: { position: "top" } }
        }
    });

    setChart(chart);
}

function setupCheckboxListeners(container, dropdownLabel, ctx, chartCanvas, companyId, labelToKey, setChart, getChart) {
    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener("change", () => {
            const selected = Array.from(container.querySelectorAll('input[type="checkbox"]:checked'))
                .map(c => c.value);

            updateSelectedKeyFiguresInUrlParams()
            insertKeyFigureNamesIntoDropdownLabel()
            renderMultiChart(selected, ctx, chartCanvas, companyId, labelToKey, setChart, getChart);
        });
    });
}

function updateSelectedKeyFiguresInUrlParams() {
    /**
     * Iterates over all key figures inside the dropdown menu in the historic tab
     * and saves the selected ones in the URL-parameter selectedKeyFigures.
     *
     * @returns {void}
     */
    const selectedKeyFigures = []
    Array.from(document.getElementsByClassName("key-figure-checkbox")).forEach(checkbox => {
        if (checkbox.checked === true) {
            // The english name of the key figure is stored inside the value attribute of the checkbox
            const keyFigureName = checkbox.value
            selectedKeyFigures.push(keyFigureName)
        }
    })
    // Source: https://chatgpt.com/share/680a5b89-dee8-8011-aac7-daeb50dc4923
    const uriEncodedList = encodeURIComponent(selectedKeyFigures.join(','))

    const url = new URL(window.location.href)
    if (uriEncodedList.length === 0) {
        // If no key figures are selected, the URL-parameter is deleted to avoid errors
        url.searchParams.delete("selectedKeyFigures")
    } else {
        url.searchParams.set("selectedKeyFigures", uriEncodedList)
    }
    window.history.replaceState(null, '', url.toString())
}

function insertKeyFigureNamesIntoDropdownLabel() {
    /**
     * Inserts the german translations of the selected key figure names into the label of the dropdown
     * so that the user can instantly see which key figures he has selected.
     *
     * @returns {void}
     */

    const selectedKeyFigures = getSelectedKeyFiguresFromUrlParams()
    const dropdownLabel = document.getElementById("dropdownLabel")
    const keyFigureNamesToInsert = []

    selectedKeyFigures.forEach(keyFigure => {
        // Translate the key figure name or leave the original name if no translation exists (custom key figures)
        const translation = keyFigureNames[keyFigure] || keyFigure
        keyFigureNamesToInsert.push(translation)
    })

    if (keyFigureNamesToInsert.length === 0) {
        dropdownLabel.innerText = "Kennzahlen auswählen"
    } else {
        dropdownLabel.innerText = keyFigureNamesToInsert.join(", ")
    }

}

function markSelectedCustomKeyFiguresAsChecked() {
    /**
     * Inside the dropdown menu in the historic graph tab, custom key figures
     * are loaded dynamically when the page loads.
     * For this reason, they appear as unchecked after a page refresh even if they are still selected.
     * This function iterates over all key figures in the dropdown marks their checkboxes as checked, if they
     * are selected in the URL parameter selectedKeyFigures.
     */
    const selectedKeyFigures = getSelectedKeyFiguresFromUrlParams()
    Array.from(document.getElementsByClassName("key-figure-checkbox")).forEach(checkbox => {
        const checkBoxKeyFigure = checkbox.value
        if (selectedKeyFigures.includes(checkBoxKeyFigure) && checkbox.checked === false) {
            // If the key figure is selected in the URL but its checkbox is unchecked:
            checkbox.checked = true // mark it as checked
        }
    })
}

function getSelectedKeyFiguresFromUrlParams() {
    /**
     * Reads the list of all selected key figures inside the URL parameter selectedKeyFigures.
     *
     * @returns {Array} A list of selected key figure names
     */
    const url = new URL(window.location.href)
    const urlList = decodeURIComponent(url.searchParams.get("selectedKeyFigures"))
    if (urlList === "null") {
        return []
    }
    const selectedKeyFigures = urlList.split(",")
    return selectedKeyFigures
}

async function setupDropdown(companyId) {
    const chartCanvas = document.getElementById("historicChart");
    if (!chartCanvas) return;
    const ctx = chartCanvas.getContext("2d");
    let chart = null;

    const dropdownToggle = document.getElementById("dropdownToggle");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const dropdownLabel = document.getElementById("dropdownLabel");
    const dropdownList = dropdownMenu.querySelector("ul");

    const labelToKey = {
        "Liquiditätsgrad 1": "cashRatio",
        "Liquiditätsgrad 2": "quickCash",
        "Liquiditätsgrad 3": "currentRatio",
        "Verschuldungsgrad": "debtRatio",
        "Eigenfinanzierungsgrad": "equityRatio",
        "Anlagedeckungsgrad 1": "fixedAssetCoverage1",
        "Anlagedeckungsgrad 2": "fixedAssetCoverage2",
        "Anlageintensität": "fixedAssetIntensity",
        "Gewinnmarge": "profitMargin",
        "Gesamtkapitalrendite": "roa",
        "Eigenkapitalrendite": "roe",
        "Selbstfinanzierungsgrad": "selfFinancingRatio",
        "Umlaufintensität": "workingCapitalIntensity"
    };

    const customKeyFigures = await sendServerRequest("GET", "http://localhost:5000/customKeyFigures", null, false);
    customKeyFigures.forEach(fig => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <label class="flex items-center px-4 py-2 hover:bg-gray-100">
                <input type="checkbox" value="${fig.name}" class="key-figure-checkbox mr-2">${fig.name}
            </label>
        `;
        dropdownList.appendChild(listItem);
        labelToKey[fig.name] = fig.name;
    });

    const setChart = (newChart) => chart = newChart
    const getChart = () => chart

    setupCheckboxListeners(dropdownList, dropdownLabel, ctx, chartCanvas, companyId, labelToKey, setChart, getChart);
    insertKeyFigureNamesIntoDropdownLabel()
    markSelectedCustomKeyFiguresAsChecked()

    const selectedKeyFigures = getSelectedKeyFiguresFromUrlParams()
    if (selectedKeyFigures.length > 0) {
        await renderMultiChart(selectedKeyFigures, ctx, chartCanvas, companyId, labelToKey, setChart, getChart)
    }

    dropdownToggle.addEventListener("click", () => dropdownMenu.classList.toggle("hidden"));
    document.addEventListener("click", e => {
        if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.add("hidden");
        }
    });
}

export function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", async () => {
    const url = new URL(window.location.href)

    document.getElementById("logoutButton").addEventListener("click", logout);

    if (document.getElementById("tab-graph") && document.getElementById("tab-table")) {

        let targetTab = url.searchParams.get("view")
        if (targetTab === null) {
            targetTab = "table"
        }

        showTab(targetTab)

        document.getElementById("tab-graph").addEventListener("click", () => showTab('graph'));
        document.getElementById("tab-table").addEventListener("click", () => showTab('table'));
    }

    restrictCustomKeyFigureAccess();


    const companyId = url.searchParams.get("id");
    if (!companyId) {
        return
    }

    if (url.searchParams.has("id")) {
        getCurrentKeyFigureData().then(insertKeyFiguresToTable);
    }

    if (getSelectedKeyFiguresFromUrlParams().length === 0) {
        displayUserMessageInTab("Bitte Kennzahl auswählen.")
    }

    setupDropdown(companyId);
});
