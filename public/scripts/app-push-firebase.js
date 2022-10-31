let messaging;

function sendTokenToServer(token) {
  console.log('sendTokenToServer', token);

  fetch('./token/add', {
    method: 'post',
    body: JSON.stringify({token})
  }).then(function(response) {
    return response.json();
  }).then(function(data) {
    console.log('sendTokenToServer/response', data);
  });
}

function setTokenSentToServer(token) {
  console.log('setTokenSentToServer', token);
}

function updateUIForPushEnabled(token) {
  console.log('updateUIForPushEnabled', token);
}

function updateUIForPushPermissionRequired() {
  console.log('updateUIForPushPermissionRequired');
}

function showToken() {
  console.log('showToken');
}

function initFCM() {
  messaging = firebase.messaging();

  // Add the public key generated from the console here.
  messaging.usePublicVapidKey("BITwMJmRNH6MEsTa0nn7wLH9lRf9EQKkDNMb-sh6Dfpp7n53CAonhskRyqYCSaKl5uFyTKUic-lTAghDXUdxi3Q");

  // Get Instance ID token. Initially this makes a network call, once retrieved
  // subsequent calls to getToken will return from cache.
  messaging.getToken().then((currentToken) => {
    if (currentToken) {
      sendTokenToServer(currentToken);
      updateUIForPushEnabled(currentToken);
    } else {
      // Show permission request.
      console.log('No Instance ID token available. Request permission to generate one.');
      // Show permission UI.
      updateUIForPushPermissionRequired();
      setTokenSentToServer(false);
    }
  }).catch((err) => {
    console.log('An error occurred while retrieving token. ', err);
    showToken('Error retrieving Instance ID token. ', err);
    setTokenSentToServer(false);
  });

  // Callback fired if Instance ID token is updated.
  messaging.onTokenRefresh(() => {
    messaging.getToken().then((refreshedToken) => {
      console.log('Token refreshed.');
      // Indicate that the new Instance ID token has not yet been sent to the
      // app server.
      setTokenSentToServer(false);
      // Send Instance ID token to app server.
      sendTokenToServer(refreshedToken);
      // ...
    }).catch((err) => {
      console.log('Unable to retrieve refreshed token ', err);
      showToken('Unable to retrieve refreshed token ', err);
    });
  });
}

function swPush() {
  let scope = 'firebase-cloud-messaging-push-scope';
  navigator.serviceWorker.register('./firebase-messaging-sw.js', {scope})
    .then((registration) => {
      // messaging.useServiceWorker(registration);
      firebase.messaging().useServiceWorker(registration)

      initFCM();
    });
}

swPush();
