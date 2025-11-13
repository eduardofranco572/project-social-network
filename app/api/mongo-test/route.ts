import { NextResponse } from 'next/server';
import connectMongo from '@/src/database/mongo'; // Nossa nova conexão
import TesteMongo from '@/src/models/testeMongo'; // Nosso novo modelo

export async function GET(req: Request) {
    try {
        await connectMongo();

        const novoTeste = new TesteMongo({
            name: `Documento de Teste @ ${new Date().toLocaleTimeString()}`,
        });
        await novoTeste.save();

        const testes = await TesteMongo.find({});

        return NextResponse.json({
            message: 'Conexão com MongoDB bem-sucedida! Documentos encontrados:',
            data: testes,
        }, { status: 200 });

    } catch (error) {
        console.error('Erro na rota API de teste do MongoDB:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ 
            message: 'Erro ao conectar ou operar o MongoDB.', 
            error: errorMessage 
        }, { status: 500 });
    }
}