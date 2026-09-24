const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function request(path, token, { method = 'GET', body } = {}) {
    let response
    const headers = { Authorization: `Bearer ${token}` }
    if (body !== undefined) headers['Content-Type'] = 'application/json'

    try {
        response = await fetch(`${apiUrl}${path}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
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
        // Per-field validation messages, when the API sends them (HTTP 400).
        error.fields = data.errors || {}
        throw error
    }

    return data
}

export function listApplications(token, { limit = 20, offset = 0, vagaId } = {}) {
    const vaga = vagaId ? `&vaga_id=${vagaId}` : ''
    return request(`/api/applications?limit=${limit}&offset=${offset}${vaga}`, token)
}

export function getApplication(token, id) {
    return request(`/api/applications/${id}`, token)
}

export function getResumeLink(token, id) {
    return request(`/api/applications/${id}/resume`, token)
}

export function listJobs(token) {
    return request('/api/recruiter/jobs', token)
}

export function getJob(token, id) {
    return request(`/api/recruiter/jobs/${id}`, token)
}

export function createJob(token, job) {
    return request('/api/recruiter/jobs', token, { method: 'POST', body: job })
}

export function updateJob(token, id, job) {
    return request(`/api/recruiter/jobs/${id}`, token, { method: 'PUT', body: job })
}

export function setJobStatus(token, id, status) {
    return request(`/api/recruiter/jobs/${id}/status`, token, { method: 'PATCH', body: { status } })
}
