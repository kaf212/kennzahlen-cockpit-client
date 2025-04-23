import {getCurrentKeyFigureData} from "../keyFigureData/loadCompanyData.js";
import {checkUserPrivileges} from "../utils/userPrivilegeVerification.js";
import {sendServerRequest} from "../utils/serverResponseHandling.js";
import { loadHistoricKeyFigures } from "../keyFigureData/loadCompanyData.js";


function logout() {
    sessionStorage.removeItem("token");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("logoutButton").addEventListener("click", logout);

    // Tabs wechselnnb
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

        document.getElementById("tab-graph").addEventListener("click", function() {
            showTab('graph');
        });

        document.getElementById("tab-table").addEventListener("click", function() {
            showTab('table');
        });
    }

    restrictCustomKeyFigureAccess()

    const urlParams = new URLSearchParams(window.location.search)

    if (urlParams.has("id")) {
        // Only fetch company data if one has been selected
        getCurrentKeyFigureData().then((keyFigureData) => {
            insertKeyFiguresToTable(keyFigureData)
        })
    }

});

async function insertKeyFiguresToTable(data) {
    const figures = data.keyFigures;

    const period = data.period ? data.period : ""
    const urlParams = new URLSearchParams(window.location.search)
    const companyName = urlParams.get("company")
    const companyInfoDiv = document.getElementById("currentKeyFiguresCompanyInfo")
    companyInfoDiv.innerHTML = `<b>Unternehmen: </b>${companyName}<br><b>Rechnungsjahr:</b> ${period}`

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

    const customKeyFigures = await sendServerRequest("GET", "http://localhost:5000/customKeyFigures", null, false)
    const customKeyFigureTypes = {}
    const customKeyFigureNames = []
    customKeyFigures.forEach(customKeyFigure => {
        customKeyFigureTypes[customKeyFigure.name] = customKeyFigure.type
        customKeyFigureNames.push(customKeyFigure.name)
    })

    for (const key in figures) {
        const value = figures[key];
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.className = "p-2 border";
        nameCell.textContent = keyFigureNames[key] || key;

        const valueCell = document.createElement("td");
        valueCell.className = "p-2 border";

        if (customKeyFigureTypes[key] === "percentage" || !customKeyFigureNames.includes(key)) {
            /* If the type of the custom key figure is percentage, or it's a regular key figure, transform the value
            to a percentage. */
            const percentage = (value * 100).toFixed(0)
            valueCell.textContent = `${percentage} %`
        } else {
            // If
            const monetaryAmount = value * 1000

            /* Format the money amounts so that large numbers have apostrophes
             Source: https://chatgpt.com/share/68076e7a-d5fc-8011-84d3-217a8b9f8153 */
            const formattedAmount = monetaryAmount.toLocaleString('en-US')
                .replace(/,/g, "'")

            valueCell.textContent = `${formattedAmount} CHF`
        }

        let targetTable = document.getElementById("keyFigureTable")

        if (customKeyFigureNames.includes(key)) {
            targetTable = document.getElementById("customKeyFigureTable")
        }

        row.appendChild(nameCell);
        row.appendChild(valueCell);

        targetTable.appendChild(row);
    }
}

function restrictCustomKeyFigureAccess() {
    const button = document.getElementById("customKeyFigureEditorButton")
    if (!button) return;
    checkUserPrivileges().then((result) => {
        if (result === true) {
            button.setAttribute("href", "custom_figure.html")
            button.classList.remove("greyed-out")
        }
        else {
            button.removeAttribute("href")
            button.classList.add("greyed-out")
        }
    })
}

document.addEventListener("DOMContentLoaded", async function () {
    const params = new URLSearchParams(window.location.search);
    const companyId = params.get('id');
    if (!companyId) return;

    const dropdown = document.getElementById("category");
    const chartCanvas = document.getElementById("historicChart");
    const ctx = chartCanvas.getContext("2d");
    let chart;

    const labelToKey = {
        "Anlagedeckungsgrad 1": "fixedAssetCoverage1",
        "Anlagedeckungsgrad 2": "fixedAssetCoverage2",
        "Liquiditätsgrad 2": "quickCash"
    };

    let historicData;
    try {
        historicData = await sendServerRequest("GET", `http://localhost:5000/keyFigures/historic/${companyId}`, null, false);
        console.log("Daten von /historic/:id:", historicData);
    } catch (err) {
        console.error("Fehler beim Abrufen der historischen Daten:", err);
        chartCanvas.parentElement.innerHTML = `<p class="text-center text-red-500">Fehler beim Laden der Daten.</p>`;
        return;
    }

    function getChartData(key) {
        const keyData = historicData[key];
        if (!Array.isArray(keyData)) return { labels: [], values: [] };

        const sortedData = [...keyData].sort((a, b) => a.period - b.period);

        const labels = [];
        const values = [];

        sortedData.forEach(entry => {
            if (entry.period && entry.key_figure !== undefined && entry.key_figure !== null) {
                labels.push(entry.period);
                values.push(entry.key_figure);
            }
        });

        return { labels, values };
    }

    function renderChart(labelText) {
        const dataKey = labelToKey[labelText];
        if (!dataKey) return;

        const { labels, values } = getChartData(dataKey);

        if (chart) chart.destroy();

        if (labels.length === 0 || values.length === 0) {
            chartCanvas.parentElement.innerHTML = `<p class="text-center text-gray-500">Keine Daten für "${labelText}" verfügbar.</p>`;
            return;
        }

        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: labelText,
                    data: values,
                    borderColor: "blue",
                    backgroundColor: "rgba(0, 0, 255, 0.1)",
                    fill: false,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    dropdown.addEventListener("change", function () {
        if (this.value && this.value !== "") {
            renderChart(this.value);
        } else {
            chartCanvas.parentElement.innerHTML = "";
            if (chart) chart.destroy();
        }
    });
});
