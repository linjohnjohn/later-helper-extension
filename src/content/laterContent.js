import LaterSettingsAPI from "../model/LaterSettingsAPI";

/* global chrome */

const chain = Promise.resolve();
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

let attempts = 0;

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
        
        setTimeout(() => {
            chrome.runtime.sendMessage({ type: 'close' });
        }, 5000 + checkmarks.length * 3000);
    };
}

chain.then(tryGetCheckMark);

function schedulePost({ caption, hashtags, scheduledTime, instagramProfileId, mediaItemId }) {
    // remember to escape new lines in caption
    fetch("https://app.later.com/api/v2/grams", {
        "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json; charset=UTF-8",
        },
        "body": `{"gram":{"active":true,"album":null,"auto_publish":true,"canvas_bounds":[],"caption":"${caption}","click_tracking":false,"crop_array":[],"crop_change":false,"delivered":false,"errors2":[],"first_comment":"${hashtags}","first_comment_error":null,"facebook_mentions":{},"is_story":false,"link_url":null,"location_id":null,"location_name":null,"original_caption":"","parent_id":null,"platform_warning":null,"posted_time":null,"scheduled_time":${scheduledTime},"title":"","type":null,"user_tags":[],"video_status":"","linkinbio_post":{"link_url":null,"processing_url":null,"caption":null,"posted_time":null,"media_id":null,"media_type":null,"linkinbio_post_links_attributes":[],"instagram_profile_id":"${instagramProfileId}"},"media_item_id":null,"post_media_items":[{"crop_array":[],"crop_change":false,"end_time":null,"height":null,"ordering":0,"start_time":0,"thumb_offset":0,"user_tags":[],"width":null,"gram_id":null,"media_item_id":"${mediaItemId}"}],"social_profile_id":"${instagramProfileId}","user_id":null}}`,
        "method": "POST",
        "mode": "cors",
    });
}

async function makeLaterRequest({ id, captions, credit, csrfToken, processingKey, mediaType, groupId, authHeader, autoSchedule, profileId, profileIgName }) {
    const laterSettings = await LaterSettingsAPI.getLaterSettings();
    const { labels, selectedLabel } = laterSettings;

    let label = "";
    if (labels && selectedLabel) {
        label = `"${String(labels[selectedLabel])}"`
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
    fetch(`https://app.later.com/api/v2/media_items/${id}`, { credentials: 'include', headers: { accept: 'application/json, text/javascript, */*; q=0.01', 'accept-language': 'en-US,en;q=0.9', authorization: authHeader, 'cache-control': 'no-cache', 'content-type': 'application/json; charset=UTF-8', pragma: 'no-cache', 'sec-fetch-mode': 'cors', 'sec-fetch-site': 'same-origin', 'x-csrf-token': csrfToken, 'x-requested-with': 'XMLHttpRequest' }, referrer: referer, referrerPolicy: 'strict-origin-when-cross-origin', body: `{"media_item":{"active":true,"approved":true,"default_caption": "${caption}","height":null,"latitude":null,"longitude":null,"media_type":"${mediaType}","original_filename":null,"processing_bucket":"later-incoming","processing_key":"${processingKey}","processing_url":null,"show_modal":false,"source_type":null,"source_media_id":"0","source_url":null,"source_username":"","width":null,"group_id":"${groupId}","label_ids":[${label}],"submitted_by_id":null},"group_id":"${groupId}"}`, method: 'PUT', mode: 'cors' })
}