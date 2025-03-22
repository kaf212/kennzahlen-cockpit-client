const translations = {
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
    "Sonstiger BA": "other_expenses",
    "Abschreibungen": "depreciation",
    "Finanzaufwand": "financial_expense",
    "Liegenschaftsaufwand": "real_estate_expense",
    "Betriebsertrag": "operating_income",
    "Finanzertrag": "financial_income",
    "Liegenschaftsertrag": "real_estate_income"
}

const formulaField = document.getElementById("formulaField")


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

function parseFormulaString(formulaStr) {
    for (let germanAccountName in translations) {
        if (formulaStr.includes(germanAccountName)) {
            // replace german account name with english translation
            formulaStr = formulaStr.replace(germanAccountName, translations[germanAccountName])
        }
    }

    // Source: https://stackoverflow.com/questions/10800355/remove-whitespaces-inside-a-string-in-javascript
    formulaStr = formulaStr.replace(/\s+/g, "") // remove all whitespaces from the formula

    return formulaStr
}

function addSubmitEventListener() {
    const submitButton = document.getElementById("submitCustomFigure")
    submitButton.addEventListener("click", (event)=>{
        console.log(parseFormulaString(formulaField.value))
    })
}

addButtonEventListeners()
addSubmitEventListener()
