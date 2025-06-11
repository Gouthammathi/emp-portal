import { db } from '../../firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  getDoc
} from 'firebase/firestore';
 
// Create a new leave request
export const createLeaveRequest = async (leaveData) => {
  try {
    const leaveRef = await addDoc(collection(db, "leaveRequests"), {
      ...leaveData,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return leaveRef.id;
  } catch (error) {
    console.error("Error creating leave request:", error);
    throw error;
  }
};
 
// Get leave requests for an employee
export const getEmployeeLeaveRequests = async (employeeId) => {
  try {
    const q = query(
      collection(db, "leaveRequests"),
      where("employeeId", "==", employeeId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting employee leave requests:", error);
    throw error;
  }
};
 
// Get leave requests for approval (for managers/supermanagers/csuite)
export const getPendingLeaveRequests = async (approverId) => {
  try {
    const q = query(
      collection(db, "leaveRequests"),
      where("approverId", "==", approverId),
      where("status", "==", "pending")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting pending leave requests:", error);
    throw error;
  }
};
 
// Update leave request status
export const updateLeaveRequestStatus = async (requestId, status, approverComment = '') => {
  try {
    const leaveRef = doc(db, "leaveRequests", requestId);
    await updateDoc(leaveRef, {
      status,
      approverComment,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Error updating leave request status:", error);
    throw error;
  }
};
 
// Get user's manager/supermanager/csuite
export const getUserSuperior = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return null;
 
    const userData = userDoc.data();
    let superiorId = null;
 
    // Determine superior ID based on role
    if (userData.role === 'employee') {
      superiorId = userData.managerId;
    } else if (userData.role === 'manager') {
      superiorId = userData.superManagerId;
    } else if (userData.role === 'supermanager') {
      superiorId = userData.cid;
    }
 
    if (!superiorId) return null;
 
    // Query users collection to find the superior
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("empId", "==", superiorId));
    const querySnapshot = await getDocs(q);
 
    if (!querySnapshot.empty) {
      const superiorDoc = querySnapshot.docs[0];
      return {
        id: superiorDoc.id,
        ...superiorDoc.data()
      };
    }
 
    return null;
  } catch (error) {
    console.error("Error getting user superior:", error);
    return null;
  }
};
 