const prisma = require("../config/prismaClient");
const { db_queries_total, db_connection_errors } = require('../services/metrics');


// Function to get the count of news published in the last N minutes
async function getRecentNewsCount(minutes) {
    const now = new Date();
    const threshold = new Date(now.getTime() - minutes * 60 * 1000);

    // Query the database for stories with a publishDate after the threshold
    const count = await prisma.news.count({
        where: {
            publishDate: {
                gte: threshold,
            },
        },
    });

    return count;
}

// Function to store new news stories in the database
async function storeNewNews(newStories) {
    for (const story of newStories) {
        try {
            db_queries_total.inc();
            await prisma.news.upsert({      // if id is already in database
                where: { id: story.id },    // update it as it re-occurred at top meaning it is updated
                update: {
                    title: story.title,
                    url: story.url,
                    publishDate: story.publishDate,
                },
                create: {                    // else create a new entry in database
                    id: story.id,
                    title: story.title,
                    url: story.url,
                    publishDate: story.publishDate,
                },
            });
        } catch (error) {
            db_connection_errors.inc();
            console.error('Error storing news story:', error);
        }
    }
}


module.exports = {
    getRecentNewsCount,
    storeNewNews,
}