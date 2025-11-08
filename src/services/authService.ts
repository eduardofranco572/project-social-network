type SignUpData = {
  nome: string;
  email: string;
  senha: string;
  imagem: File | null;
};

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