import Link from 'next/link';

export default function CadastroPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="p-8 bg-gray-800 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center mb-6">Criar Conta</h1>
        <p className="text-center mt-4">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}