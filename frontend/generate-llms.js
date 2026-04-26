const axios = require('axios');
const cheerio = require('cheerio');
const TurndownService = require('turndown');
const fs = require('fs');
const xml2js = require('xml2js');

// --- CONFIGURATION ---
const BASE_URL = 'https://haskerrealtygroup.com'; // Change to localhost:3000 if testing locally
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;
const OUTPUT_FILE = './public/llms-full.txt';
const CONCURRENCY_LIMIT = 10; // How many pages to scrape at exactly the same time
const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay so we don't crash the server

const turndownService = new TurndownService({ headingStyle: 'atx' });

// Helper function to pause
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getUrlsFromSitemap() {
    console.log(`Fetching sitemap from ${SITEMAP_URL}...`);
    try {
        const response = await axios.get(SITEMAP_URL);
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(response.data);
        
        // Extract URLs from the parsed XML
        const urls = result.urlset.url.map((u) => u.loc[0]);
        console.log(`Found ${urls.length} pages in sitemap.`);
        return urls;
    } catch (error) {
        console.error('Failed to fetch or parse sitemap:', error.message);
        return [];
    }
}

async function scrapePage(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // We only want the main content, not the navbar, footer, or scripts!
        // Adjust 'main' if your Next.js layout uses a different wrapper id/class
        const mainContent = $('main').html() || $('body').html(); 
        
        if (!mainContent) return '';

        // Convert the messy HTML into clean Markdown for the AI
        let markdown = turndownService.turndown(mainContent);
        
        // Format it nicely for the llms-full.txt
        return `\n\n---\n\n# URL: ${url}\n\n${markdown}`;
        
    } catch (error) {
        console.log(`⚠️ Failed to scrape ${url}: ${error.message}`);
        return '';
    }
}

async function generate() {
    const urls = await getUrlsFromSitemap();
    if (urls.length === 0) return;

    // Start with a fresh file and write the header
    const header = `# Hasker & Co. Realty Group - Full Knowledge Base\nGenerated on: ${new Date().toISOString()}\n\nThis document contains the full text of all public pages and property listings.\n`;
    fs.writeFileSync(OUTPUT_FILE, header);

    // Process URLs in chunks to protect server memory
    for (let i = 0; i < urls.length; i += CONCURRENCY_LIMIT) {
        const batch = urls.slice(i, i + CONCURRENCY_LIMIT);
        console.log(`Processing batch ${i / CONCURRENCY_LIMIT + 1} of ${Math.ceil(urls.length / CONCURRENCY_LIMIT)}...`);

        // Fetch all 10 pages in the batch at the same time
        const batchResults = await Promise.all(batch.map((url) => scrapePage(url)));

        // Append the results to the file instantly so we don't hold 3,000 pages in RAM
        const validResults = batchResults.filter((text) => text.length > 0);
        fs.appendFileSync(OUTPUT_FILE, validResults.join(''));

        // Brief pause before hitting the server with the next 10 requests
        await delay(DELAY_BETWEEN_BATCHES);
    }

    console.log(`\n✅ Success! llms-full.txt generated with ${urls.length} pages.`);
}

generate();