const admin = require("firebase-admin");
const puppeteerExtra = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const cron = require("node-cron");

// Use the stealth plugin to make the scraper less detectable
puppeteerExtra.use(StealthPlugin());

const serviceAccount = require("./service-account.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Function to get a random delay between min and max seconds
const getRandomDelay = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// List of user-agents to rotate
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
];

// Function to get a random user-agent
const getRandomUserAgent = () =>
  userAgents[Math.floor(Math.random() * userAgents.length)];

// Array of search keywords
const searchQueries = [
  "Developer",
  "Frontend",
  "Full Stack",
  "Fullstack",
  "React",
  "Angular",
  "Web Developer",
];

cron.schedule("0 0 * * *", async () => {
  console.log("Running daily job posting check at", new Date().toISOString());

  // Fetch career pages from referrals collection (companies)
  const referrersSnapshot = await db.collection("referrals").get();
  const referrers = referrersSnapshot.docs.map((doc) => doc.data());
  console.log(
    `Fetched ${referrers.length} referrers from referrals collection`
  );

  // Fetch career pages from recruitingFirms collection
  const recruitingFirmsSnapshot = await db.collection("recruitingFirms").get();
  const recruitingFirms = recruitingFirmsSnapshot.docs.map((doc) => doc.data());
  console.log(
    `Fetched ${recruitingFirms.length} recruiting firms from recruitingFirms collection`
  );
  if (recruitingFirms.length === 0) {
    console.log(
      "No recruiting firms found. Snapshot empty:",
      recruitingFirmsSnapshot.empty
    );
    console.log(
      "Snapshot docs:",
      recruitingFirmsSnapshot.docs.map((doc) => doc.id)
    );
  } else {
    console.log("Recruiting firms data:", recruitingFirms);
  }

  const careerPages = [];

  // Add career pages from referrals (companies)
  let totalCompanies = 0;
  let companyCount = 0;
  referrers.forEach((referrer) => {
    if (referrer.companies && Array.isArray(referrer.companies)) {
      totalCompanies += referrer.companies.length;
      referrer.companies.forEach((company) => {
        if (!company.careerPage) {
          console.log(
            `Skipping company: ${
              company.name || "Unnamed"
            } - Missing careerPage`
          );
          return;
        }
        if (
          !careerPages.some((page) => page.careerPage === company.careerPage)
        ) {
          careerPages.push({
            companyName: company.name,
            careerPage: company.careerPage,
            type: "company",
          });
          companyCount++;
        } else {
          console.log(
            `Skipping company: ${
              company.name || "Unnamed"
            } - Duplicate careerPage: ${company.careerPage}`
          );
        }
      });
    }
  });
  console.log(`Total companies before deduplication: ${totalCompanies}`);
  console.log(`Found ${companyCount} unique companies from referrals`);

  // Add career pages from recruitingFirms
  let recruitingFirmCount = 0;
  recruitingFirms.forEach((recruitingFirm) => {
    if (
      recruitingFirm.url &&
      !careerPages.some((page) => page.careerPage === recruitingFirm.url)
    ) {
      careerPages.push({
        companyName: recruitingFirm.name,
        careerPage: recruitingFirm.url,
        type: "recruitingFirm",
      });
      recruitingFirmCount++;
    } else {
      console.log(
        `Skipping recruiting firm: ${
          recruitingFirm.name || "Unnamed"
        } - Missing or duplicate careerPage: ${recruitingFirm.url}`
      );
    }
  });
  console.log(`Found ${recruitingFirmCount} unique recruiting firms`);

  console.log(`Total unique career pages to scrape: ${careerPages.length}`);
  console.log(
    "Career pages to scrape:",
    careerPages.map(
      (page) => `${page.companyName} (${page.type}): ${page.careerPage}`
    )
  );

  const browser = await puppeteerExtra.launch({ headless: true });
  const page = await browser.newPage();

  // Set a random user-agent for the browser
  await page.setUserAgent(getRandomUserAgent());

  // Track processed career pages to avoid re-scraping
  const processedCareerPages = new Set();

  for (const { companyName, careerPage, type } of careerPages) {
    if (processedCareerPages.has(careerPage)) {
      console.log(
        `Already processed ${companyName} (${type}): ${careerPage}. Skipping...`
      );
      continue;
    }

    try {
      console.log(`Scraping ${companyName} (${type}): ${careerPage}`);

      // Set a new user-agent for each career page
      await page.setUserAgent(getRandomUserAgent());

      // Navigate to the career page with error handling
      let response = await page.goto(careerPage, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });
      if (response.status() === 429) {
        console.warn(
          `Rate limit (429) detected for ${careerPage}. Waiting before retry...`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, getRandomDelay(30, 60) * 1000)
        ); // Wait 30-60 seconds
        response = await page.goto(careerPage, {
          waitUntil: "networkidle2",
          timeout: 30000,
        });
      }
      if (response.status() === 403) {
        console.error(`Access denied (403) for ${careerPage}. Skipping...`);
        processedCareerPages.add(careerPage);
        continue;
      }

      const potentialJobs = await page.evaluate((queries) => {
        const jobs = [];
        const links = document.querySelectorAll("a");
        links.forEach((link) => {
          const href = link.getAttribute("href") || "";
          const text = link.textContent.trim().toLowerCase();
          // Check if the link text matches any of the search queries
          const matchedQuery = queries.find((query) =>
            text.includes(query.toLowerCase())
          );
          if (
            matchedQuery &&
            href &&
            (href.startsWith("http") || href.startsWith("/"))
          ) {
            const jobUrl = href.startsWith("http")
              ? href
              : new URL(href, window.location.origin).href;
            jobs.push({
              title: link.textContent.trim(),
              url: jobUrl,
              query: matchedQuery,
            });
          }
        });
        return jobs;
      }, searchQueries);

      console.log(
        `Found ${potentialJobs.length} potential jobs for ${companyName} (${type})`
      );

      const foundJobs = [];
      for (const job of potentialJobs) {
        let jobDetails = { location: "", description: "" };
        try {
          console.log(`Checking job details: ${job.url}`);

          // Set a new user-agent for each job detail page
          await page.setUserAgent(getRandomUserAgent());

          // Navigate to the job detail page with error handling
          response = await page.goto(job.url, {
            waitUntil: "networkidle2",
            timeout: 15000,
          });
          if (response.status() === 429) {
            console.warn(
              `Rate limit (429) detected for ${job.url}. Waiting before retry...`
            );
            await new Promise((resolve) =>
              setTimeout(resolve, getRandomDelay(30, 60) * 1000)
            ); // Wait 30-60 seconds
            response = await page.goto(job.url, {
              waitUntil: "networkidle2",
              timeout: 15000,
            });
          }
          if (response.status() === 403) {
            console.error(`Access denied (403) for ${job.url}. Skipping...`);
            continue;
          }

          jobDetails = await page.evaluate(() => {
            let locationElement = document.querySelector(
              '.location, .job-location, [class*="location"], [data-location], .city, .state, .country'
            );
            let location = locationElement
              ? locationElement.textContent.trim()
              : "";

            if (!location) {
              const bodyText = document.body.textContent;
              const locationMatch =
                bodyText.match(
                  /(?:location|city|province|state|country)\s*[:|-]\s*([A-Za-z\s,]+)(?=\s|$|\n)/i
                ) ||
                bodyText.match(
                  /(?:based in|located in)\s*([A-Za-z\s,]+)(?=\s|$|\n)/i
                );
              location = locationMatch ? locationMatch[1].trim() : "";
            }

            const isValidLocation = /^[A-Za-z\s,]+$/.test(location);
            if (!isValidLocation) {
              location = "";
            }

            const descriptionElement = document.querySelector(
              '.description, .job-description, [class*="description"], [id*="description"]'
            );
            return {
              location,
              description: descriptionElement
                ? descriptionElement.textContent.trim()
                : "",
            };
          });

          console.log(
            `Location for ${job.title}: ${jobDetails.location || "Not found"}`
          );
        } catch (error) {
          console.error(
            `Error extracting details for ${job.url}:`,
            error.message
          );
          jobDetails = { location: "", description: "" };
        }

        foundJobs.push({
          ...job,
          location: jobDetails.location,
          description: jobDetails.description,
        });
        console.log(
          `Added to foundJobs: ${job.title} (Location: ${
            jobDetails.location || "Not specified"
          })`
        );

        // Add a random delay between job detail pages (2-5 seconds)
        await new Promise((resolve) =>
          setTimeout(resolve, getRandomDelay(2, 5) * 1000)
        );
      }

      for (const job of foundJobs) {
        const jobPosting = {
          title: job.title,
          url: job.url,
          companyName,
          careerPage,
          location: job.location || "Not specified",
          description: job.description || "",
          timestamp: Date.now(),
          query: job.query, // Store the specific keyword that matched
          sourceType: type,
        };

        try {
          const existingJob = await db
            .collection("jobPostings")
            .where("url", "==", job.url)
            .where("query", "==", job.query)
            .get();

          if (existingJob.empty) {
            await db.collection("jobPostings").add(jobPosting);
            console.log(
              `Added job posting: ${job.title} at ${companyName} (${type}) (Location: ${job.location}) (Query: ${job.query})`
            );
          } else {
            console.log(
              `Job already exists in database: ${job.title} (URL: ${job.url}, Query: ${job.query})`
            );
          }
        } catch (error) {
          console.error(
            `Error saving job to Firestore: ${job.title} (URL: ${job.url})`,
            error.message
          );
        }
      }

      // Mark the career page as processed
      processedCareerPages.add(careerPage);

      // Add a random delay between career pages (5-15 seconds)
      await new Promise((resolve) =>
        setTimeout(resolve, getRandomDelay(5, 15) * 1000)
      );
    } catch (error) {
      console.error(
        `Error scraping ${companyName} (${type}) (${careerPage}):`,
        error.message
      );
      processedCareerPages.add(careerPage); // Mark as processed even if it fails to avoid re-scraping
    }
  }

  await browser.close();
  console.log("Job posting check complete at", new Date().toISOString());
});

console.log("Scraping job started. Running daily at midnight...");
