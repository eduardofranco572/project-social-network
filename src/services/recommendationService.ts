import { getNeo4jDriver } from '../database/neo4j.ts'; 
import neo4j from 'neo4j-driver';

export const recommendationService = {
    getCollaborativeRecommendations: async (userId: number, page: number = 1, limit: number = 20): Promise<string[]> => {
        const driver = getNeo4jDriver();
        const session = driver.session();
        
        const skip = (page - 1) * limit;

        try {
            
            const result = await session.run(
                `
                    MATCH (me:User)
                    WHERE me.id = $userId OR me.id = toFloat($userId) OR me.id = toInteger($userId)
                    
                    MATCH (me)-[:LIKED]->(p:Post)
                    
                    MATCH (p)<-[:LIKED]-(other:User)
                    WHERE other <> me
                    
                    MATCH (other)-[:LIKED]->(recommended:Post)
                    WHERE NOT (me)-[:LIKED]->(recommended)
                    
                    WITH recommended, count(distinct other) as likesScore
                    
                    WITH recommended, likesScore, 
                        coalesce(recommended.createdAt, datetime({year: 2025, month: 1, day: 1})) as createdDate
                    
                    WITH recommended, likesScore, 
                        duration.inSeconds(createdDate, datetime()).seconds as ageSeconds
                    
                    WITH recommended, 
                        likesScore * exp(-0.000004 * ageSeconds) as finalScore
                    
                    ORDER BY finalScore DESC
                    SKIP $skip
                    LIMIT $limit
                    
                    RETURN recommended.id as postId
                `,
                { 
                    userId, 
                    limit: neo4j.int(limit),
                    skip: neo4j.int(skip)
                }
            );

            return result.records.map(record => record.get('postId'));

        } catch (error) {
            console.error("Erro na recomendação Neo4j:", error);
            return [];
        } finally {
            await session.close();
        }
    }
};