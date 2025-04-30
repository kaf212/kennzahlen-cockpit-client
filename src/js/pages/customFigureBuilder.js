import {sendServerRequest} from "../utils/serverResponseHandling.js";
import {endEditMode} from "../components/customKeyFigureSidebar.js"

export const translations = {
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
        "Immobilien": "active_real_estate"
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
        "Jahresgewinn": "earnings-expense",
       "Betriebsaufwand": "operating_expense",
       "Personalaufwand": "staff_expense",
       "Sonstiger BA": "other_expenses",
       "Abschreibungen": "depreciation",
       "Finanzaufwand": "financial_expense",
       "Liegenschaftsaufwand": "real_estate_expense",
       "Gesamtaufwand": "expense"
   },
    "earnings": {
        "Jahresverlust": "earnings-expense",
        "Betriebsertrag": "operating_income",
        "Finanzertrag": "financial_income",
        "Liegenschaftsertrag": "real_estate_income",
        "Gesamtertrag": "earnings"
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
                const tabAccountGroup = tab.dataset.accountGroup
                const clickedTabButton = event.currentTarget
                const clickedTabButtonAccountGroup = event.currentTarget.dataset.accountGroup
                // if the account group of the button is the same as the one of the tab:
                if (tabAccountGroup === clickedTabButtonAccountGroup) {
                    tab.classList.remove("invisible")

                    // Remove the "selected tab button" classes from the previously selected tab button
                    const previouslySelectedTabButton = document.querySelector(".selected-tab-button")
                    previouslySelectedTabButton.classList.remove("selected-tab-button-balance-sheet")
                    previouslySelectedTabButton.classList.remove("selected-tab-button-income-statement")
                    previouslySelectedTabButton.classList.remove("selected-tab-button")

                    // Add the "selected-tab-button" class to the newly selected tab button
                    clickedTabButton.classList.add("selected-tab-button")

                    // Add the corresponding "selected tab button" class to the tab button
                    if (clickedTabButtonAccountGroup === "actives" || clickedTabButtonAccountGroup === "passives") {
                        clickedTabButton.classList.add("selected-tab-button-balance-sheet")
                    } else {
                        clickedTabButton.classList.add("selected-tab-button-income-statement")
                    }
                }
                else {
                    tab.classList.add("invisible") // All other tabs should remain or be made invisible
                }
            })
        })
    })
}

export function refreshReferenceValueTextField() {
    const textField = document.getElementById("referenceValueTextField")
    const deactivatedRadioButton = document.getElementById("referenceValueDeactivated")

    if (deactivatedRadioButton.checked === true) {
        // If the "deactivated" button is checked, replace the contents with a "-"
        textField.value = "-"
        textField.disabled = true
    } else {
        // If the "activated" button is checked, the field should be empty
        textField.value = ""
        textField.disabled = false
    }
}

function addReferenceValueInputEventListeners() {
    const radioButtons = Array.from(document.getElementsByClassName("reference-value-radio-button"))
    radioButtons.forEach(radioButton => {
        radioButton.addEventListener("change", ()=> {
            const textField = document.getElementById("referenceValueTextField")
            if (textField.disabled) {
                textField.disabled = false
            } else {
                textField.disabled = true
            }

            refreshReferenceValueTextField()

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
            const buttonHtml = `<button class='account-button' data-translation="${englishAccount}">${germanAccount}</button>`

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
    Array.from(document.getElementsByClassName("account-button")).forEach(button => {
        button.addEventListener("click", (event)=>{
            event.preventDefault() // buttons inside the form would else automatically trigger a submit when pressed
            formulaField.value += button.innerText
        })
    })

    // Add eventListeners to all operator buttons
    Array.from(document.getElementsByClassName("operator-button")).forEach(button => {
        button.addEventListener("click", (event)=>{
            event.preventDefault()
            const operator = event.currentTarget.value
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

        // Source: https://chatgpt.com/share/68076901-26c4-8011-ae36-1ae4a76c50d3
        const customKeyFigureType = document.querySelector('input[name="customKeyFigureType"]:checked').value

        // The reference value is "-" when reference value is deactivated
        const referenceValue = document.getElementById("referenceValueTextField").value

        const url = new URL(window.location.href);
        const editModeEnabled = url.searchParams.get('editMode')

        if (editModeEnabled === "true") {
            const editedKeyFigureId = url.searchParams.get('id')
            patchCustomKeyFigure(editedKeyFigureId, formulaName, parsedFormula, customKeyFigureType, referenceValue)
        } else {
            saveNewCustomKeyFigure(formulaName, parsedFormula, customKeyFigureType, referenceValue)
        }

        event.preventDefault() // Prevent page from refreshing
        document.getElementById("customFigureBuilderForm").reset()
    })
}

async function saveNewCustomKeyFigure(formulaName, formulaStr, customKeyFigureType, referenceValue) {
    /*
    Sends a POST request to the backend to save the new custom key figure on the server.
    The response is then passed to handleServerResponse() to display the success or error message in the UI.
    :param: formulaName (str): The name of the new custom key figure
    :param: formulaStr (str): The translated formula
    :return: void
     */
    await sendServerRequest("POST", "http://localhost:5000/api/customKeyFigures", {
        name: formulaName,
        formula: formulaStr,
        type: customKeyFigureType,
        reference_value: referenceValue
    })
}

async function patchCustomKeyFigure(customKeyFigureId, formulaName, parsedFormula, customKeyFigureType, referenceValue) {
    const originalCustomKeyFigure = await sendServerRequest("GET", `http://localhost:5000/api/customKeyFigures/${customKeyFigureId}`, null, false)
    const updatedCustomKeyFigure = {
        "name": formulaName,
        "formula": parsedFormula,
        "type": customKeyFigureType,
        "reference_value": referenceValue
    }

    for (const [attribute, updatedValue] of Object.entries(updatedCustomKeyFigure)) {
        if (originalCustomKeyFigure[attribute] === updatedValue) {
            // Delete all attributes from the updated object that haven't been modified
            delete updatedCustomKeyFigure[attribute]
        }
    }

    if (Object.keys(updatedCustomKeyFigure).length === 0) {
        alert("Keine Werte wurden bearbeitet.")
        endEditMode()
        return null
    }

    await sendServerRequest("PATCH", `http://localhost:5000/api/customKeyFigures/${customKeyFigureId}`, updatedCustomKeyFigure, true)
    endEditMode()
}




addReferenceValueInputEventListeners()
addTabButtonEventListeners()
createAccountButtons()
addButtonEventListeners()
addSubmitEventListener()


