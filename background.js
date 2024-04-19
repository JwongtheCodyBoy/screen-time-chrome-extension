let currentTabId = null;
let startTime = Date.now();

chrome.alarms.create('trackTime', { periodInMinutes: 1 / 12 }); // 5 seconds

function updateCurrentTabTime() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length === 0) return;
        
        let tab = tabs[0];
        if (!tab.url) return; 
        
        let url = new URL(tab.url).hostname;
        let currentTime = Date.now();
        
        if (currentTabId === tab.id) 
        {
          let timeSpent = (currentTime - startTime) / 1000; //ms to seconds
          updateSiteTime(url, timeSpent);
        }
        
        currentTabId = tab.id;
        startTime = currentTime;
    });
}

function updateSiteTime(url, timeSpent)
{
    chrome.storage.local.get({siteTime: {}}, function(data){
        let siteTime = data.siteTime;
        
        if(siteTime[url])
        {
            siteTime[url] += timeSpent;
        }
        else
        {
            siteTime[url] = timeSpent;
        }
        
        chrome.storage.local.set({siteTime}, () => {console.log('Site time updated', siteTime)});
    });
}

chrome.alarms.onAlarm.addListener((alarm) => {
    if(alarm.name == 'trackTime')
    {
        updateCurrentTabTime()
        
    }
})

chrome.tabs.onActivated.addListener(function(activateInfo){
    startTime = Date.now();
    currentTabId = activeInfo.tabId;
})

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (tab.active && changeInfo.url) {
    let url = new URL(changeInfo.url).hostname;
    let currentTime = Date.now();
    let timeSpent = (currentTime - startTime) / 1000;
    updateSiteTime(url, timeSpent);
    // Reset the timer for the current tab
    startTime = currentTime;
    currentTabId = tabId;
  }
});

chrome.windows.onFocusChanged.addListener(function(windowId){
    if (windowId === chrome.windows.WINDOW_ID_NONE)
    {
        currentTabId = null;
    }
    else
    {
        chrome.tabs.query({active: true, windowId: windowId, function(tabs){
            if(yabs.length > 0)
            {
                currentTabId = tabs[0].id;
            }
        }})
    }
    startTime = Date.now();
})