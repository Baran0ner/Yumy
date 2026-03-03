import firestore from '@react-native-firebase/firestore';

export const usersCollection = () => firestore().collection('users');

export const userDocRef = (uid: string) => usersCollection().doc(uid);

export const dayDocRef = (uid: string, dateKey: string) => userDocRef(uid).collection('days').doc(dateKey);

export const entriesCollectionRef = (uid: string, dateKey: string) =>
  dayDocRef(uid, dateKey).collection('entries');

export const entryDocRef = (uid: string, dateKey: string, entryId: string) =>
  entriesCollectionRef(uid, dateKey).doc(entryId);

export const savedMealsCollectionRef = (uid: string) => userDocRef(uid).collection('savedMeals');

export const savedMealDocRef = (uid: string, mealId: string) => savedMealsCollectionRef(uid).doc(mealId);

export const analyticsEventsCollectionRef = (uid: string) => userDocRef(uid).collection('analyticsEvents');

