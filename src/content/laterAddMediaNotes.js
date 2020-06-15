/* global chrome */

import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { doThenWait } from '../utils/utils';




class SaveModal extends React.Component {
    dialog = React.createRef();
    state = {
        customizedCaption: '',
        customCredit: ''
    }

    setCustomizedCaption = (customizedCaption) => {
        this.setState({ customizedCaption });
    }

    setCustomCredit = (customCredit) => {
        this.setState({ customCredit });
    }


    handleSaveMediaNote = async () => {
        this.dialog.current.close();
        let { customizedCaption, customCredit } = this.state;
        if (customCredit === '') {
            customCredit = 'lmk';
        }
        const captions = customizedCaption.split('||').map(caption => caption.trim());
        const note = JSON.stringify({ captions, credit: customCredit });
        this.setState({ customizedCaption: '' });
        await doThenWait(() => {
            const editButton = document.querySelector('a.u--m__l__sm');
            editButton.click();
        }, 500);

        await doThenWait(() => {
            const noteTextarea = document.querySelector('textarea#textareaMediaNote');
            noteTextarea.value = note;
            noteTextarea.dispatchEvent(new Event('change', { bubbles: true }));
        }, 500);

        await doThenWait(() => {
            const updateButton = document.querySelector('button.o--btn--primary')
            updateButton.click();
        }, 500);
    };


    render() {
        const { customizedCaption, customCredit } = this.state;
        return (
            <div>
                <button className='btn btn-danger' onClick={() => this.dialog.current.showModal()}>Add Media Notes</button>
                <dialog
                    ref={this.dialog}
                >
                    <div>
                        <div class='form-group'>
                            <h1 style={{
                                fontSize: '2em',
                                margin: '1em 0'
                            }}> Caption To Insert Into Your Template </h1>
                            <textarea style={{
                                display: 'block',
                                margin: '0.5rem',
                                width: '500px',
                                height: '500px',
                                borderRadius: '0.25rem'
                            }}
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
                                onChange={e => { 
                                    this.setCustomCredit(e.target.value) 
                                }}
                            />
                        </div>

                        <button class='btn btn-primary' onClick={this.handleSaveMediaNote}>Save To Later</button>
                        <button class='btn btn-danger' onClick={() => this.dialog.current.close()}>Cancel</button>
                    </div>
                </dialog>
            </div>)
    }
}


let dialogContainer = document.createElement('div');
dialogContainer.addEventListener('keydown', e => {
    e.stopPropagation();
})
dialogContainer.style.position = 'fixed';
dialogContainer.style.top = '0';
dialogContainer.style.right = '0';
dialogContainer.style.margin = '2em';
dialogContainer.style.zIndex = '900';

document.body.append(dialogContainer);

ReactDOM.render(<SaveModal />, dialogContainer);
console.log('laterAddMediaNotes attached')