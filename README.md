# Chat

O Projeto de uma aplicação web de um chat de conversa em tempo real. Realizado para trabalho final das diciplinas de laboratório de banco de dados e de programação web.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído com uma stack de tecnologias modernas e robustas, tanto no backend como no frontend.

### Backend
-   **MySQL** - Para armazenamento e gerenciamento dos dados da aplicação (usuários, mensagens, etc.).
-   **NodeJs** - Como ambiente de execução do lado do servidor, permitindo o uso de JavaScript no backend.
-   **bcryptjs** - Para a criptografia segura (hashing) de senhas dos usuários no momento do cadastro e login.
-   **sequelize** - Como ORM (Object-Relational Mapper) para facilitar a interação e manipulação do banco de dados MySQL com código JavaScript.
-   **socket.io** - Para habilitar a comunicação em tempo real (via WebSockets) e a funcionalidade principal do chat.

### Frontend
-   **ReactJS** - Como biblioteca base para a construção de interfaces de usuário e componentes interativos.
-   **NextJS** - Como framework principal do projeto, gerenciando o roteamento, a renderização de componentes e a criação das rotas de API.
-   **tailwindcss** - Para estilização rápida e responsiva da interface, utilizando uma abordagem de classes utilitárias.
-   **ShadcnJs** - Como biblioteca de componentes reutilizáveis, acessíveis e customizáveis para a construção da UI.

### Ferramentas Adicionais
-   **Git & GitHub:** Para controle de versões e colaboração.
-   **Postman:** Plataforma colaborativa para testar e documentar APIs.
-   **VSCode:** IDE para o desenvolvimento.
  
## 🚀 Como Executar o Projeto

Para executar o projeto no seu ambiente local, siga estes passos:

1.  **Clonar o Repositório:**
    ```bash
    git clone [https://github.com/seu-utilizador/Projeto-POO.git](https://github.com/seu-utilizador/Projeto-POO.git)
    cd chat
    ```

2.  **Configurar a Base de Dados:**
    -   Certifique-se de que tem uma instância do MySQL.
    -   Crie uma base de dados (ex: `chat_db`).
    -   Crie o arquivo `.env` com as suas credenciais de acesso.

3.  **Executar a Aplicação:**
    -   Pode executar a aplicação use esses dois comando no terminadl dentro da pasta chat!:
    -   para criar as tabelas do banco.
        ```bash
        npm run sync-db
        ```
      -   para rodar na web a aplicação 
         ```bash
        npm run dev
        ```

# Integrantes da dupla:
- Eduardo Franco Seco (Fuill-Stack) <br>
  [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/eduardofranco572)
  [![LinkedIn](https://img.shields.io/badge/-LinkedIn-%230077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/eduardo-franco572/)

- Igor Albiero (Back-End) <br>
  [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/igorskeff)
  [![LinkedIn](https://img.shields.io/badge/-LinkedIn-%230077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/igor-albiero-7178a5215/)
