import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Assuming db is exported from ../firebase

export const fetchUserNamesByIds = async (userIds) => {
  if (!userIds || userIds.length === 0) {
    return {};
  }

  const names = {};
  // Firestore `in` query supports up to 10 items
  const chunkedUserIds = [];
  for (let i = 0; i < userIds.length; i += 10) {
    chunkedUserIds.push(userIds.slice(i, i + 10));
  }

  for (const chunk of chunkedUserIds) {
    try {
      const usersQuery = query(collection(db, 'users'), where('__name__', 'in', chunk));
      const querySnapshot = await getDocs(usersQuery);
      querySnapshot.forEach(doc => {
        const userData = doc.data();
        names[doc.id] = userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown User';
      });
    } catch (error) {
      console.error('Error fetching user names for chunk:', chunk, error);
      // Continue with other chunks even if one fails
    }
  }
  
  return names;
}; 