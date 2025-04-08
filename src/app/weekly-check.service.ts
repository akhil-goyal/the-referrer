import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, where, doc, setDoc, updateDoc, writeBatch } from '@angular/fire/firestore';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { WeeklyCheck } from '../types/weekly-check';

@Injectable({
  providedIn: 'root',
})
export class WeeklyCheckService {
  constructor(private firestore: Firestore) {}

  private getWeekStart(): string {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
  }

  getChecks(type: 'company' | 'recruitingFirm'): Observable<WeeklyCheck[]> {
    const weekStart = this.getWeekStart();

    const entities$ = collectionData(
      collection(this.firestore, type === 'company' ? 'referrals' : 'recruitingFirms'),
      { idField: 'id' }
    ).pipe(
      map(entities =>
        entities.map((e: any) => ({
          id: e.id,
          name: e.name,
          companies: e.companies, // For companies in referrals
          url: e.url, // For recruiting firms
        }))
      )
    );

    const checks$ = collectionData(
      query(
        collection(this.firestore, 'weeklyChecks'),
        where('type', '==', type),
        where('weekStart', '==', weekStart)
      ),
      { idField: 'id' }
    ) as Observable<WeeklyCheck[]>;

    return combineLatest([entities$, checks$]).pipe(
      map(([entities, checks]) => {
        const entityList = type === 'company'
          ? entities.flatMap((e: any) =>
              e.companies.map((c: any) => ({
                id: `${e.id}-${c.name}`,
                name: c.name,
                careerPage: c.careerPage, // Include career page for companies
              }))
            )
          : entities.map((e: any) => ({
              id: e.id,
              name: e.name,
              careerPage: e.url, // Use url as career page for recruiting firms
            }));

        return entityList.map(entity => {
          const check = checks.find(c => c.entityId === entity.id) || {
            entityId: entity.id,
            entityName: entity.name,
            careerPage: entity.careerPage, // Include career page in the check object
            type,
            weekStart,
            checked: false,
          };
          return check;
        });
      })
    );
  }

  async updateCheck(check: WeeklyCheck): Promise<void> {
    if (check.id) {
      const checkRef = doc(this.firestore, `weeklyChecks/${check.id}`);
      await updateDoc(checkRef, { checked: check.checked });
    } else {
      const newDocRef = doc(collection(this.firestore, 'weeklyChecks'));
      await setDoc(newDocRef, { ...check, id: newDocRef.id });
    }
  }

  async resetWeeklyChecks(): Promise<void> {
    const weekStart = this.getWeekStart();
    const lastWeekStart = new Date(new Date(weekStart).setDate(new Date(weekStart).getDate() - 7))
      .toISOString()
      .split('T')[0];

    const lastWeekChecks$ = collectionData(
      query(
        collection(this.firestore, 'weeklyChecks'),
        where('weekStart', '==', lastWeekStart)
      ),
      { idField: 'id' }
    ) as Observable<WeeklyCheck[]>;

    const lastWeekChecks = await firstValueFrom(lastWeekChecks$);

    const batch = writeBatch(this.firestore);
    lastWeekChecks?.forEach(check => {
      const checkRef = doc(this.firestore, `weeklyChecks/${check.id}`);
      if (check.checked) {
        batch.delete(checkRef);
      } else {
        batch.update(checkRef, { lastWeekMissed: true, weekStart });
      }
    });
    await batch.commit();
  }
}