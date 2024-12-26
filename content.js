let volumeControlFn;
let initialized = false;

let video = null;
let audioCtx = null;
let gainNode = null;

chrome.runtime.sendMessage({ message: "loaded" });

chrome.runtime.onMessage.addListener((request) =>
{
  if (request.message === "set_volume_level" && typeof request.value === "number")
  {
    if (!initialized)
    {
      video = document.querySelector("video");
      if (!video) return "No video element found";

      audioCtx = new AudioContext();
      gainNode = audioCtx.createGain();
      audioCtx.createMediaElementSource(video).connect(gainNode).connect(audioCtx.destination);

      initialized = true;
    }
    gainNode.gain.value = request.value;
  }
});