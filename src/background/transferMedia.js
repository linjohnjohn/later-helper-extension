import LaterSettingsAPI from "../model/LaterSettingsAPI";
import { waitThenDo } from "../utils/utils";

/* global chrome */
console.log('transferMedia script attached');

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

class ModificationDetails {
    constructor() {
        this.caption = '';
        this.mediaType = null;
        this.credit = null;
        this.processingKey = null;
        this.id = null;
        this.groupId = null;
    }

    static create(id, details) {
        let m = new ModificationDetails();
        m = Object.assign(m, details);
        tabsToDetails[id] = m;
        return m;
    }

    static get(id) {
        return tabsToDetails[id];
    }

    static delete(id) {
        delete tabsToDetails[id];
    }
}


// open later importing tab
chrome.runtime.onMessage.addListener(async function(msg, sender, sendResponse) {
    if (msg.type === 'savePost') {
        const { url, captions, credit, autoSchedule, profileId, profileIgName } = msg;
        const encodedLink = encodeURIComponent(url);
        const laterSettings = await LaterSettingsAPI.getLaterSettings();
        let laterLink = `https://app.later.com/${laterSettings.slug}/collect/import?url=${encodedLink}`;
        chrome.tabs.create({ url: laterLink, active: false }, function(tab) {
            ModificationDetails.create(tab.id, { captions, credit });
        });
    }
});

// catch later api requests
const beforeRequestCallback = async function(detail) {
    const { url, requestBody, tabId } = detail;
    const modificationDetails = ModificationDetails.get(tabId);

    if (modificationDetails === undefined) return;

    if (url.match(/https:\/\/app\.later\.com\/api\/v2\/media_items\/[0-9]+/)) {
        const arrayBuffer = new Uint8Array(requestBody.raw[0].bytes);
        const enc = new TextDecoder('utf-8');
        const stringJSON = enc.decode(arrayBuffer).replace(/\n/g, '\\n');
        const data = JSON.parse(stringJSON);
        const { processing_key: processingKey, source_username: credit, media_type: mediaType, group_id: groupId } = data.media_item;
        const id = url.replace('https://app.later.com/api/v2/media_items/', '');
        modificationDetails.id = id;
        modificationDetails.credit = modificationDetails.credit || credit;
        modificationDetails.mediaType = mediaType;
        modificationDetails.processingKey = processingKey;
        modificationDetails.groupId = groupId;
        const u = { ...modificationDetails };
        await waitThenDo(async () => {
            await makeLaterRequest(u);
        }, 3000);

        // ModificationDetails.delete(tabId);
    }
};

async function makeLaterRequest({ id, captions, credit, processingKey, mediaType, groupId }) {
    const laterSettings = await LaterSettingsAPI.getLaterSettings();
    const { labels, selectedLabel } = laterSettings;

    let label = "";
    if (labels && selectedLabel) {
        label = `"${String(labels[selectedLabel])}"`
    }

    const captionObject = { captions, credit };
    const caption = JSON.stringify(captionObject)
        .replace(/[\\]/g, '\\\\')
        .replace(/[\"]/g, '\\\"')
        .replace(/[\/]/g, '\\/')
        .replace(/[\b]/g, '\\b')
        .replace(/[\f]/g, '\\f')
        .replace(/[\n]/g, '\\n')
        .replace(/[\r]/g, '\\r')
        .replace(/[\t]/g, '\\t');
    processingKey = 'null';
    fetch(`https://app.later.com/api/v2/media_items/${id}`, { headers: {'content-type': 'application/json; charset=UTF-8' }, body: `{"media_item":{"active":true,"approved":true,"default_caption": "${caption}","height":null,"latitude":null,"longitude":null,"media_type":"${mediaType}","original_filename":null,"processing_bucket":"later-incoming","processing_key":"${processingKey}","processing_url":null,"show_modal":false,"source_type":null,"source_media_id":"0","source_url":null,"source_username":"","width":null,"group_id":"${groupId}","label_ids":[${label}],"submitted_by_id":null},"group_id":"${groupId}"}`, method: 'PUT' })
}

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
// chrome.webRequest.onBeforeSendHeaders.addListener(beforeSendHeadersCallback, filter, ['requestHeaders']);