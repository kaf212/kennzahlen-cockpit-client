import {handleServerResponse, addInfoBoxEventListener} from "./serverResponseHandling.js"

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
    /*
    Adds the necessary EventListeners to the buttons that switch between
    the tabs containing the account buttons (actives, passives etc.)
    The EventListeners get triggered with a click and then iterate over all the four tabs and hides them
    except the one that contains the accounts of the given account group. For example: a press on the "Aktiven" button
    will hide all tabs except the actives tab. The link between the buttons and the tabs is created with the
    data-account-group attribute in the HTML-tab-elements.
    :param: none
    :return: void
     */
    Array.from(document.getElementsByClassName("tab-button")).forEach(tabButton=>{
        tabButton.addEventListener( "click",(event) =>{
            /*
            When a tab button is clicked, it iterates over all tabs and adds the invisible class
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
    /*
    Iterates over all account groups and iterates again over all the nested accounts in said account group and adds
    a HTML element of a button for this account to the respective account tab in the custom figure builder.
    :param: none
    :return: void
     */
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
    /*
    Iterates over all english account names in the translations object and checks, if they are a substring of the
    provided formula string. If yes, then the substring is replaced with the corresponding german translation from the
    translations object.
    At the end, all whitespaces are removed from the formula to make it processable in the backend.
    :param: formulaStr (str): The german formula provided by the UI in the formula field
    :return: formulaStr (str): The translated formula without whitespaces
     */
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

function reverseParseFormulaString(formulaStr) {
    /**
     * Translates english account names in the formula string to their german translations
     * using the translations object and re-adds the missing whitespaces in front
     *
     * @param {string} formulaStr - The formula string with english accounts
     * @returns {string} - The formula string translated into german with whitespaces
     */

    for (const [accountGroup, accounts] of Object.entries(translations)) {
        for (const [germanAccount, englishAccount] of Object.entries(accounts)) {
            if (formulaStr.includes(englishAccount)) {
                // Replace English account name with German translation
                formulaStr = formulaStr.replace(new RegExp(englishAccount, 'g'), germanAccount)
            }
        }
    }

    // Add whitespace before and after arithmetic operators
    const operators = ["+", "-", "*", "/"]
    let result = ""

    for (let i = 0; i < formulaStr.length; i++) {
        const char = formulaStr[i]
        if (operators.includes(char)) {
            result += ` ${char} ` // Add whitespace before and after the operator
        } else {
            result += char // Add the character without any whitespaces
        }
    }

    formulaStr = result

    return formulaStr
}

function addSubmitEventListener() {
    /*
    Adds the EventListener to the custom figure builder form that gets triggered with the form submit.
    Upon submitting, the formula string is read from the formula field in the UI and passed to parseFormulaString()
    The parsed result is then passed to saveNewCustomKeyFigure() to be sent to the server.
    :param: none
    :return: void
     */
    const formulaField = document.getElementById("formulaField")
    const customFigureBuilderForm = document.getElementById("customFigureBuilderForm")
    customFigureBuilderForm.addEventListener("submit", (event)=>{
        const parsedFormula = parseFormulaString(formulaField.value)
        const formulaName = document.getElementById("formulaNameField").value
        saveNewCustomKeyFigure(formulaName, parsedFormula)
        event.preventDefault() // Prevent page from refreshing
        document.getElementById("customFigureBuilderForm").reset()
    })
}



function saveNewCustomKeyFigure(formulaName, formulaStr) {
    /*
    Sends a POST request to the backend to save the new custom key figure on the server.
    The response is then passed to handleServerResponse() to display the success or error message in the UI.
    :param: formulaName (str): The name of the new custom key figure
    :param: formulaStr (str): The translated formula
    :return: void
     */
    // Causes NetworkError in firefox for some reason. (https://github.com/kaf212/kennzahlen-cockpit-client/issues/7)
    fetch("http://localhost:5000/customKeyFigures", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name: formulaName, formula: formulaStr})
    })
        .then(res=>handleServerResponse(res))
        .catch(err=>console.error(err))
}

async function getCustomKeyFigures() {
    try {
        const response = await fetch("http://localhost:5000/customKeyFigures", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        const data = await response.json()
        return data
    } catch (err) {
        console.error("Error fetching custom key figures:", err)
        return undefined
    }
}

async function loadSidebar() {
    const customKeyFigures = await getCustomKeyFigures()
    if (customKeyFigures) {
        const sidebar = document.getElementById("customKeyFigureContainer")

        // Remove all custom key figures from the sidebar to avoid duplicates
        const itemsToRemove = sidebar.querySelectorAll(".sidebar-item")
        itemsToRemove.forEach(item => item.remove())

        customKeyFigures.forEach(customKeyFigure => {
            const reverseParsedFormula = reverseParseFormulaString(customKeyFigure.formula)
            const htmlToInsert = `<div class="sidebar-item" 
                                           data-custom-key-figure-id="${customKeyFigure._id}"
                                           data-custom-key-figure-name="${customKeyFigure.name}">
                                           <div class="sidebar-item-content-wrapper">
                                           <b>${customKeyFigure.name}</b>${reverseParsedFormula}
                                           </div>
                                           <button class="sidebar-delete-button">×</button>
                                           </div>`

            sidebar.innerHTML += htmlToInsert
        })
    }
    addCustomKeyFigureDeleteButtonEventListeners()

}

function deleteCustomKeyFigure(customKeyFigureId) {
    fetch("http://localhost:5000/customKeyFigures/" + customKeyFigureId, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    })
        .then(res=>handleServerResponse(res))
        .catch(err=>console.error(err))
}

function addCustomKeyFigureDeleteButtonEventListeners() {
    Array.from(document.getElementsByClassName("delete-custom-key-figure-button")).forEach(button => {
        button.addEventListener("click", (event)=>{
            const customKeyFigureItem = event.currentTarget.parentNode
            const customKeyFigureId = customKeyFigureItem.dataset.customKeyFigureId
            const customKeyFigureName = customKeyFigureItem.dataset.customKeyFigureName

            if (confirm(`Sind Sie sicher, dass sie die Custom-Kennzahl "${customKeyFigureName}" löschen wollen?`)) {
                deleteCustomKeyFigure(customKeyFigureId)
                customKeyFigureItem.remove()
            }

        })
    })
}



addTabButtonEventListeners()
createAccountButtons()
addButtonEventListeners()
addSubmitEventListener()
addInfoBoxEventListener(loadSidebar)
loadSidebar()

