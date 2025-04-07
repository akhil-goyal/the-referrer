const admin = require("firebase-admin");
const puppeteer = require("puppeteer");
const cron = require("node-cron");

const serviceAccount = require("./service-account.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

cron.schedule("0 0 * * *", async () => {
  console.log("Running daily job posting check...");
  const searchQuery = "Frontend Developer";
  const locationFilter = "Canada";

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

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (const { companyName, careerPage } of careerPages) {
    try {
      console.log(`Scraping ${companyName}: ${careerPage}`);
      await page.goto(careerPage, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      const potentialJobs = await page.evaluate((query) => {
        const jobs = [];
        const links = document.querySelectorAll("a");
        links.forEach((link) => {
          const href = link.getAttribute("href") || "";
          const text = link.textContent.trim();
          if (
            text.toLowerCase().includes(query.toLowerCase()) &&
            href &&
            (href.startsWith("http") || href.startsWith("/"))
          ) {
            const jobUrl = href.startsWith("http")
              ? href
              : new URL(href, window.location.origin).href;
            jobs.push({ title: text, url: jobUrl });
          }
        });
        return jobs;
      }, searchQuery);

      const foundJobs = [];
      for (const job of potentialJobs) {
        try {
          console.log(`Checking job details: ${job.url}`);
          await page.goto(job.url, {
            waitUntil: "networkidle2",
            timeout: 15000,
          });

          const jobDetails = await page.evaluate(() => {
            const locationElement = document.querySelector(
              '.location, .job-location, [class*="location"], [data-location]'
            );
            const descriptionElement = document.querySelector(
              '.description, .job-description, [class*="description"], [id*="description"]'
            );
            return {
              location: locationElement
                ? locationElement.textContent.trim()
                : "",
              description: descriptionElement
                ? descriptionElement.textContent.trim()
                : "",
            };
          });

          if (
            jobDetails.location
              .toLowerCase()
              .includes(locationFilter.toLowerCase())
          ) {
            foundJobs.push({
              ...job,
              location: jobDetails.location,
              description: jobDetails.description,
            });
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(
            `Error checking job details for ${job.url}:`,
            error.message
          );
        }
      }

      for (const job of foundJobs) {
        const jobPosting = {
          title: job.title,
          url: job.url,
          companyName,
          careerPage,
          location: job.location,
          description: job.description, // Add description
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
          console.log(
            `Added job posting: ${job.title} at ${companyName} (Location: ${job.location})`
          );
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(
        `Error scraping ${companyName} (${careerPage}):`,
        error.message
      );
    }
  }

  await browser.close();
  console.log("Job posting check complete.");
});

console.log("Scraping job started. Running daily at midnight...");
