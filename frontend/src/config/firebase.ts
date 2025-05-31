// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyA4e0T25gZKYEqRkk0SrpgAo-AxW03Jiww',
  authDomain: 'helpdocs-46d7f.firebaseapp.com',
  projectId: 'helpdocs-46d7f',
  storageBucket: 'helpdocs-46d7f.firebasestorage.app',
  messagingSenderId: '975871580572',
  appId: '1:975871580572:web:43851f6362d467b7d65059',
  measurementId: 'G-XPQ2ZQ2PJM',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export { auth, createUserWithEmailAndPassword }
