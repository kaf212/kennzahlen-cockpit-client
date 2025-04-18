import {addInfoBoxEventListener, sendServerRequest} from "../utils/serverResponseHandling.js";
import {translations} from "../pages/customFigureBuilder.js";

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


async function getCustomKeyFigures() {
    const data = await sendServerRequest("GET", "http://localhost:5000/customKeyFigures", null, false)
    return data
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
    const url = "http://localhost:5000/customKeyFigures/" + customKeyFigureId
    sendServerRequest("DELETE", url, null, false)
}

function addCustomKeyFigureDeleteButtonEventListeners() {
    Array.from(document.getElementsByClassName("sidebar-delete-button")).forEach(button => {
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

addInfoBoxEventListener(loadSidebar)
loadSidebar()