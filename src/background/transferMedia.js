/* global chrome */

/* {
 *  tabId: {
 *      caption
 *      mediaType
 *      processingKey
 *      id
 *      groupId
 *      authHeader
 *  }
 * }
 */
const tabsToDetails = {};


console.log('transferMedia script attached');

// open later importing tab
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.type === 'savePost') {
        const { url, captions, credit, autoSchedule, profileId, profileIgName } = msg;
        const encodedLink = encodeURIComponent(url);
        chrome.storage.local.get('laterSlug', res => {
            let laterLink = `https://app.later.com/${res.laterSlug}/collect/import?url=${encodedLink}`;
            chrome.tabs.create({ url: laterLink, active: false }, function(tab) {
                tabsToDetails[tab.id] = { captions, credit, autoSchedule, profileId, profileIgName };
            });
        });
    }
});

// catch later api requests
const beforeRequestCallback = function(detail) {
    const { url, requestBody, tabId } = detail;
    const modificationDetails = tabsToDetails[tabId];

    if (modificationDetails === undefined) return;

    if (url.match(/https:\/\/app\.later\.com\/api\/v2\/media_items\/[0-9]+/)) {
        const arrayBuffer = new Uint8Array(requestBody.raw[0].bytes);
        const enc = new TextDecoder('utf-8');
        const stringJSON = enc.decode(arrayBuffer).replace(/\n/g, '\\n');
        console.log(stringJSON);
        const data = JSON.parse(stringJSON);
        const { processing_key: processingKey, source_username: credit, media_type: mediaType, group_id: groupId } = data.media_item;
        const id = url.replace('https://app.later.com/api/v2/media_items/', '');
        modificationDetails.credit = modificationDetails.credit || credit;
        modificationDetails.mediaType = mediaType;
        modificationDetails.processingKey = processingKey;
        modificationDetails.id = id;
        modificationDetails.groupId = groupId;
    }
};

const beforeSendHeadersCallback = function(detail) {
    const { url, requestHeaders, tabId } = detail;
    const modificationDetails = tabsToDetails[tabId];

    if (url.match(/https:\/\/app\.later\.com\/api\/v2\/media_items\/[0-9]+/)) {
        let authHeader = requestHeaders.filter(header => header.name.toLowerCase() === 'authorization')[0];
        authHeader = authHeader.value;
        modificationDetails.authHeader = authHeader;
        chrome.tabs.sendMessage(tabId, modificationDetails);
    }
}

const filter = { urls: ['https://app.later.com/api/v2/media_items/*'] };
chrome.webRequest.onBeforeRequest.addListener(beforeRequestCallback, filter, ['requestBody']);
chrome.webRequest.onBeforeSendHeaders.addListener(beforeSendHeadersCallback, filter, ['requestHeaders']);