const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");

searchInput.addEventListener("input", function (e) {
  const searchTerm = e.target.value.toLowerCase().trim();

  // Clear previous results and hide if search is empty
  resultsDiv.innerHTML = "";
  if (!searchTerm) {
    resultsDiv.style.display = "none";
    return;
  }

  // Search for people
  const matchingPeople = referrals.filter((p) =>
    p.name.toLowerCase().includes(searchTerm)
  );

  // Search for companies
  const matchingCompanies = [];
  referrals.forEach((person) => {
    person.companies.forEach((company) => {
      if (company.name.toLowerCase().includes(searchTerm)) {
        // Avoid duplicates if a company is associated with multiple people
        const existingCompany = matchingCompanies.find(
          (c) => c.name.toLowerCase() === company.name.toLowerCase()
        );
        if (existingCompany) {
          if (!existingCompany.referrals.includes(person.name)) {
            existingCompany.referrals.push(person.name);
          }
        } else {
          matchingCompanies.push({
            name: company.name,
            careerPage: company.careerPage,
            referrals: [person.name],
          });
        }
      }
    });
  });

  // Display results
  if (matchingCompanies.length > 0 || matchingPeople.length > 0) {
    resultsDiv.style.display = "block";
  } else {
    resultsDiv.style.display = "none";
    return;
  }

  // Display company matches
  matchingCompanies.forEach((company) => {
    const companyDiv = document.createElement("div");
    companyDiv.className = "company-result";

    const companyNameDiv = document.createElement("div");
    companyNameDiv.className = "company-name";
    companyNameDiv.textContent = company.name;
    companyDiv.appendChild(companyNameDiv);

    const careerLinkDiv = document.createElement("div");
    careerLinkDiv.className = "career-link";
    careerLinkDiv.innerHTML = `<a href="${company.careerPage}" target="_blank">${company.careerPage}</a>`;
    companyDiv.appendChild(careerLinkDiv);

    if (company.referrals.length > 0) {
      const referralsDiv = document.createElement("div");
      referralsDiv.className = "referrals";
      referralsDiv.innerHTML = "<h3>Referrals:</h3>";
      const referralList = document.createElement("ul");
      company.referrals.forEach((referral) => {
        const li = document.createElement("li");
        li.textContent = referral;
        referralList.appendChild(li);
      });
      referralsDiv.appendChild(referralList);
      companyDiv.appendChild(referralsDiv);
    }

    resultsDiv.appendChild(companyDiv);
  });

  // Display person matches
  matchingPeople.forEach((person) => {
    const personDiv = document.createElement("div");
    personDiv.className = "person-result";

    const personNameDiv = document.createElement("div");
    personNameDiv.className = "person-name";
    personNameDiv.textContent = person.name;
    personDiv.appendChild(personNameDiv);

    const companiesDiv = document.createElement("div");
    companiesDiv.className = "companies";
    companiesDiv.innerHTML = "<h3>Can refer at:</h3>";
    const companyList = document.createElement("ul");
    person.companies.forEach((company) => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${company.careerPage}" target="_blank">${company.name}</a>`;
      companyList.appendChild(li);
    });
    companiesDiv.appendChild(companyList);
    personDiv.appendChild(companiesDiv);

    resultsDiv.appendChild(personDiv);
  });
});
