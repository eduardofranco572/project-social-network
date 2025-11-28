import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

type UploadType = 'profiles' | 'posts' | 'status';

export async function saveFile(file: File, type: UploadType, userId: number | string): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `${Date.now()}-${cleanFileName}`;

    const publicDir = path.join(process.cwd(), 'public');
    const targetDir = path.join(publicDir, 'uploads', type, String(userId));

    const filepath = path.join(targetDir, filename);
    
    const publicUrl = `/uploads/${type}/${userId}/${filename}`;

    try {
        await mkdir(targetDir, { recursive: true });

        await writeFile(filepath, buffer);
        
        return publicUrl;
    } catch (error) {
        console.error(`Erro ao salvar arquivo em ${targetDir}:`, error);
        throw new Error('Falha ao processar upload de arquivo.');
    }
}