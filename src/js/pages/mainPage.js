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

const keyFigureReferenceValues = {
    cashRatio: "Mind. 20 %",
    quickCash: "Mind. 100 %",
    currentRatio: "Mind. 150 %",
    debtRatio: "Max. 70 %",
    equityRatio: "Mind. 30 %",
    fixedAssetCoverage1: "Mind. 75 %",
    fixedAssetCoverage2: "Mind. 100 %",
    fixedAssetIntensity: "-",
    profitMargin: "1.5 % / 5 %",
    roa: "Mind. 6 %",
    roe: "Mind. 8 %",
    selfFinancingRatio: "-",
    workingCapitalIntensity: "-"
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

    /* The drop down to select key figures for the historical analysis is made visible
       dynamically based on the currently selected tab. */
    const dropdownElement = document.getElementById("historicTabDropdown")
    if (tab === "graph") {
        // Make the dropdown visible if the historical tab (graph) is selected
        dropdownElement.style.visibility = ""
    } else {
        // Make the dropdown invisible if the current tab (table) is selected
        dropdownElement.style.visibility = "hidden"
    }

    // Inform the user that he has to select a company if none is selected
    if (url.searchParams.get("id") === null) {
        displayUserMessageInTab("Bitte wählen Sie ein Unternehmen aus.")
    }
    // Inform that the user has to select a key figure if none have been selected
    else if (getSelectedKeyFiguresFromUrlParams().length === 0 && tab === "graph") {
        displayUserMessageInTab("Bitte wählen Sie eine Kennzahl aus.")
    }
}


export function restrictCustomKeyFigureAccess() {
    /**
     * Calls checkUserPrivileges() to check, if the user has admin privileges.
     * If that is the case, the button to access the custom key figure builder is made functional.
     * Else, it either left unfunctional or made unfunctional, if the user has previously been
     * logged in as admin and switched to standard.
     */
    /* Due to reformatting of the file, this function appears so be authored by laiba-bzz in the git blame.
       The original author is Jan (kaf212). */
    const button = document.getElementById("customKeyFigureEditorButton")
    if (!button) return;
    checkUserPrivileges().then((result) => {
        if (result === true) { // If the user has admin privileges
            // Make the button functional by adding the href attribute that leads to the editor page
            button.setAttribute("href", "custom_figure.html")
            // remove the greyed-out class
            button.classList.remove("greyed-out")
        } else { // If the user only has standard privileges
            /* Remove the href attribute from the button to make it unfunctional
               if the user has been logged in as admin before */
            button.removeAttribute("href")
            // Grey out the button
            button.classList.add("greyed-out")
        }
    })
}

function insertCompanyInfo(targetTab, companyName, period) {
    /**
     * Inserts the currently selected company's name and the viewed period into the top of the
     * active tab.
     * The function replaces the need to use the innerHTML attribute to insert company info
     * in order to prevent DOM-based XSS attacks.
     *
     * @param {String} targetTab - The tab that is viewed by the user
     * @param {String} companyName - The name of the selected company
     * @param {Number|String} - The current period or the start and end period if the historical tab is active
     * @returns {void}
     */
    let companyInfoDiv
    if (targetTab === "table") {
        companyInfoDiv = document.getElementById("currentKeyFiguresCompanyInfo")
    } else {
        companyInfoDiv = document.getElementById("historicKeyFiguresCompanyInfo")
    }

    companyInfoDiv.innerHTML = "" // Clear leftover company infos

    const companyLabel = document.createElement("b")
    companyLabel.textContent = "Unternehmen: "

    const companyNameTextNode = document.createTextNode(companyName)

    const br = document.createElement("br")

    const periodLabel = document.createElement("b")
    periodLabel.textContent = "Rechnungsjahr:"

    const periodTextNode = document.createTextNode(" " + period)

    companyInfoDiv.appendChild(companyLabel)
    companyInfoDiv.appendChild(companyNameTextNode)
    companyInfoDiv.appendChild(br)
    companyInfoDiv.appendChild(periodLabel)
    companyInfoDiv.appendChild(periodTextNode)
}

