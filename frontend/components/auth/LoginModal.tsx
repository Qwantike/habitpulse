import React, { useState } from "react";
import { login } from '../../services/authApi';
import { User } from "../../types";

interface LoginModalProps {
    onLogin: (user: User) => void;  // ✅ onSuccess → onLogin
    switchToRegister: () => void;    // ✅ onGoRegister → switchToRegister
}

const LoginModal: React.FC<LoginModalProps> = ({
    onLogin,
    switchToRegister,
}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { user } = await login(email, password);
            onLogin(user);  // ✅ Appel correct
        } catch (err) {
            setError("Email ou mot de passe incorrect");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border dark:border-slate-700">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
                    Connexion
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />

                    <input
                        type="password"
                        placeholder="Mot de passe"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
                    >
                        {loading ? "Connexion..." : "Se connecter"}
                    </button>
                </form>

                <p className="text-sm text-center mt-6 text-gray-500 dark:text-slate-400">
                    Pas encore de compte ?{" "}
                    <button
                        onClick={switchToRegister}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                        S'inscrire
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginModal;
