// /* global chrome */

// const tabIdToDetails = {};

// // catch later api requests
// const beforeRequestCallback = function (detail) {
//     const { requestBody, tabId, method } = detail;
// console.log(method);
//     if (method === 'POST') {
//         const arrayBuffer = new Uint8Array(requestBody.raw[0].bytes);
//         const enc = new TextDecoder('utf-8');
//         const stringJSON = enc.decode(arrayBuffer).replace(/\n/g, '\\n');
//         const data = JSON.parse(stringJSON);
//         console.log(data)
//         const { caption, type, id, social_profile_id, scheduled_time, user_id, media_item_id, post_media_items } = data.gram;
        
//         const [customizedCaption, credit] = caption.split('credit>>');
        
//         const details = {
//             customizedCaption,
//             credit,
//             social_profile_id,
//             type,
//             id,
//             post_media_items,
//             scheduled_time,
//             user_id,
//             media_item_id,

//         };
//         tabIdToDetails[tabId] = details;

//         if (data.pass !== true) {
//             chrome.tabs.sendMessage(tabId, details);
//             return { cancel: true }
//         }
//     }
// };

// const filter = { urls: ['https://app.later.com/api/v2/grams/*'] };
// chrome.webRequest.onBeforeRequest.addListener(beforeRequestCallback, filter, ['requestBody', 'blocking']);
