import {getCurrentKeyFigureData} from "../keyFigureData/loadCompanyData.js";
import {checkUserPrivileges} from "../utils/userPrivilegeVerification.js";
import {sendServerRequest} from "../utils/serverResponseHandling.js";

function logout() {
    sessionStorage.removeItem("token");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("logoutButton").addEventListener("click", logout);

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
        showTab('table');

        document.getElementById("tab-graph").addEventListener("click", function() {
            showTab('graph');
        });

        document.getElementById("tab-table").addEventListener("click", function() {
            showTab('table');
        });
    }

    restrictCustomKeyFigureAccess()

    getCurrentKeyFigureData().then((keyFigureData) => {
        insertKeyFiguresToTable(keyFigureData);
    })
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
    if (!button) return; // <- this prevents errors if button doesn't exist
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