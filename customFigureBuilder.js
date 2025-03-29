const translations = {
    "actives": {
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
        "Immobilien": "real_estate"
    },
    "passives": {
        "Fremdkapital": "debt",
        "Kurzfristiges FK": "short_term",
        "Verb. L+L": "liabilities",
        "Langfristiges FK": "long_term",
        "Passivdarlehen": "loans",
        "Hypothek": "mortgage",
        "Eigenkapital": "equity",
        "Aktienkapital": "shares",
        "Ges. Gewinnreserve": "legal_reserve",
        "Gewinnvortrag": "retained_earnings"
    },
   "expense": {
       "Betriebsaufwand": "operating_expense",
       "Personalaufwand": "staff_expense",
       "Sonstiger BA": "other_expenses",
       "Abschreibungen": "depreciation",
       "Finanzaufwand": "financial_expense",
       "Liegenschaftsaufwand": "real_estate_expense"
   },
    "earnings": {
        "Betriebsertrag": "operating_income",
        "Finanzertrag": "financial_income",
        "Liegenschaftsertrag": "real_estate_income"
    }
}

function addTabButtonEventListeners() {
    Array.from(document.getElementsByClassName("tab-button")).forEach(tabButton=>{
        tabButton.addEventListener( "click",(event) =>{
            /*
            When a tab button is clicked, it iterates over all tab buttons and adds the invisible class
            except for the account group that corresponds to the given button
             */
            Array.from(document.getElementsByClassName("custom-figure-builder-tab")).forEach(tab=>{
                // if the account group of the button is the same as the one of the tab:
                if (tab.dataset.accountGroup !== event.currentTarget.dataset.accountGroup) {
                    tab.classList.add("invisible")
                }
                else {
                    tab.classList.remove("invisible") // All other tabs should remain or be made invisible
                }
            })
        })
    })
}



function createAccountButtons() {
    for (const [accountGroup, accounts] of Object.entries(translations)) {
        for (const [germanAccount, englishAccount] of Object.entries(accounts)) {
            const targetAccountButtonDiv = `${accountGroup}Tab` // Is equal to the id of the account button divs
            const buttonHtml = `<button class='accountButton' data-translation="${englishAccount}">${germanAccount}</button>`

            document.getElementById(targetAccountButtonDiv).innerHTML += buttonHtml
        }
    }
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
            event.preventDefault() // buttons inside the form would else automatically trigger a submit when pressed
            formulaField.value += button.innerText
        })
    })

    // Add eventListeners to all operator buttons
    Array.from(document.getElementsByClassName("operator-button")).forEach(button => {
        button.addEventListener("click", (event)=>{
            event.preventDefault()
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
    for (const [accountGroup, accounts] of Object.entries(translations)) {
        for (const [germanAccount, englishAccount] of Object.entries(accounts)) {
            if (formulaStr.includes(germanAccount)) {
                // replace german account name with english translation
                formulaStr = formulaStr.replace(germanAccount, englishAccount)
            }
        }
    }


    // Source: https://stackoverflow.com/questions/10800355/remove-whitespaces-inside-a-string-in-javascript
    formulaStr = formulaStr.replace(/\s+/g, "") // remove all whitespaces from the formula

    return formulaStr
}

function addSubmitEventListener() {
    const formulaField = document.getElementById("formulaField")
    const submitButton = document.getElementById("submitCustomFigureButton")
    submitButton.addEventListener("click", (event)=>{
        event.preventDefault()
        console.log(parseFormulaString(formulaField.value))
    })
}

addTabButtonEventListeners()
createAccountButtons()
addButtonEventListeners()
addSubmitEventListener()
