const getBrowser = require('../config/playwright');
const { broadcastUpdates } = require('../utils/websocket');
const logger = require('../utils/logger');
const { storeNewNews } = require("../utils/database")

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

                // Get the next row to extract the publish date
                const nextRow = row.nextElementSibling;
                const publishDateSpan = nextRow ? nextRow.querySelector('td span.age') : null;
                let publishDate = publishDateSpan ? publishDateSpan.getAttribute('title') : null;

                if (publishDate !== null) {
                    const timestamp = publishDate.split(' ').pop(); // Use 'publishDate' here

                    // Convert the timestamp to a Date object
                    const date = new Date(parseInt(timestamp) * 1000); // Convert seconds to milliseconds

                    // Convert to ISO string or use any other format suitable for your DB
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

        // Log the scraped stories
        console.log(`Scraped ${stories.length} new stories:`);
        stories.forEach(story => {
            console.log(`ID: ${story.id}`);
            console.log(`Title: ${story.title}`);
            console.log(`URL: ${story.url}`);
            console.log(`Publish Date: ${story.publishDate}`);
            console.log('---');
        });

        // Filter new stories by comparing against the latestNewsId
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
            // Update the latestNewsId to the most recent story
            latestNewsId = newStories[0].id;
            // Log and broadcast updates
            logger.info(`Inserted ${newStories.length} new stories into the database.`);

            await storeNewNews(newStories);     // Store new stories in the database
        }
    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        await browser.close();
        return newStories;
    }
}

module.exports = { scrapeAndStoreNews };