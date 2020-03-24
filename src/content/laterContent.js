/* global chrome */

const chain = Promise.resolve();
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

let attempts = 0;
let change = true;

function tryGetCheckMark() {
    if (attempts >= 10) {
    window.location.reload();
    }
    const checkmark = document.querySelector('.o--media__labelIcon.i-check.is--visible.is--unchecked');
    if (checkmark === null) {
        console.log('checkmark failed');
        attempts += 1;
        chain.then(() => {
            return new Promise((resolve) => {
                setTimeout(resolve, 5000);
            });
        }).then(tryGetCheckMark);
    } else {
        checkmark.click();
        const addToLib = document.querySelector('.o--btn.o--btn--primary');
        addToLib.click();
        chrome.runtime.onMessage.addListener(function(msg, sender) {
            if (change) {
                change = false;
                console.log(sender);
                const { id, processingKey, caption, mediaType, labels: labelNumbers } = msg;
                const referer = window.location.href;
                setTimeout(() => {
                    makeLaterRequest(id, caption, referer, csrfToken, processingKey, mediaType, labelNumbers);
                }, 2000);
            }
            setTimeout(() => {
                chrome.runtime.sendMessage({ type: 'close' });
            }, 5000);
        });
    };
}

chain.then(tryGetCheckMark);

function makeLaterRequest(id, caption, referer, csrfToken, processingKey, mediaType, labelNumbers) {
    const labels = labelNumbers.map(labelNumber => {
        return `"${labelNumber}"`;
    });
    const labelString = labels.join(', ');
    processingKey = 'null';
    fetch(`https://app.later.com/api/v2/media_items/${id}`, { credentials: 'include', headers: { accept: 'application/json, text/javascript, */*; q=0.01', 'accept-language': 'en-US,en;q=0.9', authorization: 'Token token="dgHrtqBGxh1fhJQueCPk", email="powergravity3@gmail.com"', 'cache-control': 'no-cache', 'content-type': 'application/json; charset=UTF-8', pragma: 'no-cache', 'sec-fetch-mode': 'cors', 'sec-fetch-site': 'same-origin', 'x-csrf-token': csrfToken, 'x-requested-with': 'XMLHttpRequest' }, referrer: referer, referrerPolicy: 'strict-origin-when-cross-origin', body: `{"media_item":{"active":true,"approved":true,"default_caption": "${caption}","height":null,"latitude":null,"longitude":null,"media_type":"${mediaType}","original_filename":null,"processing_bucket":"later-incoming","processing_key":"${processingKey}","processing_url":null,"show_modal":false,"source_type":null,"source_media_id":"0","source_url":null,"source_username":"","width":null,"group_id":"2874726","label_ids":[${labelString}],"submitted_by_id":null},"group_id":"2874726"}`, method: 'PUT', mode: 'cors' });
}