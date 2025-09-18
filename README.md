# Chat: Aplicação de um chata de conversa em tempo real

O 

## ✨ Funcionalidades Principais

-   **👤 Gestão de Utilizadores e Autenticação:**
    -   Sistema seguro de registo e login (utilizando e-mail ou nome de utilizador).
    -   Perfis de utilizador personalizáveis com foto, banner e links para redes sociais (GitHub, LinkedIn, Instagram e Facebook).
    -   Perfil listando todos os jogos criados, jams criadas, jams participadas e jogos avaliados.
    -   Funcionalidade para alteração de senha.

-   **:space_invader: Criação e Gestão de Jams:**
    -   Ferramenta para criar novas jams com título, descrição, datas de início e fim.
    -   Personalização visual completa da página da jam com `HTML` e `CSS`, incluindo cores, imagens de capa, wallpaper e banner.
    -   Gestão de jams criadas, com opções para editar e apagar.

-   **🎮 Submissão e Visualização de Jogos:**
    -   Inscrição fácil em jams abertas.
    -   Upload de jogos para as jams em que o utilizador está inscrito.
    -   Páginas dedicadas para cada jogo com descrição, conteúdo `HTML` e `CSS` personalizado, e link para jogar.
    -   Galeria para explorar todos os jogos submetidos na plataforma.

-   **❤️ Interação e Comunidade:**
    -   Sistema de votação ("likes") para os jogos.
    -   Secção de comentários para feedback.
    -   Ranking de jogos em cada jam com base nos votos da comunidade.

-   **🔔 Notificações em Tempo Real:**
    -   Notificações instantâneas sobre o início e fim de jams, novos comentários e outras atividades relevantes.

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
