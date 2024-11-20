const fs = require("fs");
const TurndownService = require("turndown");

// Initialize Turndown service
const turndownService = new TurndownService();

async function scrapeAndSaveMarkdown(url, outputFileName) {
  try {
    // Fetch the JSON data from the provided URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Extract name from the first element
    const firstElementName = data[1]?.result?.data?.json?.name || null;

    // Extract and process details from the second element
    const secondElementDetails = data[2]?.result?.data?.json.map(item => {
      const markdownBody = item.body
        ? turndownService.turndown(item.body) // Convert HTML to Markdown
        : null;

      return {
        name: item.name || null,
        description: item.description || null,
        format: item.format || null,
        body: markdownBody || null
      };
    }) || [];

    // Prepare Markdown content
    let markdownContent = `# ${firstElementName}\n\n`;
    secondElementDetails.forEach(detail => {
      markdownContent += `### ${detail.name}\n`;
      markdownContent += `**Description**: ${detail.description}\n\n`;
      markdownContent += `**Format**: ${detail.format}\n\n`;
      markdownContent += `**Body**:\n\n${detail.body}\n\n`;
      markdownContent += "---\n\n";
    });

    // Save Markdown content to file
    fs.writeFileSync(outputFileName, markdownContent, "utf-8");
    console.log(`Markdown file saved as ${outputFileName}`);
  } catch (error) {
    console.error("Error fetching, processing, or saving JSON:", error);
  }
}

// Example usage: Replace with the actual URL and desired file name
scrapeAndSaveMarkdown('API_URL', 'FILE_NAME.md');