export async function insertKeyFiguresToTable(data) {
    const figures = data.keyFigures;
    const period = data.period ? data.period : "";
    const urlParams = new URLSearchParams(window.location.search);
    const companyName = urlParams.get("company");

    // Display the name of the selected company and the currently viewed period above the table
    insertCompanyInfo("table", companyName, period)

    Array.from(document.getElementsByClassName("data-table")).forEach(keyFigureTable => {
        // Unhide the tables with the current key figure data
        keyFigureTable.classList.remove("hidden")
    })

    // Fetch all custom key figures from the API
    const customKeyFigures = await sendServerRequest("GET", "http://localhost:5000/api/customKeyFigures", null, false);
    const customKeyFigureTypes = {};
    const customKeyFigureNames = [];

    // Iterate over the custom key figures
    customKeyFigures.forEach(customKeyFigure => {
        // Add an entry with the custom key figure name as key and its type as value into customKeyFigureTypes
        customKeyFigureTypes[customKeyFigure.name] = customKeyFigure.type;
        // Add an entry with the custom key figure name as key and its reference value as key
        keyFigureReferenceValues[customKeyFigure.name] = customKeyFigure.reference_value || "-"
        // Append the custom key figure name to the array with all custom key figure names
        customKeyFigureNames.push(customKeyFigure.name);
    });

    for (const key in figures) {
        const value = figures[key];
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.className = "p-2 border";
        nameCell.textContent = keyFigureNames[key] || key;

        // Create a HTML element for the table cell containing the reference value
        const referenceValueCell = document.createElement("td")
        referenceValueCell.classList.add("p-2", "border")
        // Insert the reference value into the table cell
        referenceValueCell.textContent = keyFigureReferenceValues[key]

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

        // Add the three created table cells to the row of the current iteration
        row.appendChild(nameCell);
        row.appendChild(referenceValueCell)
        row.appendChild(valueCell);

        // Add the row to the table
        targetTable.appendChild(row);
    }
}

function displayUserMessageInTab(message) {
    /**
     * Hides the empty historic chart element in the historic tab and inserts a message informing the user
     * why no key figure data is being displayed. (no company selected, no key figure selected etc.)
     *
     * @param {String} message - The message that is to be displayed to the user
     * @returns {void}
     */
    const url = new URL(window.location.href)

    const messageElement = document.createElement("p")
    messageElement.id = "tabMessage"
    messageElement.classList = "text-center text-gray-500"
    messageElement.innerText = message

    const existingMessage = document.getElementById("tabMessage")
    // If there already is a user message in the tab, delete it
    if (existingMessage) {
        existingMessage.remove()
    }

    // If the currently selected tab is the historical tab
    if (url.searchParams.get("view") === "graph") {
        const chartCanvas = document.getElementById("historicChart")
        const graphTab = document.getElementById("graph-section")
        // Hide the graph in order to display the user message
        if (chartCanvas) {
            chartCanvas.classList.add("hidden")
            // Insert the user message element into the tab
            graphTab.appendChild(messageElement)
        }
    } else { // If the currently selected tab is the current key figures tab
        const tableTab = document.getElementById("table-section")
        // Hide both tables in the table tab in order to display the user message
        Array.from(tableTab.querySelectorAll("table")).forEach(table => {
            table.classList.add("hidden")
        })
        // Insert the user message element into the tab
        tableTab.appendChild(messageElement)
    }
}


function findCustomKeyFigure(customKeyFigureName, customKeyFigureList) {
    /**
     * Searches for a specific custom key figure in an array of custom key figures by name.
     *
     * @param {String} customKeyFigureName - The name of the searched custom key figure
     * @param {Array} customKeyFigureList - An array of custom key figure objects
     * @returns {Object|void} The found custom key figure or nothing, if none was found
     */

    let foundCustomKeyFigure
    // Iterate over all custom key figures in the provided list and compare their names with customKeyFigureName
    customKeyFigureList.forEach(customKeyFigure => {
        if (customKeyFigure.name === customKeyFigureName) {
            // A custom key figure with the provided name has been found in the list
            foundCustomKeyFigure = customKeyFigure
        }
    })

    return foundCustomKeyFigure
}


