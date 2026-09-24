const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const relative = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'always' })
const DAY_MS = 24 * 60 * 60 * 1000

export function formatSalary(value) {
    return value == null ? 'A combinar' : currency.format(value)
}

export function formatCompany(value) {
    return value || 'Empresa confidencial'
}

export function formatPositions(count) {
    return `${count} ${count === 1 ? 'posição' : 'posições'}`
}

// "Publicada hoje", "Publicada há 1 dia", "Publicada há 3 semanas"...
export function formatPublished(value) {
    const days = Math.max(Math.floor((Date.now() - new Date(value).getTime()) / DAY_MS), 0)
    if (days === 0) return 'Publicada hoje'
    if (days < 7) return `Publicada ${relative.format(-days, 'day')}`
    if (days < 30) return `Publicada ${relative.format(-Math.floor(days / 7), 'week')}`
    if (days < 365) return `Publicada ${relative.format(-Math.floor(days / 30), 'month')}`
    return `Publicada ${relative.format(-Math.floor(days / 365), 'year')}`
}

export function splitLines(text) {
    return (text || '').split('\n').map((line) => line.trim()).filter(Boolean)
}
