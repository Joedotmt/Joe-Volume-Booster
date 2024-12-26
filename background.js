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
        console.log("tab loaded, changing volume of tab id:", sender.tab.id);
        updateVol();
        break;
      case "sliderchange":
        volumeMultiplier = request.value;
        updateVol();
        break;
      case "enabled":
        isEnabled = request.value;
        if (isEnabled == false)
        {

        }
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
  // wont work if volume level is a string
  volumeMultiplier = parseFloat(volumeMultiplier);
  updateBadge(volumeMultiplier, isEnabled);

  let actualVal = isEnabled ? volumeMultiplier : 1;
  chrome.tabs.query({}, function (tabs)
  {
    tabs.forEach(function (tab)
    {
      chrome.tabs.sendMessage(tab.id, {
        message: "set_volume_level",
        value: actualVal,
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
