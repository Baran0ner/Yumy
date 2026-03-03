import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore, { type FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';

const deleteCollection = async (ref: FirebaseFirestoreTypes.CollectionReference): Promise<void> => {
  const snapshot = await ref.get();
  await Promise.all(snapshot.docs.map(doc => doc.ref.delete()));
};

const deleteDaysTree = async (uid: string): Promise<void> => {
  const daysCollection = firestore().collection('users').doc(uid).collection('days');
  const dayDocs = await daysCollection.get();

  for (const dayDoc of dayDocs.docs) {
    const entries = await dayDoc.ref.collection('entries').get();
    await Promise.all(entries.docs.map(entry => entry.ref.delete()));
    await dayDoc.ref.delete();
  }
};

const deleteSavedMeals = async (uid: string): Promise<void> => {
  const savedMeals = firestore().collection('users').doc(uid).collection('savedMeals');
  await deleteCollection(savedMeals);
};

const deleteUserRootDoc = async (uid: string): Promise<void> => {
  await firestore().collection('users').doc(uid).delete();
};

const deleteStoragePhotos = async (uid: string): Promise<void> => {
  try {
    const root = storage().ref(`users/${uid}/photos`);
    const list = await root.listAll();

    const deleteRefs = async (refs: typeof list.items, prefixes: typeof list.prefixes): Promise<void> => {
      await Promise.all(refs.map(ref => ref.delete().catch(() => undefined)));
      for (const prefix of prefixes) {
        const nested = await prefix.listAll();
        await deleteRefs(nested.items, nested.prefixes);
      }
    };

    await deleteRefs(list.items, list.prefixes);
  } catch {
    // Best effort cleanup.
  }
};

const reauthenticateUser = async (user: FirebaseAuthTypes.User): Promise<void> => {
  const providerIds = user.providerData.map(provider => provider.providerId);

  if (providerIds.includes('google.com')) {
    const response = await GoogleSignin.signIn();
    const idToken = response.data?.idToken;
    if (!idToken) {
      throw new Error('Google re-auth token missing.');
    }

    const credential = auth.GoogleAuthProvider.credential(idToken);
    await user.reauthenticateWithCredential(credential);
    return;
  }

  if (providerIds.includes('apple.com')) {
    const appleResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL],
    });

    if (!appleResponse.identityToken) {
      throw new Error('Apple re-auth token missing.');
    }

    const credential = auth.AppleAuthProvider.credential(
      appleResponse.identityToken,
      appleResponse.nonce,
    );
    await user.reauthenticateWithCredential(credential);
    return;
  }
};

export const deleteCurrentAccount = async (): Promise<void> => {
  const user = auth().currentUser;
  if (!user) {
    return;
  }

  await reauthenticateUser(user);

  await Promise.allSettled([
    deleteDaysTree(user.uid),
    deleteSavedMeals(user.uid),
    deleteStoragePhotos(user.uid),
  ]);

  await deleteUserRootDoc(user.uid).catch(() => undefined);
  await user.delete();
};

