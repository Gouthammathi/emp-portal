import React from 'react'
import { Navigate } from 'react-router-dom'
import { auth } from '../../firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase'

const ProtectedRoute = ({ children, allowedRoles = ['admin'] }) => {
  const [user, loading] = useAuthState(auth)
  const [userRole, setUserRole] = React.useState(null)
  const [checkingRole, setCheckingRole] = React.useState(true)

  React.useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role?.toLowerCase())
          }
        } catch (error) {
          console.error('Error fetching user role:', error)
        }
      }
      setCheckingRole(false)
    }

    checkUserRole()
  }, [user])

  if (loading || checkingRole) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check if the user has the required role
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/access-denied" replace />
  }

  return children
}

export default ProtectedRoute 