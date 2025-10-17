"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type AuthMode = 'login' | 'signup';

export default function AuthForm({ initialMode }: { initialMode: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
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

  const handleSignup = async () => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha }),
    });

    if (response.ok) {
      setMode('login');
      setError('');

    } else {
      const data = await response.json();
      setError(data.message || 'Falha no cadastro.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      await handleLogin();

    } else {
      await handleSignup();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-[#1c1c1c] border-0 shadow-none text-white">
      <CardContent className="pt-6">
        <h1 className="text-2xl font-bold mb-6">Rede Social</h1>

        <div className="flex bg-neutral-800 rounded-lg p-1 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`w-1/2 p-2 text-center rounded-md text-sm font-medium transition-colors ${mode === 'login' ? 'bg-white text-black' : 'hover:bg-neutral-700'}`}
          >
            Sign In
          </button>

          <button
            onClick={() => setMode('signup')}
            className={`w-1/2 p-2 text-center rounded-md text-sm font-medium transition-colors ${mode === 'signup' ? 'bg-white text-black' : 'hover:bg-neutral-700'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col gap-2'>
          {mode === 'signup' && (
            <div className="mb-4">
              <label htmlFor="nome" className='text-sm'>Nome</label>

              <Input
                id="nome" type="text" value={nome}
                onChange={(e) => setNome(e.target.value)}
                required className="mt-1 h-10 bg-neutral-800 border-neutral-700 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Seu nome completo"
              />
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className='text-sm'>Email</label>

            <Input
              id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              required className="mt-1 h-10 bg-neutral-800 border-neutral-700 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="seuemail@exemplo.com"
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center">
              <label htmlFor="senha" className='text-sm'>Senha</label>

              {mode === 'login' && (
                <Link href="/esqueci-senha" className="text-xs text-neutral-400 hover:underline">
                  Esqueceu a senha?
                </Link>
              )}
            </div>

            <Input
              id="senha" type="password" value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required className="mt-1 h-10 bg-neutral-800 border-neutral-700 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder={mode === 'login' ? "********" : "Crie uma senha forte"}
            />
          </div>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <Button type="submit" className="btn-auth w-full h-10 bg-white text-black hover:bg-neutral-200">
            {mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </Button>

        </form>

      </CardContent>
    </Card>
  );
}