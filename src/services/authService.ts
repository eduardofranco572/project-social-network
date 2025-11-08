type SignUpData = {
  nome: string;
  email: string;
  senha: string;
  imagem: File | null;
};

/**
 * Função para CADASTRAR um novo usuário.
 * @param data - Os dados do usuário (nome, email, senha, imagem).
 * @returns A resposta da requisição fetch.
 */
export const signUp = async (data: SignUpData) => {
  const formData = new FormData();
  formData.append('nome', data.nome);
  formData.append('email', data.email);
  formData.append('senha', data.senha);

  if (data.imagem) {
    formData.append('imagem', data.imagem);
  }

  const response = await fetch('/api/users', {
    method: 'POST',
    body: formData,
  });

  return response;
};

type SignInData = {
  email: string;
  senha: string;
}

/**
 * Função para LOGAR um usuário.
 * @param data - Os dados do usuário (email, senha).
 * @returns A resposta da requisição fetch.
 */
export const signIn = async (data: SignInData) => {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response;
};