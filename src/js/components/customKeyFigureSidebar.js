import {addInfoBoxEventListener, sendServerRequest} from "../utils/serverResponseHandling.js";
import {
    refreshReferenceValueTextField,
    translations
} from "../pages/customFigureBuilder.js";

function reverseParseFormulaString(formulaStr) {
    /**
     * Translates english account names in the formula string to their german translations
     * using the translations object and re-adds the missing whitespaces in front
     *
     * @param {string} formulaStr - The formula string with english accounts
     * @returns {string} - The formula string translated into german with whitespaces
     */

    formulaStr = reverseParseAnnualProfitAndLossFormulas(formulaStr)

    // Reverse-parse the formula by iterating over the translations object and replacing substrings.
    for (const [accountGroup, accounts] of Object.entries(translations)) {
        for (const [germanAccount, englishAccount] of Object.entries(accounts)) {
            if (formulaStr.includes(englishAccount)) {
                // Replace English account name with German translation
                formulaStr = formulaStr.replaceAll(new RegExp(englishAccount, 'g'), germanAccount)
            }
        }
    }

    // Add whitespace before and after arithmetic operators
    const operators = ["+", "-", "*", "/"]
    let result = ""

    // Iterate over all characters in the formula string and check if it's one of the arithmetic operators.
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


function reverseParseAnnualProfitAndLossFormulas(formulaStr) {
    /**
     * Before the formula is reverse-parsed, it has to be searched for the special annual profit or loss
     * formulas, because they would get destroyed during the regular reverse-parsing.
     * (They include the substrings "earnings" and "expense").
     * The function searches for the formula of annual loss and expense in the translations object
     * and substitutes all occurrences of "Jahresverlust" and "Jahresgewinn" in the provided formula string
     * with these formulas.
     */

    const annualProfitFormula = translations["expense"]["Jahresgewinn"]
    const annualLossFormula = translations["earnings"]["Jahresverlust"]

    if (formulaStr.includes(annualLossFormula)) {
        formulaStr = formulaStr.replaceAll(annualLossFormula, "Jahresverlust")
    }
    if (formulaStr.includes(annualProfitFormula)) {
        formulaStr = formulaStr.replaceAll(annualProfitFormula, "Jahresgewinn")
    }

    return formulaStr
}

async function getCustomKeyFigures() {
    /**
     * Fetches all custom key figures from the API and returns them in JSON format.
     *
     * @returns {Array} An array of custom key figure objects
     */
    const data = await sendServerRequest("GET", "http://localhost:5000/api/customKeyFigures", null, false)
    return data
}

async function loadSidebar() {
    /**
     * Similar procedure as for the company sidebar, but not identical.
     * Gets all custom key figures from the API and iterates over them.
     * In each iteration, the formula of the custom key figure is still in machine-readable format and english,
     * so it is reverse-parsed back into the german human friendly format.
     * It creates an HTML element for each custom key figure in the sidebar and then
     * calls the following functions after the iteration:
     *  addCustomKeyFigureEventListeners() --> add eventListeners to the sidebar items
     *  addEndEditModeButtonEventListener() --> make the "end edit mode" button functional
     *  addCustomKeyFigureDeleteButtonEventListeners() --> make the delete buttons in the sidebar functional
     *
     *  @returns {void}
     */
    const customKeyFigures = await getCustomKeyFigures()
    if (customKeyFigures) {
        const sidebar = document.getElementById("customKeyFigureContainer")

        // Remove all custom key figures from the sidebar to avoid duplicates
        const itemsToRemove = sidebar.querySelectorAll(".sidebar-item")
        itemsToRemove.forEach(item => item.remove())

        customKeyFigures.forEach(customKeyFigure => {

            const reverseParsedFormula = reverseParseFormulaString(customKeyFigure.formula)
            const div = document.createElement("div")
            div.className = "sidebar-item"
            // The custom key figure's id and name are stored inside the HTML element's dataset.
            div.dataset.customKeyFigureId = customKeyFigure._id
            div.dataset.customKeyFigureName = customKeyFigure.name

            const innerDiv = document.createElement("div")
            innerDiv.className = "sidebar-item-content-wrapper"

            const bold = document.createElement("b")
            bold.textContent = customKeyFigure.name

            innerDiv.appendChild(bold)

            const formulaSpan = document.createElement("span")
            formulaSpan.textContent = reverseParsedFormula

            innerDiv.appendChild(formulaSpan)

            const button = document.createElement("button")
            button.className = "sidebar-delete-button"
            button.textContent = "×"

            div.appendChild(innerDiv)
            div.appendChild(button)

            sidebar.appendChild(div)
        })
    }
    addCustomKeyFigureEventListeners()
    addEndEditModeButtonEventListener()
    addCustomKeyFigureDeleteButtonEventListeners()

}

function deleteCustomKeyFigure(customKeyFigureId) {
    /**
     * Sends a DELETE request to the API with the provided custom key figure id.
     * @param {String} customKeyFigureId - The id of the custom key figure that is to be deleted
     * @return {void}
     */
    const url = "http://localhost:5000/api/customKeyFigures/" + customKeyFigureId
    sendServerRequest("DELETE", url, null, false)
}

async function editCustomKeyFigure(customKeyFigureId) {
    /**
     * Fetches the custom key figure with the provided id from the API and loads all of its attributes
     * into the custom key figure editor, so that these can be modified by the user.
     *
     * @param {String} customKeyFigureId - The id of the custom key figure that is to be edited
     * @returns {void}
     */
    const customKeyFigure = await sendServerRequest("GET", `http://localhost:5000/api/customKeyFigures/${customKeyFigureId}`, null, false)

    const nameField = document.getElementById("formulaNameField")
    const formulaField = document.getElementById("formulaField")
    const referenceValueFiled = document.getElementById("referenceValueTextField")

    nameField.value = customKeyFigure.name

    // Reverse parse the formula back into german, human friendly format
    formulaField.value = reverseParseFormulaString(customKeyFigure.formula)

    // If the custom key figure doesn't have the property "reference_value" or its content is "-":
    if (!customKeyFigure.hasOwnProperty("reference_value") || customKeyFigure.reference_value === "-") {
        // Set the reference value radio buttons to deactivated
        document.getElementById("referenceValueDeactivated").checked = true
        // If the custom key figure does not have a reference value, set the text field to deactivated
        refreshReferenceValueTextField()
    } else {
        // Set the reference value radio buttons to activated
        document.getElementById("referenceValueActivated").checked = true
        // Enable the reference value text field
        refreshReferenceValueTextField()
        // Insert the reference value into the text field if the custom key figure has one
        referenceValueFiled.value = customKeyFigure.reference_value
    }

    // Sets the selected type radio button to "percentage" as default
    let typeRadioButton = document.getElementById("customKeyFigureTypePercentage")

    // If the type is "numeric", set selected type radio button to numeric
    if (customKeyFigure.type === "numeric") {
        typeRadioButton = document.getElementById("customKeyFigureTypeNumeric")
    }

    // Mark the corresponding type radio button as checked
    typeRadioButton.checked = true

}

function addCustomKeyFigureDeleteButtonEventListeners() {
    /**
     * Iterates over all delete buttons in the custom key figure sidebar and adds a click-eventListener.
     * When triggered, it reads the custom key figure's id and name from the sidebar element's dataset
     * and deletes it via the API after user confirmation.
     *
     */
    Array.from(document.getElementsByClassName("sidebar-delete-button")).forEach(button => {
        button.addEventListener("click", (event)=>{
            // The sidebar element is the parent of the delete button
            const customKeyFigureItem = event.currentTarget.parentNode
            // reads the custom key figure's id and name from the sidebar element's dataset
            const customKeyFigureId = customKeyFigureItem.dataset.customKeyFigureId
            const customKeyFigureName = customKeyFigureItem.dataset.customKeyFigureName

            if (confirm(`Sind Sie sicher, dass Sie die Custom-Kennzahl "${customKeyFigureName}" löschen wollen?`)) {
                deleteCustomKeyFigure(customKeyFigureId)
                customKeyFigureItem.remove()
            }

        })
    })
}

export function endEditMode() {
    /**
     * Takes the custom key figure builder out of the edit mode, so that it functions in the regular
     * POST mode again.
     *
     * @returns {void}
     */
    const endEditModeButton = document.getElementById("endEditModeButton")

    const url = new URL(window.location.href)
    // Delete the "editMode" URL parameter
    url.searchParams.delete("editMode")
    window.history.replaceState(null, '', url.toString())

    // Make the "end edit mode" button invisible
    endEditModeButton.classList.add("invisible")

    // Remove the selected item class from whatever key figure has it
    Array.from(document.getElementsByClassName("sidebar-item")).forEach(item => {
        item.classList.remove("selected-sidebar-item")
    })

    const customKeyFigureForm = document.getElementById("customFigureBuilderForm")
    // Reset the custom key figure builder form
    customKeyFigureForm.reset()

    const pageHeader = document.getElementById("customKeyFigureBuilderHeader")
    // Reset the page's header back to the default title
    pageHeader.innerText = "Neue Kennzahl erstellen"

    // Set the reference value text field back to default
    refreshReferenceValueTextField()
}

function setPageToEditMode(customKeyFigureId, customKeyFigureName, sidebarItem) {
    /**
     * Sets the custom key figure builder into edit mode. This means, that it will send a PATCH
     * request for the selected custom key figure upon submit.
     */
    // Remove the edit-mode class from all other sidebar items
    Array.from(document.getElementsByClassName("sidebar-item")).forEach(item => {
        item.classList.remove("selected-sidebar-item")
    })

    sidebarItem.classList.add("selected-sidebar-item")

    const pageHeader = document.getElementById("customKeyFigureBuilderHeader")
    // Change the page's header to "[custom key figure name] bearbeiten"
    pageHeader.innerText = `${customKeyFigureName} bearbeiten`

    const url = new URL(window.location.href)
    // Set the editMode URL parameter to true
    url.searchParams.set('editMode', 'true')
    // Set the id of the currently selected custom key figure in URL param "id"
    url.searchParams.set('id', customKeyFigureId)
    window.history.replaceState(null, '', url.toString())

    // Make the "end edit mode" button visible
    const endEditModeButton = document.getElementById("endEditModeButton")
    endEditModeButton.classList.remove("invisible")
}



function addCustomKeyFigureEventListeners() {
    /**
     * Iterates over all custom key figure sidebar elements and adds a click-eventListener
     * to its content-wrapper (the container, that contains the name and the formula).
     * When triggered, this eventListener reads the custom key figure's id and name from the element's
     * dataset and passes them to editCustomKeyFigure(), which loads the custom key figure's data into
     * the editor, so that it can be edited.
     * Then, the page is set to edit mode with setPageToEditMode()
     *
     * @returns {void}
     */
    Array.from(document.getElementsByClassName("sidebar-item-content-wrapper")).forEach(item => {
        item.addEventListener("click", async (event)=>{
            // Read the custom key figure id and name from the sidebar element's dataset
            // (the parent of the content-wrapper)
            const customKeyFigureId = event.currentTarget.parentNode.dataset.customKeyFigureId
            const customKeyFigureName = event.currentTarget.parentNode.dataset.customKeyFigureName
            await editCustomKeyFigure(customKeyFigureId)

            setPageToEditMode(customKeyFigureId, customKeyFigureName, item.parentNode)

        })
    })
}

function addEndEditModeButtonEventListener() {
    /**
     * Adds a click-eventListener to the "end edit mode" button that calls endEditMode() when triggered.
     *
     * @returns {void}
     */
    const endEditModeButton = document.getElementById("endEditModeButton")
    endEditModeButton.addEventListener("click", endEditMode)
}

addInfoBoxEventListener(loadSidebar)
loadSidebar()