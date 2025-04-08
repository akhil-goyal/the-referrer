import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
  doc,
  setDoc,
  updateDoc,
  writeBatch,
  deleteDoc,
} from '@angular/fire/firestore';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs'; // Import firstValueFrom
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
      collection(
        this.firestore,
        type === 'company' ? 'referrals' : 'recruitingFirms'
      ),
      { idField: 'id' }
    ).pipe(
      map((entities) =>
        entities.map((e: any) => ({
          id: e.id,
          name: e.name,
          companies: e.companies,
          url: e.url,
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
        const entityList =
          type === 'company'
            ? entities.flatMap((e: any) =>
                e.companies.map((c: any) => ({
                  id: `${e.id}-${c.name}`,
                  name: c.name,
                }))
              )
            : entities.map((e: any) => ({ id: e.id, name: e.name }));

        return entityList.map((entity) => {
          const check = checks.find((c) => c.entityId === entity.id) || {
            entityId: entity.id,
            entityName: entity.name,
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
    const lastWeekStart = new Date(
      new Date(weekStart).setDate(new Date(weekStart).getDate() - 7)
    )
      .toISOString()
      .split('T')[0];

    // Fetch last week's checks
    const lastWeekChecks$ = collectionData(
      query(
        collection(this.firestore, 'weeklyChecks'),
        where('weekStart', '==', lastWeekStart)
      ),
      { idField: 'id' }
    ) as Observable<WeeklyCheck[]>;

    const lastWeekChecks = await firstValueFrom(lastWeekChecks$);

    // Use writeBatch for batch operations
    const batch = writeBatch(this.firestore);
    lastWeekChecks?.forEach((check) => {
      const checkRef = doc(this.firestore, `weeklyChecks/${check.id}`);
      if (check.checked) {
        batch.delete(checkRef); // Delete checked items
      } else {
        batch.update(checkRef, { lastWeekMissed: true, weekStart }); // Update unchecked items
      }
    });
    await batch.commit();
  }
}
