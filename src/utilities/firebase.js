// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getDatabase,  onValue, ref, update, get,} from "firebase/database"
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { useCallback, useState, useEffect } from "react";

// Your wefirebase deploy --only hosting:tasktitan app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCORolstruuJzBTNGnRCFdUtsU1rx3bBX0",
    authDomain: "dealwiththedevil-7629d.firebaseapp.com",
    projectId: "dealwiththedevil-7629d",
    storageBucket: "dealwiththedevil-7629d.firebasestorage.app",
    messagingSenderId: "1098272609521",
    appId: "1:1098272609521:web:3e47fb96f741b626ecc550",
    measurementId: "G-XSWT3XZXSP"
  };
  
// Initialize Firebase
const firebase = initializeApp(firebaseConfig);

const database = getDatabase(firebase);
const auth = getAuth(firebase);

export { firebase, database, auth };

export const signInWithGoogle = async() => {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    return result;
};

export const signOut = () => firebaseSignOut(auth);

export const useAuthState = () => {
    const [user, setUser] = useState();
    useEffect(() => (
        onAuthStateChanged(auth, setUser)
    ), []);

    return [user];
};

export const useDbData = (path) => {
    const [data, setData] = useState();
    const [error, setError] = useState(null);

    useEffect(() => (
        onValue(ref(database, path), (snapshot) => {
            setData(snapshot.val());
        }, (error) => {
            setError(error);
        })
    ), [path]);

    return [data, error];
};


export const useDbUpdate = (path) => {
    const [result, setResult] = useState();
    const updateData = useCallback(async (value) => {
        console.log('Updating path:', path);
        console.log('Value before update:', value);

        if (!value || typeof value !== 'object') {
            console.error("Invalid value passed to updateData:", value);
            return;
        }

        const dbRef = ref(database, path);
        update(dbRef, value)
            .then(() => setResult(makeResult()))
            .catch((error) => {
                console.error("Error during Firebase update:", error);
                setResult(makeResult(error));
            });
    }, [path]);

    return [updateData, result];
};