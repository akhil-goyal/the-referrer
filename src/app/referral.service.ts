import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  setDoc,
  doc,
  getDocs,
  query,
  deleteDoc,
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Referrer } from './../types/referrer';

@Injectable({
  providedIn: 'root',
})
export class ReferralService {
  private referrals: Referrer[] = [
    {
      name: 'Anita',
      companies: [{ name: 'RBC', careerPage: 'https://jobs.rbc.com/' }],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Raymond',
      companies: [{ name: 'RBC', careerPage: 'https://jobs.rbc.com/' }],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Dileep',
      companies: [{ name: 'RBC', careerPage: 'https://jobs.rbc.com/' }],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Bryce',
      companies: [{ name: 'RBC', careerPage: 'https://jobs.rbc.com/' }],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Jeferrin',
      companies: [
        { name: 'Amazon AWS', careerPage: 'https://aws.amazon.com/careers/' },
      ],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Vidhi',
      companies: [
        { name: 'Synechron', careerPage: 'https://www.synechron.com/careers' },
        { name: 'Citibank', careerPage: 'https://jobs.citi.com/' },
      ],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Anoop',
      companies: [
        { name: 'Synechron', careerPage: 'https://www.synechron.com/careers' },
        { name: 'Citibank', careerPage: 'https://jobs.citi.com/' },
      ],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Sadiq',
      companies: [{ name: 'TCS', careerPage: 'https://www.tcs.com/careers' }],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Nirav Karia',
      companies: [
        {
          name: 'Persistent Systems',
          careerPage: 'https://www.persistent.com/careers/',
        },
      ],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Tannu',
      companies: [
        {
          name: 'CIBC',
          careerPage: 'https://www.cibc.com/en/about-cibc/careers.html',
        },
      ],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Hema',
      companies: [
        {
          name: 'CIBC',
          careerPage: 'https://www.cibc.com/en/about-cibc/careers.html',
        },
      ],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Deepti',
      companies: [
        {
          name: 'CIBC',
          careerPage: 'https://www.cibc.com/en/about-cibc/careers.html',
        },
        {
          name: 'Metrolynx',
          careerPage: 'https://www.metrolinx.com/en/about-us/careers',
        },
        { name: 'ONXpress', careerPage: 'https://www.onxpress.com/careers' },
        {
          name: 'TD Bank',
          careerPage: 'https://td.wd3.myworkdayjobs.com/en-US/TD_Bank_Careers',
        },
      ],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Jatin',
      companies: [
        { name: 'IBM', careerPage: 'https://www.ibm.com/ca-en/careers' },
      ],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Akash',
      companies: [
        { name: 'IBM', careerPage: 'https://www.ibm.com/ca-en/careers' },
      ],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Ammy',
      companies: [
        { name: 'ICICI Bank', careerPage: 'https://www.icicibank.ca/careers' },
      ],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Suriti',
      companies: [
        {
          name: 'Bruce Power',
          careerPage: 'https://www.brucepower.com/careers/',
        },
        {
          name: 'Ontario Power Group',
          careerPage: 'https://www.opg.com/careers/',
        },
      ],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Yashesh Dave',
      companies: [
        {
          name: 'Ontario Power Group',
          careerPage: 'https://www.opg.com/careers/',
        },
      ],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Mukul',
      companies: [
        {
          name: 'LTIMindtree',
          careerPage: 'https://www.ltimindtree.com/careers/',
        },
        { name: 'Cognizant', careerPage: 'https://careers.cognizant.com/' },
        { name: 'Microsoft', careerPage: 'https://careers.microsoft.com/' },
        {
          name: 'Manulife',
          careerPage: 'https://www.manulife.ca/careers.html',
        },
        { name: 'McDonalds', careerPage: 'https://careers.mcdonalds.com/' },
        {
          name: 'Blue Yonder',
          careerPage: 'https://www.blueyonder.com/careers',
        },
      ],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Harneet',
      companies: [
        { name: 'CGI', careerPage: 'https://www.cgi.com/en/careers' },
      ],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Lakshay',
      companies: [
        {
          name: 'Porter Airlines',
          careerPage: 'https://www.flyporter.com/en/careers',
        },
      ],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Hema Jampala',
      companies: [
        { name: 'CPPIB', careerPage: 'https://www.cppib.com/en/careers/' },
        { name: 'Intuit', careerPage: 'https://www.intuit.com/careers/' },
      ],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: "Dilpreet's Husband",
      companies: [
        {
          name: 'OSFI',
          careerPage:
            'https://www.osfi-bsif.gc.ca/Eng/wt-ow/Pages/careers.aspx',
        },
      ],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Dilpreet',
      companies: [{ name: 'Intact', careerPage: 'https://careers.intact.ca/' }],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Charles K.',
      companies: [
        {
          name: 'Christie',
          careerPage: 'https://www.christiedigital.com/careers/',
        },
      ],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Jason Hollingsworth',
      companies: [
        {
          name: 'TEKSystems',
          careerPage: 'https://www.teksystems.com/en/careers',
        },
      ],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Mani Dhiman',
      companies: [
        {
          name: 'Warner Bros.',
          careerPage: 'https://www.warnerbroscareers.com/',
        },
      ],
      phone: '',
      email: '',
      linkedin: '',
    },
    {
      name: 'Davinder Saggu',
      companies: [
        {
          name: 'Ross Video',
          careerPage:
            'https://us231.dayforcehcm.com/CandidatePortal/en-US/rossvideo',
        },
        {
          name: 'Bank of Canada',
          careerPage:
            'https://careers.bankofcanada.ca/go/All-Job-Opportunities/2400817/?locale=en_US',
        },
        {
          name: 'TD Bank',
          careerPage: 'https://td.wd3.myworkdayjobs.com/en-US/TD_Bank_Careers',
        },
        {
          name: 'Ford',
          careerPage:
            'https://efds.fa.em5.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1/jobs?location=Canada&locationId=300000000425151&locationLevel=country&mode=location',
        },
      ],
      phone: '',
      email: '',
      linkedin: '',
    },
  ];

