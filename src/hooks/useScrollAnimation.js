import { useEffect, useRef } from 'react'

/**
 * Attach to a container ref. Any child with class `animate-on-scroll`
 * will get the `visible` class once it enters the viewport.
 */
export function useScrollAnimation() {
  const ref = useRef(null)

  useEffect(() => {
    const elements = ref.current?.querySelectorAll('.animate-on-scroll') ?? []

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 },
    )

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return ref
}
