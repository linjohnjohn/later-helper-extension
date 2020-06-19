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

const copyToClipboard = (text) => {
    const dummy = document.createElement("textarea");
    // to avoid breaking orgain page when copying more words
    // cant copy when adding below this code
    // dummy.style.display = 'none'
    document.body.appendChild(dummy);
    //Be careful if you use texarea. setAttribute('value', value), which works with "input" does not work with "textarea". – Eduard
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

let dialogContainer = document.createElement('div');
dialogContainer.addEventListener('keydown', e => {
    e.stopPropagation();
})
dialogContainer.style.position = 'fixed';
dialogContainer.style.bottom = '0';
dialogContainer.style.left = '0';
dialogContainer.style.margin = '2em';
dialogContainer.style.zIndex = '2147483647';

let oldHref = document.location.href;

function prepareSaveModal() {
    if (document.location.href.includes('instagram.com/p/')) {
        dialogContainer.remove();
        document.body.append(dialogContainer);
        ReactDOM.render(<SaveModal key={Math.random()} />, dialogContainer);
        const photoDivCover = document.querySelector('.eLAPa.kPFhm ._9AhH0')
        if (photoDivCover) {
            photoDivCover.remove()
        }
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
        customizedCaption: '',
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
        let defaultCredit = '';
        try {
            let capEl = document.querySelector('div.C4VMK').querySelector('span');
            if (!capEl) {
                capEl = document.querySelector('div.C4VMK').querySelector('h1');
            }
            defaultCaption = capEl.innerText;

        } catch (e) {
            console.log('extension/content/instagramPost.js error getting default caption');
        }

        try {
            let creditEl = document.querySelector('div.e1e1d a.sqdOP');
            defaultCredit = creditEl.innerText;

        } catch (e) {
            console.log('extension/content/instagramPost.js error getting default caption');
        }

        this.setCustomizedCaption(defaultCaption);
        this.setCustomCredit(defaultCredit);
    }

    handleSaveMediaNotes = () => {
        this.dialog.current.close();
        let { customizedCaption, customCredit } = this.state;
        if (customCredit === '') {
            customCredit = 'lmk';
        }

        const captions = customizedCaption.split('||').map(caption => caption.trim());
        const note = JSON.stringify({ captions, credit: customCredit });
        this.setState({ customizedCaption: '' });

        copyToClipboard(note)
        // await doThenWait(() => {
        //     const noteTextarea = document.querySelector('.o--formWrapper textarea');
        //     noteTextarea.value = note;
        //     noteTextarea.dispatchEvent(new Event('change', { bubbles: true }));
        // }, 500);

        // await doThenWait(() => {
        //     const updateButton = document.querySelector('a.o--btn--primary')
        //     updateButton.click();
        // }, 500);
    }

    render() {
        const { customizedCaption, customCredit } = this.state;
        return (<>
            <button className='btn btn-danger' onClick={() => this.dialog.current.showModal()}>Add Media Notes</button>
            <dialog
                ref={this.dialog}
            >
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

                    <button class='btn btn-primary' onClick={this.handleSaveMediaNotes}>Save To Later</button>
                    <button class='btn btn-danger' onClick={() => this.dialog.current.close()}>Cancel</button>
                </div>
            </dialog>
        </>)
    }
}

