"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    if (response.ok) {
      router.push('/');
      router.refresh(); 
    } else {
      const data = await response.json();
      setError(data.message || 'Falha no login.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen text-white">
      <form onSubmit={handleSubmit} className="p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center mb-6">Entrar</h1>
        
        <div className="mb-4">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 mt-1 border border-gray-600 rounded"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full p-2 mt-1 border border-gray-600 rounded"
          />
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <button type="submit" className="w-full py-2 bg-black-600 rounded">
          Entrar
        </button>

        <p className="text-center mt-4">
          Não tem uma conta?{" "}
          <Link href="/cadastro" className="text-blue-400 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </form>
    </div>
  );
}