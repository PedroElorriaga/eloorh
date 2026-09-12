const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function request(path, token) {
    let response

    try {
        response = await fetch(`${apiUrl}${path}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
    } catch {
        // fetch only throws like this when the request never reached the API:
        // server down, wrong VITE_API_URL, or no network.
        throw new Error(`Não foi possível falar com a API em ${apiUrl}. Verifique se ela está no ar.`)
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
        const error = new Error(data.message || 'Não foi possível carregar os dados.')
        error.status = response.status
        throw error
    }

    return data
}

export function listApplications(token, { limit = 20, offset = 0 } = {}) {
    return request(`/api/applications?limit=${limit}&offset=${offset}`, token)
}

export function getApplication(token, id) {
    return request(`/api/applications/${id}`, token)
}

export function getResumeLink(token, id) {
    return request(`/api/applications/${id}/resume`, token)
}
