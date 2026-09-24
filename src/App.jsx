import { useCallback, useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Services from './components/Services'
import Team from './components/Team'
import Jobs from './components/Jobs'
import ResumeForm from './components/ResumeForm'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { scrollToSection } from './utils/scrollToSection'

function App() {
    // Opening the resume form is linked to, chosen via "Candidatar-se" in the Vagas section.
    const [selectedJob, setSelectedJob] = useState(null)

    const handleApply = useCallback((job) => {
        setSelectedJob(job)
        // Wait for the modal to unmount (and release the scroll lock) before scrolling.
        requestAnimationFrame(() => scrollToSection('#curriculos'))
    }, [])

    const clearJob = useCallback(() => setSelectedJob(null), [])

    return (
        <div className="min-h-screen">
            <Header />
            <main>
                <Hero />
                <Services />
                <Team />
                <Jobs onApply={handleApply} />
                <ResumeForm job={selectedJob} onClearJob={clearJob} />
                <Contact />
            </main>
            <Footer />
        </div>
    )
}

export default App
