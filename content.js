let volumeControlFn;
let initialized = false;

let mediaElements = [];
let audioCtx = null;
let gainNodes = new Map();

chrome.runtime.sendMessage({ message: "loaded" });

chrome.runtime.onMessage.addListener((request) =>
{
  if (request.message === "set_volume_level" && typeof request.value === "number")
  {
    if (!initialized)
    {
      // Find all video and audio elements
      mediaElements = [...document.querySelectorAll('video, audio')];
      if (mediaElements.length === 0) return "No media elements found";

      audioCtx = new AudioContext();

      // Create gain nodes for each media element
      mediaElements.forEach(element =>
      {
        const gainNode = audioCtx.createGain();
        audioCtx.createMediaElementSource(element)
          .connect(gainNode)
          .connect(audioCtx.destination);
        gainNodes.set(element, gainNode);
      });

      // Watch for new media elements being added
      const observer = new MutationObserver(mutations =>
      {
        mutations.forEach(mutation =>
        {
          mutation.addedNodes.forEach(node =>
          {
            if ((node.tagName === 'VIDEO' || node.tagName === 'AUDIO') && !gainNodes.has(node))
            {
              const gainNode = audioCtx.createGain();
              audioCtx.createMediaElementSource(node)
                .connect(gainNode)
                .connect(audioCtx.destination);
              gainNodes.set(node, gainNode);
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      initialized = true;
    }

    // Update gain for all media elements
    gainNodes.forEach(gainNode =>
    {
      gainNode.gain.value = request.value;
    });
  }
});