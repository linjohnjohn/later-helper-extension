/* global chrome */
import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';


class Popup extends React.Component {
  state = {
    linksTextValue: '',
    numberOfTabsToOpen: 10,
    isActive: false,
    isActivelyOpening: false,
  }

  setLinksTextValue = (linksTextValue) => {
    this.setState({ linksTextValue })
  }

  setNumberOfTabsToOpen = (numberOfTabsToOpen) => {
    this.setState({ numberOfTabsToOpen })
  }

  setIsActive = isActive => {
    this.setState({ isActive });
  }

  setIsActivelyOpening = (isActivelyOpening) => {
    this.setState({ isActivelyOpening });
  }

  componentDidMount() {
    chrome.storage.local.get(['urls', 'isActivelyOpening', 'isActive'], (result) => {
      const urls = result.urls;
      if (urls && urls.length !== 0) {
        const linksTextValue = urls.reverse().join('\n');
        this.setLinksTextValue(linksTextValue);
        this.setIsActive(result.isActive);
        this.setIsActivelyOpening(result.isActivelyOpening);
      }
    })
  }

  handleSubmitLinks = () => {
    const { linksTextValue, numberOfTabsToOpen } = this.state;
    const urlArray = linksTextValue.split('\n').reverse();
    const numTabs = numberOfTabsToOpen;
    for (let i = 0; i < Math.min(numTabs, urlArray.length); i++) {
      const nextLink = urlArray.pop();
      chrome.tabs.create({ url: nextLink, active: false });
    }
    chrome.storage.local.set({ urls: urlArray, isActivelyOpening: true, isActive: true }, () => {
      this.setLinksTextValue(urlArray.reverse().join('\n'));
      this.setIsActive(true);
      this.setIsActivelyOpening(true);
    });
  }

  handlePause = () => {
    chrome.storage.local.set({ isActivelyOpening: false }, () => {
      this.setIsActivelyOpening(false);
    });
  }

  handlePlay = () => {
    chrome.storage.local.set({ isActivelyOpening: true }, () => {
      this.setIsActivelyOpening(true);
    });
  }

  handleStop = () => {
    chrome.storage.local.set({ isActive: false, isActivelyOpening: false }, () => {
      this.setIsActive(false);
      this.setIsActivelyOpening(false);
    });
  }

  render() {
    const { linksTextValue, numberOfTabsToOpen, isActivelyOpening, isActive } = this.state;
    let playPause = null;
    if (isActive) {
      playPause = isActivelyOpening ?
        <button
          class="btn btn-primary m-1"
          onClick={this.handlePause}
        >
          Pause
        </button> :
        <button
          class="btn btn-success m-1"
          onClick={this.handlePlay}
        >
          Play
        </button>
    }
    return (
      <div class="m-2">
        <label>All Links</label>
        <textarea
          class="form-group form-control"
          style={{ width: "500px" }}
          disabled={isActive}
          cols="30" rows="10"
          value={linksTextValue}
          onChange={e => this.setLinksTextValue(e.target.value)}
        />
        <label>Initial Number of Tabs</label>
        <input
          class="form-group form-control"
          type="number"
          disabled={isActive}
          placeholder="Number of Tabs To Open"
          value={numberOfTabsToOpen}
          onChange={e => this.setNumberOfTabsToOpen(e.target.value)}
        />
        {isActive ? 
          <button
          class="btn btn-danger m-1"
          onClick={this.handleStop}
          >
          Stop
          </button> :
          <button
            class="btn btn-primary m-1"
            onClick={this.handleSubmitLinks}
          >
            Gradually Open
          </button>
        }
        {playPause}
      </div>
    );
  }
}

export default Popup;


ReactDOM.render(<Popup />, document.getElementById('root'));

