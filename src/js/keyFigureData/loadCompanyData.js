import {sendServerRequest} from "../utils/serverResponseHandling.js"

export function getCurrentKeyFigureData() {
    const params = new URLSearchParams(window.location.search);
    const companyId = params.get('id');
    if (!companyId) return;

    const keyFigureData = sendServerRequest("GET", `http://localhost:5000/api/keyFigures/current/${companyId}`, null, false);
    return keyFigureData;
}
