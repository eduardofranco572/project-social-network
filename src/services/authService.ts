type SignUpData = {
  nome: string;
  email: string;
  senha: string;
};

/**
 * Função para cadastrar um novo usuário.
 * @param data - Os dados do usuário (nome, email, senha).
 * @returns A resposta da requisição fetch.
 */
export const signUp = async (data: SignUpData) => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response;
};