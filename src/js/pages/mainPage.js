import {getCurrentKeyFigureData} from "../keyFigureData/loadCompanyData.js";

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

    getCurrentKeyFigureData().then((keyFigureData) => {
        insertKeyFiguresToTable(keyFigureData);
    })
});

function insertKeyFiguresToTable(data) {
    const tbody = document.querySelector("#table-section tbody");
    tbody.innerHTML = "";

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

    for (const key in figures) {
        const value = figures[key];
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.className = "p-2 border";
        nameCell.textContent = keyFigureNames[key] || key;

        const valueCell = document.createElement("td");
        valueCell.className = "p-2 border";
        const percentage = (value * 100).toFixed(0)
        valueCell.textContent = `${percentage} %`

        row.appendChild(nameCell);
        row.appendChild(valueCell);

        tbody.appendChild(row);
    }
}
