import {getCurrentKeyFigureData} from "../keyFigureData/loadCompanyData.js";
import {checkUserPrivileges} from "../utils/userPrivilegeVerification.js";
import {sendServerRequest} from "../utils/serverResponseHandling.js";

function logout() {
    sessionStorage.removeItem("token");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("logoutButton").addEventListener("click", logout);

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
        showTab('table');

        document.getElementById("tab-graph").addEventListener("click", () => showTab('graph'));
        document.getElementById("tab-table").addEventListener("click", () => showTab('table'));
    }

    restrictCustomKeyFigureAccess();

    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get("id");
    if (!companyId) return;

    if (urlParams.has("id")) {
        getCurrentKeyFigureData().then(insertKeyFiguresToTable);
    }

    const chartCanvas = document.getElementById("historicChart");
    const ctx = chartCanvas.getContext("2d");
    let chart;

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

    // Add custom key figures to dropdown
    const customKeyFigures = await sendServerRequest("GET", "http://localhost:5000/customKeyFigures", null, false);
    customKeyFigures.forEach(fig => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <label class="flex items-center px-4 py-2 hover:bg-gray-100">
                <input type="checkbox" value="${fig.name}" class="mr-2">${fig.name}
            </label>
        `;
        dropdownList.appendChild(listItem);
        labelToKey[fig.name] = fig.name;
    });

    function setupCheckboxListeners(container) {
        container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener("change", () => {
                const selected = Array.from(container.querySelectorAll('input[type="checkbox"]:checked'))
                    .map(c => c.parentElement.textContent.trim());
                dropdownLabel.textContent = selected.length > 0 ? selected.join(", ") : "Kennzahlen auswählen";
                renderMultiChart(selected);
            });
        });
    }

    setupCheckboxListeners(dropdownList);

    dropdownToggle.addEventListener("click", () => dropdownMenu.classList.toggle("hidden"));
    document.addEventListener("click", e => {
        if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.add("hidden");
        }
    });

    let historicData;
    try {
        historicData = await sendServerRequest("GET", `http://localhost:5000/keyFigures/historic/${companyId}`, null, false);
    } catch (err) {
        chartCanvas.parentElement.innerHTML = `<p class="text-center text-red-500">Fehler beim Laden der Daten.</p>`;
        return;
    }

    async function renderMultiChart(selectedLabels) {
        if (chart) chart.destroy();

        if (selectedLabels.length === 0) {
            chartCanvas.parentElement.innerHTML = "<p class='text-center text-gray-500'>Bitte Kennzahlen auswählen.</p>";
            return;
        }

        const datasets = [];
        let commonLabels = [];

        for (const label of selectedLabels) {
            const key = labelToKey[label];
            if (!key) continue;

            let keyData = historicData[key];

            if (!keyData) {
                try {
                    const customDataObj = await sendServerRequest("GET", `http://localhost:5000/customKeyFigures/historic/${companyId}/${key}`, null, false);
                    keyData = customDataObj;
                } catch (err) {
                    console.error(`Fehler beim Laden der Custom-Kennzahl '${key}':`, err);
                    continue;
                }
            }

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

            datasets.push({
                label: label,
                data: values,
                fill: false,
                tension: 0.3
            });
        }

        if (datasets.length === 0) {
            chartCanvas.parentElement.innerHTML = "<p class='text-center text-gray-500'>Keine Daten gefunden oder Fehler beim Abrufen.</p>";
            return;
        }

        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: commonLabels,
                datasets: datasets
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: false }
                },
                plugins: {
                    legend: { position: "top" }
                }
            }
        });
    }
});

function restrictCustomKeyFigureAccess() {
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

async function insertKeyFiguresToTable(data) {
    const figures = data.keyFigures;
    const period = data.period ? data.period : "";
    const urlParams = new URLSearchParams(window.location.search);
    const companyName = urlParams.get("company");
    const companyInfoDiv = document.getElementById("currentKeyFiguresCompanyInfo");
    companyInfoDiv.innerHTML = `<b>Unternehmen: </b>${companyName}<br><b>Rechnungsjahr:</b> ${period}`;

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
    };

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
