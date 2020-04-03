/* global chrome */
import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';


class Popup extends React.Component {
  state = {
    laterSlug: '',
    laterLabelMap: {},
    captionTemplateMap: {},
    hashtagGroups: {},
    selectedTemplate: '',
    selectedLabel: '',
    selectedHashtagGroup: ''
  }

  componentDidMount() {
    // get default caption

    chrome.storage.local.get(['hashtagGroups', 'laterSlug', 'laterLabelMap', 'captionTemplateMap', 'selectedTemplate', 'selectedLabel'], result => {
      this.setState({
        laterSlug: result.laterSlug || '',
        laterLabelMap: result.laterLabelMap || {},
        captionTemplateMap: result.captionTemplateMap || {},
        hashtagGroups: result.hashtagGroups || {},
        selectedTemplate: result.selectedTemplate || '',
        selectedLabel: result.selectedLabel || '',
      });
    });
  }

  handleSelectedTemplateChange = (e) => {
    const selectedTemplate = e.target.value;
    chrome.storage.local.set({ selectedTemplate }, () => {
      this.setState({ selectedTemplate });
    });
  }

  handleSelectedLabelChange = e => {
    const selectedLabel = e.target.value;
    chrome.storage.local.set({ selectedLabel }, () => {
      this.setState({ selectedLabel });
    });
  }
  render() {
    const { captionTemplateMap, laterLabelMap, selectedTemplate, selectedLabel } = this.state;
    return (<div style={{ width: '500px' }}>
      <div className="form-group">
        <label>Select Active Template</label>
        <select
          className="custom-select"
          onChange={this.handleSelectedTemplateChange}
          value={selectedTemplate}
        >
          {Object.keys(captionTemplateMap).map(templateName => {
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
          {Object.keys(laterLabelMap).map(labelName => {
            return <option value={labelName}>{labelName}</option>
          })}
        </select>
      </div>
    </div>)
  }
}

export default Popup;


ReactDOM.render(<Popup />, document.getElementById('root'));

