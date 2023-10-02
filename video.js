// video.js

document.addEventListener('DOMContentLoaded', function () {
  const videoElement = document.querySelector('video');

  // Replace 'unique_session_id' with the actual session ID
  const sessionID = 'unique_session_id';

  // Fetch processed video data and set it as the source of the video element
  fetchProcessedVideo(sessionID)
    .then((videoData) => {
      if (videoData) {
        // Set the video data as the source of the <video> element
        videoElement.src = URL.createObjectURL(new Blob([videoData]));
      } else {
        console.error('Failed to fetch video data.');
      }
    })
    .catch((error) => {
      console.error('Error fetching video data:', error);
    });
});

async function fetchProcessedVideo(sessionID) {
  const url = `https://screen-recorder.fly.dev/recordings/${sessionID}`;

  try {
    const response = await fetch(url);

    if (response.ok) {
      const videoData = await response.arrayBuffer();
      return videoData;
    } else {
      console.error('Error fetching video data:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error fetching video data:', error);
    return null;
  }
}
