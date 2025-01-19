const getBrowser = require('../config/playwright');
const logger = require('../utils/logger');
const { storeNewNews } = require("../utils/database")
const { successful_scrapes, failed_scrapes, news_processed } = require('./metrics');

let latestNewsId = null; // Tracks the most recent story's ID to prevent duplicates

async function scrapeAndStoreNews() {
    const browser = await getBrowser();
    const page = await browser.newPage();
    const newStories = [];
    try {

        // Navigate to Hacker News
        await page.goto('https://news.ycombinator.com/', { waitUntil: 'domcontentloaded' });
        logger.info("Page loaded successfully")
        // Scrape the news stories
        const stories = await page.evaluate(() => {
            const rows = document.querySelectorAll('tr.athing.submission');
            const data = [];

            rows.forEach((row) => {
                const id = row.getAttribute('id');
                const titleElement = row.querySelector('span.titleline a');
                const title = titleElement ? titleElement.innerText : 'No Title';
                const url = titleElement ? titleElement.href : 'No URL';

                // Find the publish date of the story
                const nextRow = row.nextElementSibling;
                const publishDateSpan = nextRow ? nextRow.querySelector('td span.age') : null;
                let publishDate = publishDateSpan ? publishDateSpan.getAttribute('title') : null;

                if (publishDate !== null) {
                    const timestamp = publishDate.split(' ').pop(); // Use 'publishDate' here

                    // Convert the timestamp to a Date object
                    const date = new Date(parseInt(timestamp) * 1000); // Convert seconds to milliseconds
                    publishDate = date.toISOString();
                }

                data.push({
                    id,
                    title,
                    url,
                    publishDate,
                });
            });

            return data;
        });

        if (!stories || !stories.length) return;

        console.log(`Scraped ${stories.length} new stories:`);

        for (const story of stories) {
            if (story.id === latestNewsId) break; // Stop if we've reached the latest known story

            newStories.push({
                id: story.id,
                title: story.title,
                url: story.url,
                publishDate: story.publishDate,
            });
        }

        if (newStories.length > 0) {
            news_processed.set(newStories.length);
            latestNewsId = newStories[0].id;
            logger.info(`Inserted ${newStories.length} new stories into the database.`);

            await storeNewNews(newStories);
        }
        successful_scrapes.inc();
    } catch (error) {
        failed_scrapes.inc();
        console.error('Error during scraping:', error);
    } finally {
        await browser.close();
        return newStories;
    }
}

module.exports = { scrapeAndStoreNews };