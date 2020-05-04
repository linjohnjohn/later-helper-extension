/* global chrome */
function doAutoScheduleWatch() {
    chrome.storage.local.get(['watchers'], async ({ watchers }) => {
        for (const watcher in watchers) {
            const { username, profileId, profileIgName } = watcher;
            const unseenLinks = getNewPostsFromUser(username);
            unseenLinks.forEach(([ url, caption ]) => {
                chrome.runtime.sendMessage({ type: 'savePost', url, caption, credit: username, autoSchedule: true, profileId, profileIgName });
            });
        }
    })
}

const seen = {};

async function getNewPostsFromUser(user) {
    try {
        const url = `https://www.instagram.com/${user}/`;
        const sharedData = await getInstagramSharedDataJSON(url);
        const feedArray = sharedData.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;
        
        const unseenLinks = feedArray.map(post => {
            const { shortcode, edge_media_to_caption } = post.node;
            const caption = edge_media_to_caption.edges[0].node.text
            return [shortcode, caption];
        }).filter(([shortcode, caption]) => {
            const prohibitedString = ['link in bio', 'discount','% off', 'free shipping', 'get yours now', 'https://'];
            const regex = new RegExp( prohibitedString.join( "|" ), "i");
            const isPromo = regex.test(caption); 
            return !seen[shortcode] && !isPromo;
        }).map(([shortcode, caption]) => {
            seen[shortcode] = true;
            caption = caption.trim().split('\n')[0];
            return [`https://www.instagram.com/p/${shortcode}/`, caption];
        })

        return unseenLinks;
    } catch (error) {
        console.log(user);
    }
}

async function getHTML(url) {
    const response = await fetch(url);
    const html = await response.text()
    return html;
}

async function getInstagramSharedDataJSON(url) {
    try {
        const html = await getHTML(url);
        const parser = DOMParser;
        const document = parser.parseFromString(html, 'text/html');
        const dataInString = Array.from(document.querySelectorAll('body script[type="text/javascript"]')).map(script => script.innerText).filter(text => text.indexOf('window._sharedData') === 0)[0]
        const scriptPrefix = 'window._sharedData = ';
        const sharedDataJSON = JSON.parse(dataInString.replace(scriptPrefix, '').slice(0, -1));
        return sharedDataJSON;
    } catch (error) {
        console.log(error);
    }
}