const HEADER_OFFSET = 72 // fixed header height

export function scrollToSection(selector) {
    const target = document.querySelector(selector)
    if (!target) return
    const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
    window.scrollTo({ top, behavior: 'smooth' })
}
