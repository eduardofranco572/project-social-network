import { getNeo4jDriver } from '../database/neo4j.ts';

export const followService = {
  // Seguir ou Deixar de seguir (Toggle)
    toggleFollow: async (followerId: number, followedId: number) => {
        const driver = getNeo4jDriver();
        const session = driver.session();

        try {
            const checkResult = await session.run(
                `
                    MATCH (u1:User {id: $followerId})-[r:FOLLOWS]->(u2:User {id: $followedId})
                    RETURN r
                `,
            { followerId, followedId }
        );

        const isFollowing = checkResult.records.length > 0;

            if (isFollowing) {
                // UNFOLLOW
                await session.run(
                    `
                        MATCH (u1:User {id: $followerId})-[r:FOLLOWS]->(u2:User {id: $followedId})
                        DELETE r
                    `,
                { followerId, followedId }
            );

            return { isFollowing: false };

        } else {
            // FOLLOW
            await session.run(
                `
                MERGE (u1:User {id: $followerId})
                MERGE (u2:User {id: $followedId})
                MERGE (u1)-[r:FOLLOWS]->(u2)
                ON CREATE SET r.createdAt = datetime()
                `,
                { followerId, followedId }
            );
            
            return { isFollowing: true };
        }

        } finally {
            await session.close();
        }
    },

    getFollowStatus: async (followerId: number, targetUserId: number) => {
        const driver = getNeo4jDriver();
        const session = driver.session();

        try {
            const result = await session.run(
                `
                    // Verifica se eu sigo ele
                    OPTIONAL MATCH (me:User {id: $followerId})-[r:FOLLOWS]->(target:User {id: $targetUserId})
                    
                    // Conta seguidores dele
                    WITH (r IS NOT NULL) as isFollowing
                    OPTIONAL MATCH (target:User {id: $targetUserId})<-[:FOLLOWS]-(followers)
                    WITH isFollowing, count(followers) as followersCount
                    
                    // Conta quem ele segue
                    OPTIONAL MATCH (target:User {id: $targetUserId})-[:FOLLOWS]->(following)
                    RETURN isFollowing, followersCount, count(following) as followingCount
                `,
                { followerId, targetUserId }
            );

            const record = result.records[0];

            return {
                isFollowing: record.get('isFollowing'),
                followersCount: record.get('followersCount').toNumber(),
                followingCount: record.get('followingCount').toNumber()
            };

        } catch (error) {
            return { 
                isFollowing: false, 
                followersCount: 0, 
                followingCount: 0 
            };

        } finally {
            await session.close();
        }
    }
};