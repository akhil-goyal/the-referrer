const referrals = [
  {
    name: "Anita",
    companies: [{ name: "RBC", careerPage: "https://jobs.rbc.com/" }],
  },
  {
    name: "Raymond",
    companies: [{ name: "RBC", careerPage: "https://jobs.rbc.com/" }],
  },
  {
    name: "Dileep",
    companies: [{ name: "RBC", careerPage: "https://jobs.rbc.com/" }],
  },
  {
    name: "Bryce",
    companies: [{ name: "RBC", careerPage: "https://jobs.rbc.com/" }],
  },
  {
    name: "Jeferrin",
    companies: [
      { name: "Amazon AWS", careerPage: "https://aws.amazon.com/careers/" },
    ],
  },
  {
    name: "Vidhi",
    companies: [
      { name: "Synechron", careerPage: "https://www.synechron.com/careers" },
      { name: "Citibank", careerPage: "https://jobs.citi.com/" },
    ],
  },
  {
    name: "Anoop",
    companies: [
      { name: "Synechron", careerPage: "https://www.synechron.com/careers" },
      { name: "Citibank", careerPage: "https://jobs.citi.com/" },
    ],
  },
  {
    name: "Sadiq",
    companies: [{ name: "TCS", careerPage: "https://www.tcs.com/careers" }],
  },
  {
    name: "Nirav Karia",
    companies: [
      {
        name: "Persistent Systems",
        careerPage: "https://www.persistent.com/careers/",
      },
    ],
  },
  {
    name: "Tannu",
    companies: [
      {
        name: "CIBC",
        careerPage: "https://www.cibc.com/en/about-cibc/careers.html",
      },
    ],
  },
  {
    name: "Hema",
    companies: [
      {
        name: "CIBC",
        careerPage: "https://www.cibc.com/en/about-cibc/careers.html",
      },
    ],
  },
  {
    name: "Deepti",
    companies: [
      {
        name: "CIBC",
        careerPage: "https://www.cibc.com/en/about-cibc/careers.html",
      },
      {
        name: "Metrolynx",
        careerPage: "https://www.metrolinx.com/en/about-us/careers",
      },
      { name: "ONXpress", careerPage: "https://www.onxpress.com/careers" },
    ],
  },
  {
    name: "Jatin",
    companies: [
      { name: "IBM", careerPage: "https://www.ibm.com/ca-en/careers" },
    ],
  },
  {
    name: "Akash",
    companies: [
      { name: "IBM", careerPage: "https://www.ibm.com/ca-en/careers" },
    ],
  },
  {
    name: "Ammy",
    companies: [
      { name: "ICICI Bank", careerPage: "https://www.icicibank.ca/careers" },
    ],
  },
  {
    name: "Suriti",
    companies: [
      {
        name: "Bruce Power",
        careerPage: "https://www.brucepower.com/careers/",
      },
      {
        name: "Ontario Power Group",
        careerPage: "https://www.opg.com/careers/",
      },
    ],
  },
  {
    name: "Mukul",
    companies: [
      {
        name: "LTIMindtree",
        careerPage: "https://www.ltimindtree.com/careers/",
      },
      { name: "Cognizant", careerPage: "https://careers.cognizant.com/" },
      { name: "Microsoft", careerPage: "https://careers.microsoft.com/" },
      { name: "Manulife", careerPage: "https://www.manulife.ca/careers.html" },
      { name: "McDonalds", careerPage: "https://careers.mcdonalds.com/" },
      { name: "Blue Yonder", careerPage: "https://www.blueyonder.com/careers" },
    ],
  },
  {
    name: "Harneet",
    companies: [{ name: "CGI", careerPage: "https://www.cgi.com/en/careers" }],
  },
  {
    name: "Lakshay",
    companies: [
      {
        name: "Porter Airlines",
        careerPage: "https://www.flyporter.com/en/careers",
      },
    ],
  },
  {
    name: "Hema Jampala",
    companies: [
      { name: "CPPIB", careerPage: "https://www.cppib.com/en/careers/" },
      { name: "Intuit", careerPage: "https://www.intuit.com/careers/" },
    ],
  },
  {
    name: "Dilpreet's Husband",
    companies: [
      {
        name: "OSFI",
        careerPage: "https://www.osfi-bsif.gc.ca/Eng/wt-ow/Pages/careers.aspx",
      },
    ],
  },
  {
    name: "Dilpreet",
    companies: [{ name: "Intact", careerPage: "https://careers.intact.ca/" }],
  },
  {
    name: "Charles K.",
    companies: [
      {
        name: "Christie",
        careerPage: "https://www.christiedigital.com/careers/",
      },
    ],
  },
  {
    name: "Jason Hollingsworth",
    companies: [
      {
        name: "TEKSystems",
        careerPage: "https://www.teksystems.com/en/careers",
      },
    ],
  },
  {
    name: "Mani Dhiman",
    companies: [
      {
        name: "Warner Bros.",
        careerPage: "https://www.warnerbroscareers.com/",
      },
    ],
  },
];

// Function to add or update a referral
function addOrUpdateReferral(personName, companyName, careerPage) {
  // Find if the person already exists (case-insensitive)
  const existingPerson = referrals.find(
    (p) => p.name.toLowerCase() === personName.toLowerCase()
  );

  if (existingPerson) {
    // Person exists, check if the company is already listed
    const existingCompany = existingPerson.companies.find(
      (c) =>
        c.name.toLowerCase() === companyName.toLowerCase() ||
        c.careerPage.toLowerCase() === careerPage.toLowerCase()
    );
    if (!existingCompany) {
      // Add the new company
      existingPerson.companies.push({
        name: companyName,
        careerPage: careerPage,
      });
    }
  } else {
    // Person doesn't exist, add new entry
    referrals.push({
      name: personName,
      companies: [{ name: companyName, careerPage: careerPage }],
    });
  }
}
