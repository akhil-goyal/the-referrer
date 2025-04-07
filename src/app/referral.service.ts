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

@Injectable({
  providedIn: 'root',
})
export class ReferralService {
  constructor(private firestore: Firestore) {}

  // Existing methods
  getReferrals(): Observable<any[]> {
    const referralsCollection = collection(this.firestore, 'referrals');
    return from(getDocs(query(referralsCollection))).pipe(
      map((snapshot) => snapshot.docs.map((doc) => doc.data()))
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
      ?.data();

    if (existingPerson) {
      const existingCompany = existingPerson['companies'].find(
        (c: any) =>
          c.name.toLowerCase() === companyName.toLowerCase() ||
          c.careerPage.toLowerCase() === careerPage.toLowerCase()
      );
      if (!existingCompany) {
        existingPerson['companies'].push({
          name: companyName,
          careerPage: careerPage,
        });
      }
      await setDoc(docRef, existingPerson);
    } else {
      await setDoc(docRef, {
        name: personName,
        companies: [{ name: companyName, careerPage: careerPage }],
      });
    }
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

  // New methods for edit and delete
  async updateReferrer(originalName: string, updatedReferrer: any) {
    const referralsCollection = collection(this.firestore, 'referrals');
    // If the name has changed, delete the old document and create a new one
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
}
