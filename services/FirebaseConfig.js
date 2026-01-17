// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBlzoQXLifJN6ucWeWBXJP9iCMukJY1Vuw",
    authDomain: "are-you-ok-f9ef9.firebaseapp.com",
    projectId: "are-you-ok-f9ef9",
    storageBucket: "are-you-ok-f9ef9.firebasestorage.app",
    messagingSenderId: "126599587793",
    appId: "1:126599587793:web:d0efd55ec100f26fe7a2f0",
    measurementId: "G-S9831LK7T9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});