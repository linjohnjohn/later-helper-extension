/* global chrome */
import './transferMedia';
import './laterScheduleInterceptor';

console.log('background script attached')


// General Commands 
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.type === 'close') {
        chrome.tabs.remove(sender.tab.id);
    } else if (msg.type === 'log') {
        console.log(msg.message);
    }
});

// GRADUALLY OPEN TABS
chrome.tabs.onRemoved.addListener(function () {
    chrome.storage.local.get(['urls', 'isActivelyOpening'], function (data) {
        const { urls, isActivelyOpening } = data;
        if (!isActivelyOpening || urls === undefined || urls.length === 0) {
            return;
        }
        const nextLink = urls.pop();
        const isDone = urls.length === 0
        chrome.tabs.create({ url: nextLink, active: false });
        chrome.storage.local.set({ urls: data.urls, isActivelyOpening: !isDone });
    });
});
