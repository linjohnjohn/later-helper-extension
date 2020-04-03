/* global chrome */
import './transferMedia';
import './laterScheduleInterceptor';

console.log('background script attached')

// Init Later
// (async function initLater() {
//     const response = await fetch("https://app.later.com/api/v2/users/me");
//     if (response.status === 200) {
//         const data = await response.json();
//         const id = data.user.id
//         const userDetailsResponse = await fetch(`https://app.later.com/api/v2/users/${id}/accounts?userId=${id}`)
//         const userDetailData = await userDetailsResponse.json();
//         const mainGroupDetails = userDetailData.groups.filter(group => group.name === 'Main Group')[0]
//         const mainGroupSlug = mainGroupDetails.slug;
//         // const { slug, id: groupId, label_ids } = mainGroupDetails;
//         // chrome.storage.local.set({ laterId: id, laterSlug: slug, laterGroupId: groupId })
//     } else if (response.status === 401) {

//     }
// })();

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
