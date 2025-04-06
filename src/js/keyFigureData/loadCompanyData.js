

function loadCompanyData() {
    const params = new URLSearchParams(window.location.search)
    const companyId = params.get('id')
    if (!companyId) {
        return null
    }

    fetch(`http://localhost:5000/keyFigures/current/${companyId}`)
        .then(response => {
            return response.json()
        })
        .then(data => console.log(data))
        .catch(error => console.error(error))
}

loadCompanyData()