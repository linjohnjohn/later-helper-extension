/* global chrome */

import React from 'react';
import '../index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import CaptionTemplateAPI from '../model/CaptionTemplateAPI';
import LaterSettingsAPI from '../model/LaterSettingsAPI';
import { Link } from 'react-router-dom';

class CaptionTemplateOverview extends React.Component {
    state = {
        captionTemplates: [],
        laterSettings: {},
        newCTName: ''
    }

    newTemplateModal = React.createRef();
    allHashtagGroupsModal = React.createRef();

    async componentDidMount() {
        const captionTemplatesMap = await CaptionTemplateAPI.getAllTemplates();
        const captionTemplates = Object.values(captionTemplatesMap).sort((a, b) => a.name > b.name);
        const laterSettings = await LaterSettingsAPI.getLaterSettings();
        this.setState({ captionTemplates, laterSettings });
    }

    handleInitializeLater = async () => {
        const response = await fetch("https://app.later.com/api/v2/users/me");
        if (response.status === 200) {
            const data = await response.json();
            const id = data.user.id
            const userDetailsResponse = await fetch(`https://app.later.com/api/v2/users/${id}/accounts?userId=${id}`)
            const userDetailData = await userDetailsResponse.json();

            const mainGroupDetails = userDetailData.groups[0]
            const mainGroupSlug = mainGroupDetails.slug;

            // const igNameToProfileId = userDetailData.social_profiles.filter(obj => obj.profile_type === 'instagram').reduce((igNameToId ,obj) => {
            //     const name = obj.display_name.replace('@', '')
            //     igNameToId[name] = obj.id;
            //     return igNameToId 
            // }, {});

            let labels = mainGroupDetails.label_ids;
            const labelQuery = labels.map(label => `${encodeURIComponent('ids[]')}=${String(label)}`).join('&');
            const labelNamesResponse = await fetch(`https://app.later.com/api/v2/labels?${labelQuery}`);
            const labelNameData = await labelNamesResponse.json();
            labels = labelNameData.labels;

            const labelMap = labels.reduce((map, labelObj) => {
                map[labelObj.title] = labelObj.id;
                return map;
            }, {});

            const newLaterSettings = {
                slug: mainGroupSlug,
                labels: labelMap,
                // @todo reset selected template and labels?
            };
            const updatedSettings = await LaterSettingsAPI.updateLaterSettings(newLaterSettings);
            this.setState({ laterSettings: updatedSettings });
        } else if (response.status === 401) {
            // @todo try again later
        }
    }

    handleAddNewTemplate = async () => {
        const { newCTName, captionTemplates } = this.state;
        const newCT = await CaptionTemplateAPI.createTemplate(newCTName);
        const newCaptionTemplates = [...captionTemplates, newCT];
        this.setState({ captionTemplates: newCaptionTemplates, newCTName: '' });
    }

    handleDeleteTemplate = async (uid) => {
        const newCaptionTemplates = await CaptionTemplateAPI.deleteTemplate(uid);
        this.setState({ captionTemplates: newCaptionTemplates });
    }

    render() {
        const { laterSettings, captionTemplates, newCTName } = this.state;

        return (
            <div class='row justify-content-center'>
                <div className="col-8">
                    <div id="latersettings">
                        <div className="form-group row">
                            <label class="col-sm-4"><b>Registered Later Slug</b></label>
                            <label class="col-sm-8">{laterSettings.slug || 'Please reinitialize'}</label>
                        </div>
                        {laterSettings.slug ?
                            <button className="btn btn-success btn-block" onClick={this.handleInitializeLater}>Initialize Later</button> :
                            <button className="btn btn-danger btn-block" onClick={this.handleInitializeLater}>Reinitialize Later</button>}
                    </div>

                    <form>
                        <div className="form-group">
                            <label>New Template Name</label>
                            <input type="text" className="form-control" value={newCTName} onChange={(e) => this.setState({ newCTName: e.target.value })} />
                        </div>
                        <button className="btn btn-success btn-block" onClick={this.handleAddNewTemplate}>Add New Template</button>
                    </form>
                    <div class="list-group">
                        {captionTemplates.map(t => {
                            return <li className="list-group-item list-group-item-action d-flex flex-row justify-content-between">
                                <Link to={`/captiontemplates/${t.uid}`} class='text-dark'>
                                    {t.name || 'No Name'}
                                </Link>
                                <a href='# ' class='text-danger' onClick={() => this.handleDeleteTemplate(t.uid)}>Delete</a>
                            </li>
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

export default CaptionTemplateOverview;

