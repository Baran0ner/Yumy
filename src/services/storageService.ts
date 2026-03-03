import storage from '@react-native-firebase/storage';

export const uploadMealPhoto = async (
  uid: string,
  dateKey: string,
  entryId: string,
  localFilePath: string,
): Promise<string> => {
  const extension = localFilePath.endsWith('.png') ? 'png' : 'jpg';
  const remotePath = `users/${uid}/photos/${dateKey}/${entryId}.${extension}`;
  const reference = storage().ref(remotePath);
  await reference.putFile(localFilePath);
  return reference.getDownloadURL();
};

