// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/7.15.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.15.1/firebase-messaging.js');

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyACBnZSPa5ePbpOdC1oe13vD7h_EfgSYKI",
  authDomain: "openweather-64dbd.firebaseapp.com",
  databaseURL: "https://openweather-64dbd.firebaseio.com",
  projectId: "openweather-64dbd",
  storageBucket: "openweather-64dbd.appspot.com",
  messagingSenderId: "274027155307",
  appId: "1:274027155307:web:569c0bac457201a483462e",
  measurementId: "G-B8D69CV34Z"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Customize notification here
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: './images/icons/icon-128x128.png',
    badge: './images/icons/icon-128x128.png'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(self.location.href.replace('/firebase-messaging-sw.js', '')));
});
