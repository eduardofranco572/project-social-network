import { getNeo4jDriver } from '../database/neo4j.ts'; 

export const likeService = {
    toggleLike: async (userId: number, postId: string, action: 'LIKE' | 'UNLIKE') => {
        const driver = getNeo4jDriver();
        const session = driver.session();

        try {
            if (action === 'LIKE') {
                await session.run(
                    `
                    MERGE (u:User {id: $userId})
                    MERGE (p:Post {id: $postId})
                    MERGE (u)-[r:LIKED]->(p)
                    ON CREATE SET r.createdAt = datetime()
                    `,

                    { userId, postId }
                );
            } else {
                await session.run(
                    `
                    MATCH (u:User {id: $userId})-[r:LIKED]->(p:Post {id: $postId})
                    DELETE r
                    `,
                    { userId, postId }
                );
            }
        } catch (error) {
            console.error("Erro ao sincronizar like no Neo4j:", error);
            // mas em produção idealmente usaria uma fila (RabbitMQ) para garantir consistência.
        } finally {
            await session.close();
        }
    }
};