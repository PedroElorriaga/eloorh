import { useState } from 'react'
import { LogIn, AlertCircle, MailCheck } from 'lucide-react'
import { supabase } from './supabaseClient'

export default function SignIn() {
    const [mode, setMode] = useState('signin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [recoverySent, setRecoverySent] = useState(false)
    const [isBusy, setIsBusy] = useState(false)

    const handleSignIn = async (e) => {
        e.preventDefault()
        setError('')
        setIsBusy(true)

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        })

        setIsBusy(false)

        if (signInError) {
            // Deliberately generic: never reveal whether the address has an account.
            setError('E-mail ou senha inválidos.')
        }
        // On success the session listener in Panel.jsx swaps this view out.
    }

    const handleRecovery = async (e) => {
        e.preventDefault()
        setError('')
        setIsBusy(true)

        await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/painel.html`,
        })

        setIsBusy(false)
        // Always the same confirmation, whether or not the account exists.
        setRecoverySent(true)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-800 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white">Painel de Candidaturas</h1>
                    <p className="text-primary-200 text-sm mt-2">Acesso restrito à equipe de recrutamento.</p>
                </div>

                <div className="bg-white rounded-2xl p-8">
                    {recoverySent ? (
                        <div className="flex flex-col items-center text-center gap-4 py-4">
                            <MailCheck size={48} className="text-green-500" />
                            <h2 className="text-lg font-bold text-primary-800">Verifique seu e-mail</h2>
                            <p className="text-slate-500 text-sm">
                                Se houver uma conta com esse endereço, enviamos um link para redefinir a senha.
                            </p>
                            <button
                                type="button"
                                className="btn-outline mt-2"
                                onClick={() => {
                                    setRecoverySent(false)
                                    setMode('signin')
                                    setPassword('')
                                }}
                            >
                                Voltar ao login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={mode === 'signin' ? handleSignIn : handleRecovery} className="space-y-5">
                            <div>
                                <label className="form-label" htmlFor="p-email">E-mail</label>
                                <input
                                    id="p-email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    placeholder="voce@eloorh.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="form-input"
                                />
                            </div>

                            {mode === 'signin' && (
                                <div>
                                    <label className="form-label" htmlFor="p-senha">Senha</label>
                                    <input
                                        id="p-senha"
                                        type="password"
                                        required
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                            )}

                            {error && (
                                <p className="flex items-center gap-2 text-sm text-red-600">
                                    <AlertCircle size={16} /> {error}
                                </p>
                            )}

                            <button type="submit" className="btn-primary w-full justify-center" disabled={isBusy}>
                                {isBusy ? 'Aguarde...' : mode === 'signin' ? (<><LogIn size={18} /> Entrar</>) : 'Enviar link de recuperação'}
                            </button>

                            <button
                                type="button"
                                className="w-full text-sm text-primary-700 hover:underline"
                                onClick={() => {
                                    setMode(mode === 'signin' ? 'recovery' : 'signin')
                                    setError('')
                                }}
                            >
                                {mode === 'signin' ? 'Esqueci minha senha' : 'Voltar ao login'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
