/* global chrome */

import React from 'react';
import ReactDOM from 'react-dom';
import '../index.css'
import 'bootstrap/dist/css/bootstrap.min.css';

class Options extends React.Component {
    state = {
        laterSlug: '',
        captionTemplateMap: {},
        templates: [],
        newTemplate: '',
        selectedTemplate: '',
        newCaptionTemplate: '',
        hashtagGroups: {},
        newHashtagGroupName: '',
        newHashtagGroupBody: '',
    }

    newTemplateModal = React.createRef();
    allHashtagGroupsModal = React.createRef();

    setLaterSlug = (laterSlug) => {
        this.setState({ laterSlug });
    }
    setCaptionTemplateMap = (captionTemplateMap) => {
        this.setState({ captionTemplateMap });
    }

    setNewTemplate = (newTemplate) => {
        this.setState({ newTemplate });
    }

    setSelectedTemplate = (selectedTemplate) => {
        const { captionTemplateMap } = this.state;
        this.setState({ selectedTemplate, newCaptionTemplate: captionTemplateMap[selectedTemplate] });
    }

    setNewCaptionTemplate = (newCaptionTemplate) => {
        this.setState({ newCaptionTemplate });
    }

    setHashtagGroups = (hashtagGroups) => {
        this.setState({ hashtagGroups });
    }

    setNewHashtagGroupName = (newHashtagGroupName) => {
        this.setState({ newHashtagGroupName });
    }

    setNewHashtagGroupBody = (newHashtagGroupBody) => {
        this.setState({ newHashtagGroupBody });
    }

    componentDidMount() {
        chrome.storage.local.get(['captionTemplateMap', 'hashtagGroups', 'laterSlug'], (result) => {
            const captionTemplateMap = !result.captionTemplateMap || Object.keys(result.captionTemplateMap).length === 0 ? { default: '' } : result.captionTemplateMap;
            const hashtagGroups = !result.hashtagGroups ? {} : result.hashtagGroups;
            const templates = Object.keys(captionTemplateMap).sort();
            const selectedTemplate = templates[0];
            this.setCaptionTemplateMap(captionTemplateMap);
            this.setSelectedTemplate(selectedTemplate);
            this.setHashtagGroups(hashtagGroups);

            this.setLaterSlug(result.laterSlug || '');
        })
    }

    handleInitializeLater = async () => {
        const response = await fetch("https://app.later.com/api/v2/users/me");
        if (response.status === 200) {
            const data = await response.json();
            const id = data.user.id
            const userDetailsResponse = await fetch(`https://app.later.com/api/v2/users/${id}/accounts?userId=${id}`)
            const userDetailData = await userDetailsResponse.json();
            const mainGroupDetails = userDetailData.groups.filter(group => group.name === 'Main Group')[0]
            const mainGroupSlug = mainGroupDetails.slug;
            chrome.storage.local.set({ laterSlug: mainGroupSlug }, () => {
                this.setLaterSlug(mainGroupSlug);
            });
        } else if (response.status === 401) {

        }
    }

    handleAddNewTemplate = () => {
        const { newTemplate, captionTemplateMap } = this.state;
        const newMap = { ...captionTemplateMap, [newTemplate]: 'example template\n{{customized}}\n{{credit}}\n{{hashtags}}' };
        chrome.storage.local.set({ captionTemplateMap: newMap }, () => {
            this.setCaptionTemplateMap(newMap);
            this.setSelectedTemplate(newTemplate);
            this.setNewTemplate('');
            this.newTemplateModal.current.close();
        });
    }

    handleDeleteTemplate = () => {
        const { selectedTemplate, captionTemplateMap } = this.state;
        const { [selectedTemplate]: value, ...newMap } = captionTemplateMap;
        const newSelectedTemplate = Object.keys(newMap).sort()[0];
        chrome.storage.local.set({ captionTemplateMap: newMap }, () => {
            this.setCaptionTemplateMap(newMap);
            this.setSelectedTemplate(newSelectedTemplate);
        });
    }

    handleSaveTemplate = () => {
        const { newCaptionTemplate, captionTemplateMap, selectedTemplate } = this.state;
        const newMap = { ...captionTemplateMap, [selectedTemplate]: newCaptionTemplate };
        chrome.storage.local.set({ captionTemplateMap: newMap }, () => {
            this.setCaptionTemplateMap(newMap);
        });
    }