  constructor(private firestore: Firestore) {}

  async migrateDataToFirestore() {
    const referralsCollection = collection(this.firestore, 'referrals');
    const snapshot = await getDocs(referralsCollection);

    if (snapshot.empty) {
      console.log('Migrating data to Firestore...');
      for (const referral of this.referrals) {
        const docRef = doc(referralsCollection, referral.name);
        await setDoc(docRef, referral);
      }
      console.log('Migration complete!');
    } else {
      console.log('Data already exists in Firestore, updating schema...');
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        if (!data['phone'] || !data['email'] || !data['linkedin']) {
          await setDoc(docSnapshot.ref, {
            ...data,
            phone: data['phone'] || '',
            email: data['email'] || '',
            linkedin: data['linkedin'] || '',
          });
        }
      }
      console.log('Schema update complete!');
    }
  }

  getReferrals(): Observable<Referrer[]> {
    const referralsCollection = collection(this.firestore, 'referrals');
    return from(getDocs(query(referralsCollection))).pipe(
      map((snapshot) => snapshot.docs.map((doc) => doc.data() as Referrer))
    );
  }

  async addOrUpdateReferral(
    personName: string,
    companyName: string,
    careerPage: string
  ) {
    const referralsCollection = collection(this.firestore, 'referrals');
    const docRef = doc(referralsCollection, personName);

    const snapshot = await getDocs(query(referralsCollection));
    const existingPerson = snapshot.docs
      .find((doc) => doc.id.toLowerCase() === personName.toLowerCase())
      ?.data() as Referrer | undefined;

    if (existingPerson) {
      const existingCompany = existingPerson.companies.find(
        (c) =>
          c.name.toLowerCase() === companyName.toLowerCase() ||
          c.careerPage.toLowerCase() === careerPage.toLowerCase()
      );
      if (!existingCompany) {
        existingPerson.companies.push({
          name: companyName,
          careerPage: careerPage,
        });
      }
      await setDoc(docRef, existingPerson);
    } else {
      await setDoc(docRef, {
        name: personName,
        companies: [{ name: companyName, careerPage: careerPage }],
        phone: '',
        email: '',
        linkedin: '',
      });
    }
  }

  async updateReferrer(originalName: string, updatedReferrer: Referrer) {
    const referralsCollection = collection(this.firestore, 'referrals');
    if (originalName !== updatedReferrer.name) {
      await this.deleteReferrer(originalName);
    }
    const docRef = doc(referralsCollection, updatedReferrer.name);
    await setDoc(docRef, updatedReferrer);
  }

  async deleteReferrer(referrerName: string) {
    const referralsCollection = collection(this.firestore, 'referrals');
    const docRef = doc(referralsCollection, referrerName);
    await deleteDoc(docRef);
  }

  getRecruitingFirms(): Observable<any[]> {
    const recruitingFirmsCollection = collection(
      this.firestore,
      'recruitingFirms'
    );
    return from(getDocs(query(recruitingFirmsCollection))).pipe(
      map((snapshot) => snapshot.docs.map((doc) => doc.data()))
    );
  }

  async migrateRecruitingFirmsToFirestore() {
    const recruitingFirmsCollection = collection(
      this.firestore,
      'recruitingFirms'
    );
    const snapshot = await getDocs(recruitingFirmsCollection);

    const recruitingFirms = [
      {
        name: 'Quality IT Resourcing',
        url: 'https://qitresourcing.com/jobopenings',
      },
      { name: 'Tundra Technical', url: 'https://jobs.tundratechnical.ca' },
      { name: 'DevStaff', url: 'https://devstaff.ca' },
      {
        name: 'HireVouch',
        url: 'https://www.hirevouch.com/jobs?vac.com/home#search',
      },
      { name: 'Adecco', url: 'https://candidate.adecco.com/home' },
      { name: 'Allegis Group', url: 'https://www.allegisgroup.com/en/careers' },
      { name: 'Randstad', url: 'https://www.randstad.ca' },
      { name: 'Alquemy', url: 'https://careers.alquemy.com' },
      { name: 'eTeam Inc', url: 'https://www.eteaminc.com/careers/' },
      {
        name: 'Persus Group',
        url: 'https://talentmanagement.solution.wd3.myworkdayjobs.com/en-US/persus-careers/details/Software-Developer_R432339?locationRegionStateProvince=218a720b2e',
      },
      { name: 'LHH', url: 'https://www.lhh.com/us/en' },
      { name: 'Axelon', url: 'https://www.axelon.com/' },
      { name: 'LorvenTech', url: 'https://lorventech.com' },
      { name: 'Akkodis', url: 'https://www.akkodis.com' },
      { name: 'Dawn Infotek', url: 'https://dawninfotek.com/job-openings/' },
      { name: 'Canonical', url: 'https://canonical.com/careers/all' },
      { name: 'W3Global', url: 'https://www.w3global.com' },
    ];

    if (snapshot.empty) {
      console.log('Migrating recruiting firms to Firestore...');
      for (const firm of recruitingFirms) {
        const docRef = doc(recruitingFirmsCollection, firm.name);
        await setDoc(docRef, firm);
      }
      console.log('Recruiting firms migration complete!');
    } else {
      console.log(
        'Recruiting firms already exist in Firestore, skipping migration.'
      );
    }
  }
}