async function multiplyKeyFigureValuesBasedOnType(historicDataObject) {
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

    // Fetch all custom key figures from the API
    const customKeyFigures = await sendServerRequest("GET", "http://localhost:5000/api/customKeyFigures", null, false)

    // Iterate over the key figures inside the historicalDataObject
    for (const [keyFigureName, historicValueArray] of Object.entries(historicDataObject)) {
        let multiplicator = 100

        // Only custom key figures can have a non-percentage type, so it is checked, if it is one
        const foundCustomKeyFigure = findCustomKeyFigure(keyFigureName, customKeyFigures)
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
        chartCanvas.classList.add("hidden")
        displayUserMessageInTab("Bitte wählen Sie eine Kennzahl aus.")
        return;
    }

    document.getElementById("historicChart").classList.remove("hidden")

    const tabMessage = document.getElementById("tabMessage")
    // If a user message is still present inside the tab, remove it
    if (tabMessage) {
        tabMessage.remove()

    }

    let historicData;
    try {
        // Fetch the historical data of the given company from the API
        historicData = await sendServerRequest("GET", `http://localhost:5000/api/keyFigures/historic/${companyId}`, null, false);
    } catch (err) {
        chartCanvas.classList.add("hidden");

        return;
    }

    // Multiply the historical key figure values with 100 or 1000 based on their type (percentage or numeric)
    historicData = await multiplyKeyFigureValuesBasedOnType(historicData)

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

        // Translate the key figure if a translation exists (custom key figures don't have translations)
        const translation = keyFigureNames[label] || label

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

    // totalHistoricalPeriod is the array of all periods that exist for the selected company
    const totalHistoricalPeriod = commonLabels
    // Get the first and last years of the total historical period
    const firstYear = totalHistoricalPeriod[0]
    const lastYear = totalHistoricalPeriod[totalHistoricalPeriod.length - 1]

    const url = new URL(window.location.href)
    // Get the currently selected company from the URL parameters
    const companyName = url.searchParams.get("company");

    // Display the name of the company and the total historical period above the graph
    insertCompanyInfo("graph", companyName, `${firstYear} - ${lastYear}`);

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

    // If no key figures are selected, display the message "Kennzahlen auswählen"
    if (keyFigureNamesToInsert.length === 0) {
        dropdownLabel.innerText = "Kennzahlen auswählen"
    } else {
        // Convert the array to a comma seperated string and insert it into the dropdown's label
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
    // Iterate over all key figure checkboxes inside the key figure selection dropdown
    Array.from(document.getElementsByClassName("key-figure-checkbox")).forEach(checkbox => {
        const checkBoxKeyFigure = checkbox.value
        // If the key figure is selected in the URL but its checkbox is unchecked:
        if (selectedKeyFigures.includes(checkBoxKeyFigure) && checkbox.checked === false) {
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
        // Return an empty array if no key figure is selected in the URL parameter
        return []
    }

    // Convert the comma seperated string into an array
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

    // Fetch all custom key figures from the API
    const customKeyFigures = await sendServerRequest("GET", "http://localhost:5000/api/customKeyFigures", null, false);

    // Iteratively create a checkbox element for each custom key figure and insert it into the dropdown
    customKeyFigures.forEach(fig => {
        const listItem = document.createElement("li");

        const checkBoxElement = document.createElement("input")
        checkBoxElement.type = "checkbox"
        checkBoxElement.value = fig.name
        checkBoxElement.classList.add("key-figure-checkbox", "mr-2")

        const customKeyFigureLabel = document.createElement("label")
        customKeyFigureLabel.classList.add("flex", "items-center", "px-4", "py-2", "hover:bg-gray-100")
        customKeyFigureLabel.appendChild(checkBoxElement)

        const customKeyFigureTextNode = document.createTextNode(fig.name)
        customKeyFigureLabel.appendChild(customKeyFigureTextNode)

        listItem.appendChild(customKeyFigureLabel)

        dropdownList.appendChild(listItem);

        /* Create a new entry in the key figure translation object for the custom key figure
           (It translates to itself) */
        labelToKey[fig.name] = fig.name;
    });

    const setChart = (newChart) => chart = newChart
    const getChart = () => chart

    setupCheckboxListeners(dropdownList, dropdownLabel, ctx, chartCanvas, companyId, labelToKey, setChart, getChart);
    insertKeyFigureNamesIntoDropdownLabel()
    markSelectedCustomKeyFiguresAsChecked()

    const selectedKeyFigures = getSelectedKeyFiguresFromUrlParams()
    if (selectedKeyFigures.length > 0) {
        // Only render the chart if at least one key figure has been selected
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

        // Display the selected tab
        showTab(targetTab)

        document.getElementById("tab-graph").addEventListener("click", () => showTab('graph'));
        document.getElementById("tab-table").addEventListener("click", () => showTab('table'));
    }

    restrictCustomKeyFigureAccess();


    const companyId = url.searchParams.get("id");
    if (!companyId) {
        // Stop execution here if no company has been selected, because no data can be displayed
        return
    }

    if (url.searchParams.has("id")) {
        // Fetch and insert the current key figure data into the tables if the URL parameter "id" exists
        getCurrentKeyFigureData().then(insertKeyFiguresToTable);
    }

    // If the historical tab is selected but no key figures are selected
    if (getSelectedKeyFiguresFromUrlParams().length === 0 && url.searchParams.get("view") === "graph") {
        displayUserMessageInTab("Bitte wählen Sie eine Kennzahl aus.")
    }

    setupDropdown(companyId);
});
