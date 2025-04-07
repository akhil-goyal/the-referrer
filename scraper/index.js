const admin = require("firebase-admin");
const axios = require("axios");
const cheerio = require("cheerio");
const cron = require("node-cron");

// Initialize Firebase Admin SDK
const serviceAccount = require("./service-account.json"); // Replace with your service account key file
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Scheduled job to check for job postings
cron.schedule("* * * * *", async () => {
  console.log("Running daily job posting check...");
  const searchQuery = "Frontend Developer";

  // Fetch all referrers to get their companies
  const referrersSnapshot = await db.collection("referrals").get();
  const referrers = referrersSnapshot.docs.map((doc) => doc.data());

  const careerPages = [];
  referrers.forEach((referrer) => {
    referrer.companies.forEach((company) => {
      if (!careerPages.some((page) => page.careerPage === company.careerPage)) {
        careerPages.push({
          companyName: company.name,
          careerPage: company.careerPage,
        });
      }
    });
  });

  // Scrape each career page
  for (const { companyName, careerPage } of careerPages) {
    try {
      console.log(`Scraping ${companyName}: ${careerPage}`);
      const response = await axios.get(careerPage, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      let foundJobs = [];

      $("a").each((_, element) => {
        const href = $(element).attr("href") || "";
        const text = $(element).text().trim();
        if (
          text.toLowerCase().includes(searchQuery.toLowerCase()) &&
          href &&
          (href.startsWith("http") || href.startsWith("/"))
        ) {
          const jobUrl = href.startsWith("http")
            ? href
            : new URL(href, careerPage).href;
          foundJobs.push({ title: text, url: jobUrl });
        }
      });

      // Store matching jobs in Firestore
      for (const job of foundJobs) {
        const jobPosting = {
          title: job.title,
          url: job.url,
          companyName,
          careerPage,
          timestamp: Date.now(),
          query: searchQuery,
        };

        const existingJob = await db
          .collection("jobPostings")
          .where("url", "==", job.url)
          .where("query", "==", searchQuery)
          .get();

        if (existingJob.empty) {
          await db.collection("jobPostings").add(jobPosting);
          console.log(`Added job posting: ${job.title} at ${companyName}`);
        }
      }

      // Add a delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(
        `Error scraping ${companyName} (${careerPage}):`,
        error.message
      );
    }
  }

  console.log("Job posting check complete.");
});

console.log("Scraping job started. Running daily at midnight...");
