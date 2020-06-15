import CaptionTemplateAPI from "../model/CaptionTemplateAPI"
import LaterSettingsAPI from "../model/LaterSettingsAPI"

/* global chrome */

console.log('ext content script loaded')

const waitThenDo = (fn, delay) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                resolve(fn())
            } catch (err) {
                console.log(err);
            }
        }, delay)
    })
}

let oldHref = document.location.href;

waitThenDo(() => {

    const emberDiv = document.querySelector('div.ember-view'), observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {

            if (oldHref !== document.location.href) {
                oldHref = document.location.href;
                if (document.location.href.includes('/post/new')) {
                    autoFill();
                }
            }
        })
    });

    const config = {
        childList: true,
        subtree: true
    }

    observer.observe(emberDiv, config);
}, 3000);

const autoFill = async () => {
    const settings = await LaterSettingsAPI.getLaterSettings();
    const { selectedTemplate } = settings;
    const captionTemplate = await CaptionTemplateAPI.getTemplateByName(selectedTemplate);
    const { hashtagList, template } = captionTemplate;
    try {
        await waitThenDo(() => {
            const captionTextarea = document.querySelector('textarea.cPT--post__textarea');
            const encodedCaption = captionTextarea.value;
            console.log(encodedCaption);
            const data = JSON.parse(encodedCaption);
            let { captions, credit } = data;

            credit = `@${credit.replace('@', '')}`;
            const caption = captions[Math.floor(Math.random() * captions.length)];
            const finalCaption = template.replace('{{customized}}', caption).replace('{{hashtags}}', '').replace('@{{credit}}', credit).replace('{{credit}}', credit);

            captionTextarea.value = finalCaption;
            captionTextarea.dispatchEvent(new Event('change', { bubbles: true }));

            const firstCommentButton = document.querySelector('button.qa--firstCommentCreate_btn');
            console.log(firstCommentButton)
            firstCommentButton.click();
        }, 1000);

        await waitThenDo(() => {
            let hashtags;

            if (!hashtagList) {
                hashtags = '';
            } else {
                hashtags = hashtagList.sort(() => Math.random() - 0.5).slice(0, 27).join(' ');
            }

            const firstCommentTextarea = document.querySelector(`textarea[name='firstComment']`);
            firstCommentTextarea.value = hashtags;
            firstCommentTextarea.dispatchEvent(new Event('change', { bubbles: true }));
        }, 1000);
    } catch (err) {
        console.log('ext: autoFill Error')
        console.log(err);
        return;
    }
}


// chrome.runtime.onMessage.addListener(function (msg, sender) {
//     const { customizedCaption, credit, type, id, social_profile_id, post_media_items, scheduled_time, user_id, media_item_id } = msg;
//     chrome.storage.local.get(['captionTemplateMap', 'selectedTemplate', 'hashtagGroups'], ({ captionTemplateMap, selectedTemplate, hashtagGroups }) => {

// let hashtags;
// const groupNames = Object.keys(hashtagGroups);
// if (groupNames.length === 0) {
//     hashtags = '';
// } else {
//     const randomGroupName = groupNames[Math.floor(Math.random() * groupNames.length)];
//     hashtags = hashtagGroups[randomGroupName];
// }

// const template = captionTemplateMap[selectedTemplate];
// const finalCaption = template.replace('{{customized}}', customizedCaption).replace('{{hashtags}}', '').replace('{{credit}}', credit).replace(/\n/g, '\\n');

//         fetch(`https://app.later.com/api/v2/grams/`, {
//             "headers": {
//                 "accept": "application/json, text/javascript, */*; q=0.01",
//                 "accept-language": "en-US,en;q=0.9",
//                 "content-type": "application/json; charset=UTF-8",
//                 "sec-fetch-dest": "empty",
//                 "sec-fetch-mode": "cors",
//                 "sec-fetch-site": "same-origin",
//                 "x-requested-with": "XMLHttpRequest",
//             },
//             "referrer": "https://app.later.com/2QQB6/schedule/calendar/post/103930148?targetDate=1585454400",
//             "referrerPolicy": "strict-origin-when-cross-origin",
//             "body": `{\"pass\": true, \"gram\":{\"active\":true,\"album\":null,\"auto_publish\":true,\"canvas_bounds\":[],\"caption\":\"${finalCaption}\",\"click_tracking\":false,\"crop_array\":[],\"crop_change\":false,\"delivered\":false,\"errors2\":[],\"first_comment\":\"${hashtags}\",\"first_comment_error\":null,\"facebook_mentions\":{},\"is_story\":false,\"link_url\":null,\"location_id\":null,\"location_name\":null,\"original_caption\":\"\",\"parent_id\":null,\"platform_warning\":null,\"post_media_items\":${JSON.stringify(post_media_items)},\"posted_time\":null,\"scheduled_time\":${scheduled_time},\"title\":\"\",\"type\":\"${type}\",\"user_tags\":[],\"video_status\":null,\"media_item_id\":\"${media_item_id}\",\"social_profile_id\":\"${social_profile_id}\",\"user_id\":\"${user_id}\"}}`,
//             "method": "POST",
//             "mode": "cors",
//             "credentials": "include"
//         });
//     })
// });
