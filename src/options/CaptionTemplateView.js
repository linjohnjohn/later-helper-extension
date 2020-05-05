/* global chrome */

import React from 'react';
import '../index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import CaptionTemplateAPI from '../model/CaptionTemplateAPI';

export default class CaptionTemplateView extends React.Component {
    state = {
        isEditing: false,
        newTemplate: '',
        newHashtagList: '',
        captionTemplate: {}
    }

    async componentDidMount() {
        const { templateId } = this.props.match.params;
        const captionTemplate = await CaptionTemplateAPI.getTemplate(templateId);
        this.setState({ captionTemplate });
    }

    handleToggleEdit = () => {
        const { captionTemplate } = this.state;
        const newTemplate = captionTemplate.template;
        const newHashtagList = (captionTemplate.hashtagList || []).join('\n');
        this.setState({ isEditing: true, newTemplate, newHashtagList });
    }

    handleSaveEdit = async () => {
        const { captionTemplate, newHashtagList, newTemplate } = this.state;
        const u = { ...captionTemplate, hashtagList: newHashtagList.split('\n'), template: newTemplate };
        await CaptionTemplateAPI.updateTemplate(u.uid, u);
        this.setState({ captionTemplate: u, isEditing: false });
    }

    handleCancelEdit = () => {
        this.setState({ isEditing: false });
    }

    render() {
        const { isEditing, newTemplate, newHashtagList, captionTemplate } = this.state;
        const hashtagListText = (captionTemplate.hashtagList || []).join('\n');
        return <div className="container">
            <div class="row justify-content-center">
                <div className="col-8">
                    <div>
                        <div className="form-group">
                            <label>Template</label>
                            {isEditing ?
                                <textarea class='form-control' rows={10} value={newTemplate} onChange={e => this.setState({ newTemplate: e.target.value })}></textarea> :
                                <textarea class='form-control' rows={10} disabled={true} value={captionTemplate.template}></textarea>
                            }
                        </div>

                        <div className="form-group">
                            <label>Hashtag List</label>
                            {isEditing ?
                                <textarea class='form-control' rows={10} value={newHashtagList} onChange={e => this.setState({ newHashtagList: e.target.value })}></textarea> :
                                <textarea class='form-control' rows={10} disabled={true} value={hashtagListText}></textarea>
                            }
                        </div>

                        {isEditing ?
                            <React.Fragment>
                                <button class='btn btn-success btn-block' onClick={this.handleSaveEdit}>Save Changes</button>
                                <button class='btn btn-danger btn-block' onClick={this.handleCancelEdit}>Cancel</button>
                            </React.Fragment> :
                            <button class='btn btn-danger btn-block' onClick={this.handleToggleEdit}>Edit</button>
                        }

                    </div>
                </div>
            </div>
        </div>
    }
}