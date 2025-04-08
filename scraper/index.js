const admin = require("firebase-admin");
const puppeteer = require("puppeteer");
const cron = require("node-cron");

const serviceAccount = require("./service-account.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

cron.schedule("0 0 * * *", async () => {
  console.log("Running daily job posting check at", new Date().toISOString());
  const searchQuery = "Developer";

  // Fetch career pages from referrals collection (companies)
  const referrersSnapshot = await db.collection("referrals").get();
  const referrers = referrersSnapshot.docs.map((doc) => doc.data());
  console.log(
    `Fetched ${referrers.length} referrers from referrals collection`
  );

  // Fetch career pages from recruitmentCompanies collection
  const recruitmentCompaniesSnapshot = await db
    .collection("recruitmentCompanies")
    .get();
  const recruitmentCompanies = recruitmentCompaniesSnapshot.docs.map((doc) =>
    doc.data()
  );
  console.log(
    `Fetched ${recruitmentCompanies.length} recruitment companies from recruitmentCompanies collection`
  );

  const careerPages = [];

  // Add career pages from referrals (companies)
  let companyCount = 0;
  referrers.forEach((referrer) => {
    if (referrer.companies && Array.isArray(referrer.companies)) {
      referrer.companies.forEach((company) => {
        if (
          !careerPages.some((page) => page.careerPage === company.careerPage)
        ) {
          careerPages.push({
            companyName: company.name,
            careerPage: company.careerPage,
            type: "company",
          });
          companyCount++;
        }
      });
    }
  });
  console.log(`Found ${companyCount} unique companies from referrals`);

  // Add career pages from recruitmentCompanies
  let recruitmentCompanyCount = 0;
  recruitmentCompanies.forEach((recruitmentCompany) => {
    if (
      recruitmentCompany.careerPage &&
      !careerPages.some(
        (page) => page.careerPage === recruitmentCompany.careerPage
      )
    ) {
      careerPages.push({
        companyName: recruitmentCompany.name,
        careerPage: recruitmentCompany.careerPage,
        type: "recruitmentCompany",
      });
      recruitmentCompanyCount++;
    }
  });
  console.log(`Found ${recruitmentCompanyCount} unique recruitment companies`);

  console.log(`Total unique career pages to scrape: ${careerPages.length}`);
  console.log(
    "Career pages to scrape:",
    careerPages.map(
      (page) => `${page.companyName} (${page.type}): ${page.careerPage}`
    )
  );

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (const { companyName, careerPage, type } of careerPages) {
    try {
      console.log(`Scraping ${companyName} (${type}): ${careerPage}`);
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

      console.log(
        `Found ${potentialJobs.length} potential jobs for ${companyName} (${type})`
      );

      const foundJobs = [];
      for (const job of potentialJobs) {
        let jobDetails = { location: "", description: "" };
        try {
          console.log(`Checking job details: ${job.url}`);
          await page.goto(job.url, {
            waitUntil: "networkidle2",
            timeout: 15000,
          });

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
          query: searchQuery,
          sourceType: type,
        };

        try {
          const existingJob = await db
            .collection("jobPostings")
            .where("url", "==", job.url)
            .where("query", "==", searchQuery)
            .get();

          if (existingJob.empty) {
            await db.collection("jobPostings").add(jobPosting);
            console.log(
              `Added job posting: ${job.title} at ${companyName} (${type}) (Location: ${job.location})`
            );
          } else {
            console.log(
              `Job already exists in database: ${job.title} (URL: ${job.url})`
            );
          }
        } catch (error) {
          console.error(
            `Error saving job to Firestore: ${job.title} (URL: ${job.url})`,
            error.message
          );
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(
        `Error scraping ${companyName} (${type}) (${careerPage}):`,
        error.message
      );
    }
  }

  await browser.close();
  console.log("Job posting check complete at", new Date().toISOString());
});

console.log("Scraping job started. Running daily at midnight...");
