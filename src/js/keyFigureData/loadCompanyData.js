import {sendServerRequest} from "../utils/serverResponseHandling.js"

export function getCurrentKeyFigureData() {
    const params = new URLSearchParams(window.location.search);
    const companyId = params.get('id');
    if (!companyId) return;

    const keyFigureData = sendServerRequest("GET", `/api/keyFigures/current/${companyId}`, null, false);
    return keyFigureData;
}
export async function loadHistoricKeyFigures(companyId) {
    try {
        const response = await fetch(`/api/keyFigures/historic/${companyId}`);
        if (!response.ok) {
            throw new Error("Fehler beim Laden historischer Daten");
        }
        return await response.json();
    } catch (error) {
        console.error("Fehler beim Laden der historischen Kennzahlen:", error);
        return null;
    }
}

