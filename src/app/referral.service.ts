import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  setDoc,
  doc,
  getDocs,
  query,
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ReferralService {
  constructor(private firestore: Firestore) {}

  // Get all referrals from Firestore as an Observable
  getReferrals(): Observable<any[]> {
    const referralsCollection = collection(this.firestore, 'referrals');
    return from(getDocs(query(referralsCollection))).pipe(
      map((snapshot) => snapshot.docs.map((doc) => doc.data()))
    );
  }

  // Add or update a referral in Firestore
  async addOrUpdateReferral(
    personName: string,
    companyName: string,
    careerPage: string
  ) {
    const referralsCollection = collection(this.firestore, 'referrals');
    const docRef = doc(referralsCollection, personName);

    // Fetch existing data
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
}
