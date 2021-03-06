/* global chrome */

import React from 'react';
import ReactDOM from 'react-dom';
import styles from './instagram.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const saveButton = document.querySelector('section.ltpMr>.wpO6b');

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
            const { customizedCaption } = this.state;
            const url = window.location.href;

            let [ rawCaptions, credit] = customizedCaption.split('credit>>');
            const captions = rawCaptions.split('||').map(caption => caption.trim());
            credit = credit.replace('@', '');

            // let hashtags;

            // if (selectedHashtagGroup === 'random') {
            //     const groupNames = Object.keys(hashtagGroups);
            //     if (groupNames.length === 0) {
            //         hashtags = '';
            //     }
            //     const randomGroupName = groupNames[Math.floor(Math.random() * groupNames.length)];
            //     hashtags = hashtagGroups[randomGroupName];
            // } else {
            //     hashtags = hashtagGroups[selectedHashtagGroup];
            // }

            // const captionObjects = Object.keys(captionTemplateMap).map(templateName => {
            //     const captionTemplate = captionTemplateMap[templateName];
            //     return {
            //         labels: [],
            //         caption: captionTemplate.replace('{{customized}}', customized).replace('{{hashtags}}', hashtags)
            //     };
            // });
            chrome.runtime.sendMessage({ type: 'savePost', url, captions, credit });
            chrome.runtime.sendMessage({ type: 'close' });
        })

    }

    render() {
        const { laterSlug, customizedCaption } = this.state;
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

                    <button class='btn btn-primary' onClick={this.onSaveToLater}>Save To Later</button>
                </div>
            }
        </dialog>)
    }
}

const dialogContainer = document.createElement('div');
document.body.append(dialogContainer);
ReactDOM.render(<SaveModal />, dialogContainer);
