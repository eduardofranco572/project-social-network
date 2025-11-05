"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Swal from 'sweetalert2';

import { useAuth } from '@/src/hooks/useAuth';

type AuthMode = 'login' | 'signup';

export default function AuthForm({ initialMode }: { initialMode: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  const { signUp, isLoading, error: authError } = useAuth();
  
  useEffect(() => {
    if (authError) {
      Swal.fire({
        icon: 'error',
        title: 'Erro no Cadastro',
        text: authError,
        background: '#1c1c1c',
        color: '#ffffff'    
      });
    }
  }, [authError]);

  const handleLogin = async () => {
    
  };

  const handleSignup = async () => {
    const success = await signUp({ nome, email, senha });

    if (success) {
      Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: 'Cadastro realizado com sucesso! Faça o login.',
        background: '#1c1c1c',
        color: '#ffffff'
      });
      
      setMode('login'); 
      
      setNome('');
      setEmail('');
      setSenha('');
    }

  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          {mode === 'signup' && (
            <div>
              <label htmlFor="nome" className='text-sm'>Nome</label>

              <Input
                id="nome" type="text" value={nome}
                onChange={(e) => setNome(e.target.value)}
                required className="mt-1 h-10 bg-neutral-800 border-neutral-700 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Seu nome completo"
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className='text-sm'>Email</label>

            <Input
              id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              required className="mt-1 h-10 bg-neutral-800 border-neutral-700 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="seuemail@exemplo.com"
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="btn-auth w-full h-10 bg-white text-black hover:bg-neutral-200" disabled={isLoading}>
            {isLoading ? 'Carregando...' : (mode === 'login' ? 'Entrar' : 'Criar Conta')}
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}