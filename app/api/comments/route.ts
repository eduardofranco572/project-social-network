import { NextResponse, type NextRequest } from 'next/server';
import connectMongo from '@/src/database/mongo';
import Comment from '@/src/models/comment';
import Usuario, { initUsuarioModel } from '@/src/models/usuario';
import getSequelizeInstance from '@/src/database/database';
import jwt from 'jsonwebtoken';

// Helper para pegar usuário logado
async function getUserFromToken(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) return null;

    const secret = process.env.JWT_SECRET;

    if (!secret) return null;

    try {
        return jwt.verify(token, secret) as any;

    } catch (error) {
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const postId = searchParams.get('postId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        if (!postId) return NextResponse.json({ message: 'PostId obrigatório' }, { status: 400 });

        await connectMongo();

        const comments = await Comment.find({ postId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Comment.countDocuments({ postId });

        // Buscar dados dos usuários no MySQL
        const userIds = [...new Set(comments.map(c => c.userId))];

        const sequelize = getSequelizeInstance();
        initUsuarioModel(sequelize);
        
        const users = await Usuario.findAll({
            where: { USU_ID: userIds },
            attributes: ['USU_ID', 'USU_NOME', 'USU_FOTO_PERFIL']
        });

        const userMap = new Map(users.map(u => [u.USU_ID, u]));

        const commentsWithUser = comments.map(c => {
            const user = userMap.get(c.userId);
            return {
                _id: c._id,
                text: c.text,
                parentId: c.parentId,
                createdAt: c.createdAt,
                user: {
                    id: c.userId,
                    nome: user?.USU_NOME || 'Usuário',
                    foto: user?.USU_FOTO_PERFIL || '/img/iconePadrao.svg'
                }
            };
        });

        return NextResponse.json({
            comments: commentsWithUser,
            hasMore: skip + comments.length < total
        });

    } catch (error) {
        return NextResponse.json({ message: 'Erro ao buscar comentários' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });

        const body = await request.json();
        const { postId, text, parentId } = body;

        if (!postId || !text) return NextResponse.json({ message: 'Dados inválidos' }, { status: 400 });

        await connectMongo();

        const newComment = await Comment.create({
            postId,
            userId: user.id,
            text,
            parentId: parentId || null 
        });

        return NextResponse.json(newComment, { status: 201 });

    } catch (error) {
        return NextResponse.json({ message: 'Erro ao comentar' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });

        const { commentId } = await request.json();

        if (!commentId) return NextResponse.json({ message: 'ID do comentário obrigatório' }, { status: 400 });

        await connectMongo();

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return NextResponse.json({ message: 'Comentário não encontrado' }, { status: 404 });
        }

        // Verifica se é o dono do comentario
        if (comment.userId !== user.id) {
            return NextResponse.json({ message: 'Sem permissão para excluir' }, { status: 403 });
        }

        await Comment.findByIdAndDelete(commentId);

        // Excluir respostas alinhadas
        await Comment.deleteMany({ parentId: commentId });

        return NextResponse.json({ message: 'Comentário excluído' }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: 'Erro ao excluir comentário' }, { status: 500 });
    }
}