    handleAddNewHashtagGroup = () => {
        const { hashtagGroups, newHashtagGroupName, newHashtagGroupBody } = this.state;
        const newHashtagGroups = { ...hashtagGroups, [newHashtagGroupName]: newHashtagGroupBody };
        this.setNewHashtagGroupName('');
        this.setNewHashtagGroupBody('');
        chrome.storage.local.set({ hashtagGroups: newHashtagGroups }, () => {
            console.log(newHashtagGroups)
            this.setHashtagGroups(newHashtagGroups);
        });
    }

    handleDeleteHashtagGroup = (name) => {
        const { hashtagGroups } = this.state;
        const { [name]: value, ...newHashtagGroups } = hashtagGroups;
        chrome.storage.local.set({ hashtagGroups: newHashtagGroups }, () => {
            this.setHashtagGroups(newHashtagGroups);
        });
    }

    render() {
        const {
            laterSlug,
            newCaptionTemplate,
            captionTemplateMap,
            selectedTemplate,
            newTemplate,
            hashtagGroups,
            newHashtagGroupName,
            newHashtagGroupBody,
        } = this.state;

        const captionTemplate = captionTemplateMap[selectedTemplate];

        const doesNewTemplateExist = captionTemplateMap[newTemplate] === undefined;
        const isNewTemplateEmpty = newTemplate.length !== 0
        const isValidNewTemplate = doesNewTemplateExist && isNewTemplateEmpty;

        const hasValidTemplateNameSelected = captionTemplateMap[selectedTemplate] !== undefined;
        const hasCaptionTemplateChanged = captionTemplate !== newCaptionTemplate;
        const isNewCaptionTemplateSaveable = hasCaptionTemplateChanged && hasValidTemplateNameSelected;

        const doesHashtagGroupNameExists = hashtagGroups[newHashtagGroupName] !== undefined && newHashtagGroupName !== 'random';
        const isHashtagGroupNameEmpty = newHashtagGroupName === '';
        const isHashtagGroupNameValid = !doesHashtagGroupNameExists && !isHashtagGroupNameEmpty;

        const isOnlyTemplate = Object.keys(captionTemplateMap).length === 1;

        return (
            <div class='container my-5'>
                <div class='row justify-content-center'>
                    <h1>Later Media Transfer</h1>
                </div>

                <div class='container mt-5'>
                    <div class='row justify-content-center'>
                        <h3>Later Initialization</h3>
                    </div>

                    <div class='row justify-content-center'>
                        <div class='col-6'>
                            <label>Log into Later in another tab and then click on this button. Use the Reinitialize button when logging into a different Later account</label>
                            <button
                                class={`btn btn-block ${laterSlug === '' ? 'btn-primary' : 'btn-danger'}`}
                                onClick={this.handleInitializeLater}
                            >
                                {laterSlug === '' ? 'Initialize' : 'Reinitialize'}
                            </button>
                        </div>
                    </div>
                </div>
                <div class='container mt-5'>
                    <div class='row justify-content-center'>
                        <h3>Caption Text</h3>
                    </div>


                    <div class='row justify-content-center'>
                        <div class='col-6'>

                            {/* <a href='#' id='toggle-add-template-section'>+ Add Template Label</a>
                            <a href='#' id='delete-template'>+ Delete Template Label</a> */}

                            <div class='form-group'>
                                <label>
                                    Select a Template
                                </label>
                                <select
                                    class='custom-select'
                                    onChange={(e) => this.setSelectedTemplate(e.target.value)}>
                                    {Object.keys(captionTemplateMap).map(templateName => {
                                        return <option value={templateName}>{templateName}</option>
                                    })}
                                </select>
                            </div>

                            <div class='btn-group d-flex mb-3'>
                                <button
                                    class='btn btn-primary w-100'
                                    type='button'
                                    onClick={() => this.newTemplateModal.current.showModal()}
                                >
                                    Add a Template
                                </button>
                                <button
                                    class='btn btn-danger w-100'
                                    onClick={this.handleDeleteTemplate}
                                    disabled={isOnlyTemplate}
                                >
                                    Delete Current Template
                                </button>
                            </div>

                            <dialog
                                ref={this.newTemplateModal}
                                class='border w-50'
                            >
                                <div class='modal-body'>
                                    <div class='form-group'>
                                        <label>
                                            New Template Name
                                        </label>
                                        <input
                                            type='text'
                                            class='form-control'
                                            placeholder='template1'
                                            onChange={e => this.setNewTemplate(e.target.value)}
                                        />
                                        <small
                                            id='new-hashtag-group-name-error'
                                            class='form-text text-primary'
                                            hidden={doesNewTemplateExist}
                                        >
                                            Group Name Already Exists
                                        </small>

                                    </div>
                                    <button
                                        disabled={!isValidNewTemplate}
                                        class='btn btn-primary btn-block'
                                        onClick={this.handleAddNewTemplate}
                                    >
                                        Add New Template
                                    </button>
                                </div>

                                <button
                                    style={{ fontSize: '1.5em', position: 'absolute', top: '-1.5em', right: 0 }}
                                    type='button'
                                    class='close'
                                    onClick={() => this.newTemplateModal.current.close()}
                                >
                                    <span aria-hidden='true'>&times;</span>
                                </button>
                            </dialog>


                            <div class='form-group'>
                                <label for='caption-template-input'>Edit Caption Template</label>
                                <label for='caption-template-input'>Write your caption template and put use
                                <code>  {'{{customized}}'}</code> to
                                                                                        indicate where you want the customized part of your caption to be inserted, use
                                <code> {'{{credit}}'} </code>
                                    to indicate where you want the original content creator you want to be inserted and use
                                <code> {'{{hashtags}}'} </code> to indicate where you want your hashtags to be inserted!</label>

                                <textarea
                                    disabled={!hasValidTemplateNameSelected}
                                    class='form-control'
                                    rows='10'
                                    value={newCaptionTemplate}
                                    onChange={e => this.setNewCaptionTemplate(e.target.value)}
                                />
                            </div>
                            <button
                                disabled={!isNewCaptionTemplateSaveable}
                                class='btn btn-primary btn-block'
                                onClick={this.handleSaveTemplate}
                            >
                                Save Template
                            </button>
                        </div>
                    </div>
                </div>

                <div class='container mt-5'>
                    <div class='row justify-content-center'>
                        <h3>Hashtag Groups</h3>
                    </div>

                    <div class='row justify-content-center'>
                        <div class='col-6'>
                            <div class='form-group'>
                                <label>Group Name</label>
                                <input
                                    class='form-control'
                                    type='text'
                                    placeholder='Name'
                                    value={newHashtagGroupName}
                                    onChange={e => {
                                        this.setNewHashtagGroupName(e.target.value);
                                    }}
                                />
                                <small
                                    id='new-hashtag-group-name-error'
                                    class='form-text text-primary'
                                    hidden={!doesHashtagGroupNameExists}
                                >
                                    Group Name Already Exists
                                </small>

                            </div>
                            <div class='form-group'>
                                <label>Hashtags</label>
                                <textarea
                                    cols='30' rows='2'
                                    placeholder='#happy #love #fitness #sports #turtles #puppies #dogs...'
                                    class='form-control'
                                    value={newHashtagGroupBody}
                                    onChange={e => {
                                        this.setNewHashtagGroupBody(e.target.value);
                                    }}
                                />
                            </div>
                            <button
                                class='btn btn-primary btn-block mb-3'
                                disabled={!isHashtagGroupNameValid}
                                onClick={this.handleAddNewHashtagGroup}
                            >
                                Add Group
                            </button>

                            <button
                                class='btn btn-outline-primary btn-block'
                                onClick={() => this.allHashtagGroupsModal.current.showModal()}
                            >
                                View All Hashtag Groups
                            </button>

                            <dialog
                                ref={this.allHashtagGroupsModal}
                                class='border w-50'
                            >
                                <button
                                    style={{ fontSize: '1.5em', position: 'absolute', top: '-1.5em', right: 0 }}
                                    type='button'
                                    class='close'
                                    onClick={() => this.allHashtagGroupsModal.current.close()}
                                >
                                    <span aria-hidden='true'>&times;</span>
                                </button>
                                <div class='modal-body'>
                                    <h3 class='mb-5'>All Hashtag Groups</h3>
                                    {Object.keys(hashtagGroups).map(name => {
                                        const body = hashtagGroups[name];
                                        return (
                                            <div class="mb-3">
                                                <span class='d-flex flex-row justify-content-between'>
                                                    <span class='font-weight-bold'>{name}</span>
                                                    <button
                                                        class='btn btn-sm btn-danger'
                                                        onClick={() => this.handleDeleteHashtagGroup(name)}
                                                    >
                                                        Delete
                                                    </button>
                                                </span>
                                                <div>{body}</div>
                                            </div>
                                        )
                                    })}
                                </div>

                            </dialog>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<Options />, document.getElementById('root'));


