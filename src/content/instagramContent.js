/* global chrome */

import React from 'react';
import ReactDOM from 'react-dom';
import styles from './instagramContent.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';

debugger;
const saveButton = document.querySelector('span.wmtNn').querySelector('.wpO6b');

class SaveModal extends React.Component {
    dialog = React.createRef();
    state = {
        laterSlug: '',
        hashtagGroups: {},
        customizedCaption: '',
        selectedHashtagGroup: ''
    }

    setLaterSlug = (laterSlug) => {
        this.setState({ laterSlug });
    }

    setHashtagGroups = (hashtagGroups) => {
        this.setState({ hashtagGroups });
    }

    setCustomizedCaption = (customizedCaption) => {
        this.setState({ customizedCaption });
    }

    setSelectedHashtagGroup = (selectedHashtagGroup) => {
        this.setState({ selectedHashtagGroup });
    }

    componentDidMount() {
        // get default caption
        let defaultCaption = '';
        try {
            let capEl = document.querySelector('div.C4VMK').querySelector('span');
            if (!capEl) {
                capEl = document.querySelector('div.C4VMK').querySelector('h1');
            }
            defaultCaption = capEl.innerText;
        } catch (e) {
            console.log('extension/content/instagramPost.js error getting default caption');
        }
        this.setCustomizedCaption(defaultCaption);

        chrome.storage.local.get(['hashtagGroups', 'laterSlug'], result => {
            this.setHashtagGroups(result.hashtagGroups || {});
            this.setLaterSlug(result.laterSlug || '');
        });

        saveButton.addEventListener('click', (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.dialog.current.showModal();
        })
    }

    onSaveToLater = () => {
        chrome.storage.local.get(['captionTemplateMap'], (result) => {
            const { captionTemplateMap } = result;
            const { customizedCaption: customized, selectedHashtagGroup, hashtagGroups } = this.state;
            const url = window.location.href;
            let hashtags;

            if (selectedHashtagGroup === 'random') {
                const groupNames = Object.keys(hashtagGroups);
                if (groupNames.length === 0) {
                    hashtags = '';
                }
                const randomGroupName = groupNames[Math.floor(Math.random() * groupNames.length)];
                hashtags = hashtagGroups[randomGroupName];
            } else {
                hashtags = hashtagGroups[selectedHashtagGroup];
            }

            const captionObjects = Object.keys(captionTemplateMap).map(templateName => {
                const captionTemplate = captionTemplateMap[templateName];
                return {
                    labels: [],
                    caption: captionTemplate.replace('{{customized}}', customized).replace('{{hashtags}}', hashtags)
                };
            });
            chrome.runtime.sendMessage({ type: 'savePost', url, captionObjects });
            chrome.runtime.sendMessage({ type: 'close' });
        })

    }

    render() {
        const { laterSlug, customizedCaption, selectedHashtagGroup, hashtagGroups } = this.state;
        return (<dialog ref={this.dialog}>
            {
                laterSlug === '' ? 
                <h1>Please visit the extension <a href={chrome.extension.getURL("options.html")}>option</a> page to initialize Later</h1> :
                <div>
                    <div class='form-group'>
                        <h1 class={styles.dialogHeader}> Caption To Insert Into Your Template </h1>
                        <textarea class={styles.dialogTextarea}
                            value={customizedCaption}
                            onChange={e => this.setCustomizedCaption(e.target.value)}
                        />
                    </div>

                    <div class='form-group'>
                        <select
                            class="custom-select"
                            value={selectedHashtagGroup}
                            onChange={(e) => {
                                this.setSelectedHashtagGroup(e.target.value);
                            }}
                        >
                            <option value="random">Random</option>
                            {Object.keys(hashtagGroups).map(name => {
                                return <option value={name}>{name}</option>;
                            })}
                        </select>
                    </div>

                    <button class='btn btn-primary' onClick={this.onSaveToLater}>Save To Later</button>
                </div>
            }
        </dialog>)
    }
}

const dialogContainer = document.createElement('div');
document.body.append(dialogContainer);
ReactDOM.render(<SaveModal />, dialogContainer);

// let captionTemplateMap;
// let hashtagGroups;

