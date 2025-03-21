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

const accountButtonDiv = document.getElementById("accountButtons")
for (let acc in translations) {
    const buttonHtml = `<button class='accountButton'>${acc}</button>`
    accountButtonDiv.innerHTML += buttonHtml
}

function addButtonEventListeners() {
    /*
    Adds the necessary eventListeners to all input buttons in the custom figure builder which
    insert the respective button's value into the text field for the formula when triggered.
     */
    const formulaField = document.getElementById("formulaField")

    // Add eventListeners to all account buttons
    Array.from(document.getElementsByClassName("accountButton")).forEach(button => {
        button.addEventListener("click", (event)=>{
            formulaField.value += button.innerText
        })
    })

    // Add eventListeners to all operator buttons
    Array.from(document.getElementsByClassName("operatorButton")).forEach(button => {
        button.addEventListener("click", (event)=>{
            const operator = event.currentTarget.innerText
            let strToInsert = ""
            if (operator === "(" || operator === ")") {
                strToInsert = operator // insert parentheses without any whitespace
            }
            else {
                strToInsert = " " + operator + " "
                // insert all other arithmetic operators with whitespaces before and after them
            }

            formulaField.value += strToInsert
        })
    })
}

addButtonEventListeners()

