/* global chrome */

import React from 'react';
import ReactDOM from 'react-dom';
import styles from './instagram.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';

console.log('ig content script loaded');

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
let dialogContainer = document.createElement('div');
let saveButton;

function prepareSaveModal() {
    if (document.location.href.includes('instagram.com/p/')) {
        saveButton = document.querySelector('section.ltpMr>.wpO6b');
        dialogContainer.remove();
        document.body.append(dialogContainer);
        ReactDOM.render(<SaveModal key={Math.random()}/>, dialogContainer);
    }
};

waitThenDo(prepareSaveModal, 500);

const body = document.querySelector('body'), observer = new MutationObserver((mutations) => {
    mutations.forEach(async (mutation) => {
        if (oldHref !== document.location.href) {
            oldHref = document.location.href;
            if (document.location.href.includes('instagram.com/p/')) {
                console.log('change')
                await waitThenDo(prepareSaveModal, 500);
            }
        }
    })
});

const config = {
    childList: true,
    subtree: true
}

observer.observe(body, config);


class SaveModal extends React.Component {
    dialog = React.createRef();
    state = {
        laterSlug: '',
        hashtagGroups: {},
        customizedCaption: '',
        selectedHashtagGroup: '',
        customCredit: ''
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

    setCustomCredit = (customCredit) => {
        this.setState({ customCredit });
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
        });
    }

    onSaveToLater = () => {
        chrome.storage.local.get(['captionTemplateMap'], (result) => {
            const { customizedCaption, customCredit } = this.state;
            const url = window.location.href;
            const captions = customizedCaption.split('||').map(caption => caption.trim());

            chrome.runtime.sendMessage({ type: 'savePost', url, captions, credit: customCredit.replace('@', '') });
            this.dialog.current.close();
        })

    }

    render() {
        const { laterSlug, customizedCaption, customCredit } = this.state;
        return (
        <dialog 
            ref={this.dialog}
        >
            {
                laterSlug === '' ? 
                <h1>Please visit the extension <a href={chrome.extension.getURL("options.html")}>option</a> page to initialize Later</h1> :
                <div>
                    <div class='form-group'>
                        <h1 class={styles.dialogHeader}> Caption To Insert Into Your Template </h1>
                        <textarea class={styles.dialogTextarea}
                            value={customizedCaption}
                            onChange={e => this.setCustomizedCaption(e.target.value)}
                            onKeyUp={e => e.nativeEvent.stopPropagation()}
                        />
                    </div>

                    <div className="form-group">
                        <label>Override Default Credit (Default credit goes to poster)</label>
                        <input 
                            className="form-control" 
                            placeholder="Leave empty unless you want to override default credit" 
                            value={customCredit} 
                            onChange={e => this.setCustomCredit(e.target.value)}
                        />
                    </div>

                    <button class='btn btn-primary' onClick={this.onSaveToLater}>Save To Later</button>
                    <button class='btn btn-danger' onClick={() => this.dialog.current.close()}>Cancel</button>
                </div>
            }
        </dialog>)
    }
}

