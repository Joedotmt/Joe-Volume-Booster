initialize();
let volumeMultiplier = 4;
let isEnabled = false;

// Initializes the communication to the content script
function initialize()
{
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>
  {
    switch (request.message)
    {
      case "loaded":
        if (isEnabled)
        {
          console.log("tab loaded, changing volume of tab id:", sender.tab.id);
          updateVol();
        }
        break;
      case "sliderchange":
        if (isEnabled)
        {
          volumeMultiplier = request.value;
          updateVol();
        }
        break;
      case "enabled":
        isEnabled = request.value;
        break;
      default:
        break;
    }
  });


}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>
{
  if (message.message === 'init_popup')
  {
    sendResponse({ volume: volumeMultiplier, enabled: isEnabled });
  }
});

function updateVol()
{
  volumeMultiplier = parseFloat(volumeMultiplier);
  updateBadge(volumeMultiplier, isEnabled);

  let actualVal = isEnabled ? volumeMultiplier : 1;
  chrome.tabs.query({}, function (tabs)
  {
    tabs.forEach(function (tab)
    {
      // Skip chrome:// and edge:// pages
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://'))
      {
        return;
      }

      // Send message with error handling
      chrome.tabs.sendMessage(tab.id, {
        message: "set_volume_level",
        value: actualVal,
      }).catch(error =>
      {
        // Silently ignore "receiving end does not exist" errors
        if (!error.message.includes('Receiving end does not exist'))
        {
          console.error(`Error sending message to tab ${tab.id}:`, error);
        }
      });
    });
  });
}

// Sets the multiplier badge text
function updateBadge(multiplierValue, isEnabled)
{
  if (multiplierValue == 1 || !isEnabled)
  {
    chrome.action.setBadgeText({
      text: ``,
    });
    return;
  }
  chrome.action.setBadgeText({
    text: `${multiplierValue}x`,
  });
}
