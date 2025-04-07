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
import { Referrer, JobPosting } from './../types/referrer';

@Injectable({
  providedIn: 'root',
})
export class ReferralService {
  constructor(private firestore: Firestore) {}

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

  getJobPostings(): Observable<JobPosting[]> {
    const jobPostingsCollection = collection(this.firestore, 'jobPostings');
    return from(getDocs(query(jobPostingsCollection))).pipe(
      map(
        (snapshot) =>
          snapshot.docs.map((doc) => ({
            id: doc.id, // Include the document ID
            ...doc.data(),
          })) as JobPosting[]
      )
    );
  }

  async deleteJobPosting(jobId: string) {
    const jobPostingsCollection = collection(this.firestore, 'jobPostings');
    const docRef = doc(jobPostingsCollection, jobId);
    await deleteDoc(docRef);
  }
}
