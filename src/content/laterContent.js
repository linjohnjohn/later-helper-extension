/* global chrome */

const chain = Promise.resolve();
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

let attempts = 0;
let hasBeenDone = {};

function tryGetCheckMark() {
    if (attempts >= 10) {
    window.location.reload();
    }
    const checkmarks = document.querySelectorAll('.o--media__labelIcon.i-check.is--visible.is--unchecked');
    if (checkmarks.length === 0) {
        console.log('checkmark failed');
        attempts += 1;
        chain.then(() => {
            return new Promise((resolve) => {
                setTimeout(resolve, 5000);
            });
        }).then(tryGetCheckMark);
    } else {
        checkmarks.forEach(checkmark => checkmark.click());
        const addToLib = document.querySelector('.o--btn.o--btn--primary');
        addToLib.click();
        chrome.runtime.onMessage.addListener(function(msg, sender) {
            if (!hasBeenDone[msg.id]) {
                hasBeenDone[msg.id] = true;
                console.log(sender);
                const modificationDetail = msg;
                setTimeout(() => {
                    makeLaterRequest(modificationDetail);
                }, 2000);
            }
            setTimeout(() => {
                chrome.runtime.sendMessage({ type: 'close' });
            }, 4000 + checkmarks.length * 1000);
        });
    };
}

chain.then(tryGetCheckMark);

function makeLaterRequest({ id, captions, credit, csrfToken, processingKey, mediaType, groupId, authHeader }) {
    chrome.storage.local.get(['laterLabelMap', 'selectedLabel'], ({ laterLabelMap, selectedLabel }) => {

        let label = "";
        if (laterLabelMap && selectedLabel) {
            label = `"${String(laterLabelMap[selectedLabel])}"`
        }

        const referer = window.location.href;
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
        fetch(`https://app.later.com/api/v2/media_items/${id}`, { credentials: 'include', headers: { accept: 'application/json, text/javascript, */*; q=0.01', 'accept-language': 'en-US,en;q=0.9', authorization: authHeader, 'cache-control': 'no-cache', 'content-type': 'application/json; charset=UTF-8', pragma: 'no-cache', 'sec-fetch-mode': 'cors', 'sec-fetch-site': 'same-origin', 'x-csrf-token': csrfToken, 'x-requested-with': 'XMLHttpRequest' }, referrer: referer, referrerPolicy: 'strict-origin-when-cross-origin', body: `{"media_item":{"active":true,"approved":true,"default_caption": "${caption}","height":null,"latitude":null,"longitude":null,"media_type":"${mediaType}","original_filename":null,"processing_bucket":"later-incoming","processing_key":"${processingKey}","processing_url":null,"show_modal":false,"source_type":null,"source_media_id":"0","source_url":null,"source_username":"","width":null,"group_id":"${groupId}","label_ids":[${label}],"submitted_by_id":null},"group_id":"${groupId}"}`, method: 'PUT', mode: 'cors' });
    })
}