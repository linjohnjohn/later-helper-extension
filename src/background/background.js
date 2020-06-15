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

// for sending requests from iframes
chrome.webRequest.onHeadersReceived.addListener(
    function(info) {
        var headers = info.responseHeaders;
        for (var i=headers.length-1; i>=0; --i) {
            var header = headers[i].name.toLowerCase();
            if (header == 'x-frame-options' || header == 'frame-options') {
                headers.splice(i, 1); // Remove header
            }
        }
        return {responseHeaders: headers};
    },
    {
        urls: [ 'https://app.later.com/*' ], // Pattern to match all http(s) pages
        types: [ 'sub_frame' ]
    },
    ['blocking', 'responseHeaders']
);