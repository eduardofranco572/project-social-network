import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { getNeo4jDriver } from '@/src/database/neo4j';

async function getUserIdFromToken(request: NextRequest): Promise<number | null> {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) return null;

    const secret = process.env.JWT_SECRET;

    if (!secret) return null;

    try {
        const decoded = jwt.verify(token, secret) as any;
        return parseInt(decoded.id, 10);
    } catch { return null; }
}

export async function GET(request: NextRequest) {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
        return NextResponse.json([], { status: 200 });
    }

    const driver = getNeo4jDriver();
    const session = driver.session();

    try {
        const result = await session.run(
            `
                MATCH (u:User {id: $userId})-[:FOLLOWS]->(following:User)
                RETURN following.id AS id
            `,
            { userId }
        );

        const followingIds = result.records.map(record => {
            const idVal = record.get('id');
            return typeof idVal === 'object' && 'toNumber' in idVal ? idVal.toNumber() : Number(idVal);
        });

        return NextResponse.json(followingIds, { status: 200 });

    } catch (error) {
        console.error("Erro ao buscar following IDs:", error);

        return NextResponse.json([], { status: 500 });
    } finally {
        await session.close();
    }
}