// const LABEL_TO_NUMBER = {
//     CALI: '874715',
//     monday: '1192542',
//     tuesday: '1192544',
//     wednesday: '1192545',
//     thursday: '1192546',
//     friday: '1192547',
//     saturday: '1192548',
//     sunday: '1192549',
//     'no date': '1195586',
//     calisthenicxelite: '1192555',
//     streetworkoutsociety: '1192567'
// };

// chrome.storage.local.get(['captionTemplateMap', 'hashtagGroups'], function(result) {
//     captionTemplateMap = result.captionTemplateMap;
//     hashtagGroups = result.hashtagGroups;
// });

// function createHashtagGroupCheckbox(hashtagGroupsSelector, title) {
//     const checkboxDiv = document.createElement('div');
//     checkboxDiv.style = `display: flex; flex-direction: row; align-items: center; width: 150px`;
//     hashtagGroupsSelector.appendChild(checkboxDiv);
//     const checkbox = document.createElement('input');
//     checkboxDiv.appendChild(checkbox);
//     checkbox.setAttribute('id', title);
//     checkbox.setAttribute('type', 'checkbox');
//     checkbox.setAttribute('value', title);
//     const label = document.createElement('label');
//     label.style = `margin-left: 1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`
//     checkboxDiv.appendChild(label);
//     label.setAttribute('for', title);
//     label.textContent = title;
// }

// saveButton.addEventListener('click', (event) => {
//     event.stopPropagation();
//     event.preventDefault();
//     saveButton.style.border = '1px solid black';
//     const url = window.location.href;
//     const dialog = document.createElement('dialog');


//     const button = document.createElement('button');
//     button.textContent = 'save';
//     button.style = `padding: 0.375rem; border-radius:0.25rem; background-color: white; border: 1px solid black; margin: 1em 0; width: 100%`;
//     button.addEventListener('click', function() {
//         const customized = textArea.value;
//         const selectedGroupBodies = Array.from(hashtagGroupsSelector.querySelectorAll('input'))
//         .filter(checkbox => checkbox.checked).map(checkbox => checkbox.value).map(title => hashtagGroups[title]);

//         function generateHashtags() {
//             let hashtags;
//             if (selectedGroupBodies.length === 0) {
//                 const groupNames = Object.keys(hashtagGroups);
//                 if (groupNames) {
//                     const randomGroupName = groupNames[Math.floor(Math.random() * groupNames.length)];
//                     hashtags = hashtagGroups[randomGroupName]
//                 } else {
//                     hashtags = '';
//                 }
//             } else {
//                 hashtags = selectedGroupBodies.join(' ');
//             }

//             return hashtags;
//         }

//         const dayLabels = generateDayLabel(customized);

//         const captionObjects = Object.keys(captionTemplateMap).map(templateName => {
//             const captionTemplate = captionTemplateMap[templateName];
//             const templateLabel = LABEL_TO_NUMBER[templateName] || LABEL_TO_NUMBER['calisthenicxelite'];
//             return {
//                 labels: [templateLabel, ...dayLabels],
//                 caption: captionTemplate.replace('{{customized}}', customized).replace('{{hashtags}}', generateHashtags())
//             };
//         });
//         chrome.runtime.sendMessage({ type: 'savePost', url, captionObjects });
//         chrome.runtime.sendMessage({ type: 'close' });
//     });
//     dialog.appendChild(button);
//     dialog.showModal();
// });

// function generateDayLabel(customizedCaption) {
//     if (customizedCaption.match(/monday/i)) {
//         return [LABEL_TO_NUMBER['monday']];
//     } else if (customizedCaption.match(/tuesday/i)) {
//         return [LABEL_TO_NUMBER['tuesday']];
//     } else if (customizedCaption.match(/wednesday/i)) {
//         return [LABEL_TO_NUMBER['wednesday']];
//     } else if (customizedCaption.match(/thursday/i)) {
//         return [LABEL_TO_NUMBER['thursday']];
//     } else if (customizedCaption.match(/friday/i)) {
//         return [LABEL_TO_NUMBER['friday']];
//     } else if (customizedCaption.match(/saturday/i)) {
//         return [LABEL_TO_NUMBER['saturday']];
//     } else if (customizedCaption.match(/sunday/i)) {
//         return [LABEL_TO_NUMBER['sunday']];
//     } else {
//         return [LABEL_TO_NUMBER['no date']];
//     };
// }