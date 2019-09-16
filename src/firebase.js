import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

//fire base initial set up using javascript
//different than calling rest apis, use firebase javascript sdks
//set up frebase javascript by initialize it with module bundler


var firebaseConfig = {
    apiKey: "AIzaSyDUxz1XNf2BbMoO2_8mHgX6iyKpB0ekhZs",
    authDomain: "slackaz-3fb88.firebaseapp.com",
    databaseURL: "https://slackaz-3fb88.firebaseio.com",
    projectId: "slackaz-3fb88",
    storageBucket: "slackaz-3fb88.appspot.com",
    messagingSenderId: "721602848250",
    appId: "1:721602848250:web:72d09211f87d19d80df043"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


export default firebase;