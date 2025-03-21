const translations = {
    "Aktiven": "actives",
    "Umlaufvermögen": "current_assets",
    "Flüssige Mittel": "liquid_assets",
    "Kasse": "cash",
    "Post": "postal",
    "Bank": "bank",
    "Ford. L+L": "receivables",
    "Warenvorrat": "stocks",
    "Anlagevermögen": "fixed_assets",
    "Maschinen": "machines",
    "Mobilien": "movables",
    "Immobilien": "real_estate",
    "Passiven": "passives",
    "Fremdkapital": "debt",
    "Kurzfristiges FK": "short_term",
    "Verb. L+L": "liabilities",
    "Langfristiges FK": "long_term",
    "Passivdarlehen": "loans",
    "Hypothek": "mortgage",
    "Eigenkapital": "equity",
    "Aktienkapital": "shares",
    "Ges. Gewinnreserve": "legal_reserve",
    "Gewinnvortrag": "retained_earnings",
    "Betriebsaufwand": "operating_expense",
    "Personalaufwand": "staff_expense",
    "Sonst. Betriebsaufwand": "other_expenses",
    "Abschreibungen": "depreciation",
    "Finanzaufwand": "financial_expense",
    "Liegenschaftsaufwand": "real_estate_expense",
    "Betriebsertrag": "operating_income",
    "Finanzertrag": "financial_income",
    "Liegenschaftsertrag": "real_estate_income"
}

Array.from(document.getElementsByClassName("accountButton")).forEach(button => {
    button.addEventListener("click", (event)=>{
        const formulaField = document.getElementById("formulaField")
        formulaField.value += translations[event.currentTarget.innerText]
    })
})

Array.from(document.getElementsByClassName("operatorButton")).forEach(button => {
    button.addEventListener("click", (event)=>{
        const operator = event.currentTarget.innerText
        const formulaField = document.getElementById("formulaField")
        formulaField.value += operator
    })
})
