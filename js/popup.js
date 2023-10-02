// popup.js

document.addEventListener('DOMContentLoaded', function () {
  const startRecordingBtn = document.querySelector('.recording-btn');
  const videoElement = document.createElement('video');
  let mediaRecorder;
  let isRecording = false;

  // Initialize sessionID to null
  let sessionID = null;

  // Check if sessionID is stored in chrome.storage
  chrome.storage.local.get('sessionID', function (result) {
    if (result.sessionID) {
      sessionID = result.sessionID;
    }
  });

  startRecordingBtn.addEventListener('click', toggleRecording);

  async function toggleRecording() {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });

        videoElement.srcObject = stream;
        videoElement.play();

        // Create a MediaRecorder to record the screen
        mediaRecorder = new MediaRecorder(stream);
        const chunks = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });

          // Send the blob to the server
          sendBlobToServer(blob);

          isRecording = false;
          startRecordingBtn.textContent = 'Start Recording';
        };

        mediaRecorder.start();
        isRecording = true;
        startRecordingBtn.textContent = 'Stop Recording';

        // Start a new recording session and get the session ID
        sessionID = await startRecordingSession();

        // Store the sessionID in chrome.storage
        chrome.storage.local.set({ 'sessionID': sessionID });
      } catch (error) {
        console.error('Error starting screen recording:', error);
      }
    } else {
      mediaRecorder.stop();
    }
  }

  async function startRecordingSession() {
    const response = await fetch('https://screen-recorder.fly.dev/start', {
      method: 'POST',
      body: new FormData(),
    });

    if (response.ok) {
      const data = await response.json();
      return data.id;
    } else {
      console.error('Error starting recording session:', response.statusText);
      return null;
    }
  }

  async function sendBlobToServer(blob) {
    if (!sessionID) {
      console.error('Session ID is missing. Cannot send blob.');
      return;
    }

    const formData = new FormData();
    formData.append('blob', blob);

    const url = `https://screen-recorder.fly.dev/sendBlob/${sessionID}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('Blob sent successfully.');
      } else {
        console.error('Error sending blob:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending blob:', error);
    }
  }
});
