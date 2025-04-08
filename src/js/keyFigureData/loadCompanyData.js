document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const companyId = params.get('id');
    if (!companyId) return;

    fetch(`http://localhost:5000/keyFigures/current/${companyId}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.keyFigures) {
                insertKeyFiguresToTable(data);
            }
        })
        .catch(console.error);
});
