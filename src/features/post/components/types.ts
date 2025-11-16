export interface LoggedInUser {
    id: number;
    nome: string;
    email: string;
    foto: string;
}

export interface PostAuthor {
    id: number;
    nome: string;
    fotoPerfil: string;
}

export interface MediaItem {
    _id: string;
    url: string;
    type: string;
}

export interface PostWithAuthor {
    _id: string;
    media: MediaItem[];
    description?: string;
    authorId: number;
    createdAt: string;
    author: PostAuthor;
}