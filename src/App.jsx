import Header from './components/Header'
import Hero from './components/Hero'
import Services from './components/Services'
import Team from './components/Team'
import ResumeForm from './components/ResumeForm'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
    return (
        <div className="min-h-screen">
            <Header />
            <main>
                <Hero />
                <Services />
                <Team />
                <ResumeForm />
                <Contact />
            </main>
            <Footer />
        </div>
    )
}

export default App
