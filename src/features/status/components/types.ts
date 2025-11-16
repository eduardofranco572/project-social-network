export interface StatusItem {
    _id: string;
    mediaUrl: string;
    mediaType: string;
    description?: string;
    createdAt: Date;
}

export interface StatusUserData {
    author: {
        id: number;
        nome: string;
        fotoPerfil: string;
    };
    
    statuses: StatusItem[];
}