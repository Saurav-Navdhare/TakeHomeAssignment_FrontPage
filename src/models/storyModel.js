const prisma = require('../config/prismaClient');

/**
 * Insert a news item into the database.
 * @param {Object} newsItem - News data.
 * @param {string} newsItem.id - Unique ID of the news item.
 * @param {string} newsItem.title - Title of the news item.
 * @param {Date} newsItem.publishDate - Publish date of the news item.
 * @param {string} newsItem.url - URL of the news item.
 */

async function insertNews(newsItem) {
    try {
        const news = await prisma.news.create({
            data: {
                id: newsItem.id,
                title: newsItem.title,
                publishDate: newsItem.publishDate,
                url: newsItem.url,
            },
        });
        return news;
    } catch (error) {
        console.error('Error inserting news:', error);
        throw new Error('Failed to insert news.');
    }
}

module.exports = { insertNews };
