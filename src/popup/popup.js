/* global chrome */
import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import CaptionTemplateAPI from '../model/CaptionTemplateAPI';
import LaterSettingsAPI from '../model/LaterSettingsAPI';


class Popup extends React.Component {
  state = {
    captionTemplates: [],
    laterSettings: [],
    selectedTemplate: null,
    selectedLabel: null,
  }

  async componentDidMount() {
    // get default caption
    const captionTemplates = await CaptionTemplateAPI.getAllTemplates();
    const laterSettings = await LaterSettingsAPI.getLaterSettings();
    const { selectedTemplate, selectedLabel } = laterSettings;
    this.setState({ captionTemplates, laterSettings, selectedTemplate, selectedLabel });
  }

  handleSelectedTemplateChange = async e => {
    const { laterSettings } = this.state;
    const selectedTemplate = e.target.value;
    laterSettings.selectedTemplate = selectedTemplate;
    const updatedSettings = await LaterSettingsAPI.updateLaterSettings(laterSettings);
    this.setState({ laterSettings: updatedSettings, selectedTemplate })
  }

  handleSelectedLabelChange = async e => {
    const { laterSettings } = this.state;
    const selectedLabel = e.target.value;
    laterSettings.selectedLabel = selectedLabel;
    const updatedSettings = await LaterSettingsAPI.updateLaterSettings(laterSettings);
    this.setState({ laterSettings: updatedSettings, selectedLabel })
  }
  render() {
    const { captionTemplates, laterSettings, selectedTemplate, selectedLabel } = this.state;
    const captionTemplateNames = captionTemplates.map(t => t.name);
    const labelNames = Object.keys(laterSettings.labels || {});
    return (<div style={{ width: '500px' }}>
      <div className="form-group">
        <label>Select Active Template</label>
        <select
          className="custom-select"
          onChange={this.handleSelectedTemplateChange}
          value={selectedTemplate}
        >
          <option value={null} selected disabled hidden>Select a Template</option>
          {captionTemplateNames.map(templateName => {
            return <option value={templateName}>{templateName}</option>
          })}
        </select>
      </div>

      <div className="form-group">
        <label>Select a label to apply to saved media</label>
        <select
          className="custom-select"
          onChange={this.handleSelectedLabelChange}
          value={selectedLabel}
        >
          <option value={null} selected disabled hidden>Select a Label</option>
          {labelNames.map(labelName => {
            return <option value={labelName}>{labelName}</option>
          })}
        </select>
      </div>
    </div>)
  }
}

export default Popup;


ReactDOM.render(<Popup />, document.getElementById('root'));

