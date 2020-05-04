/* global chrome */

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import WatcherDisplay from './watcher';
import Watcher from '../model/Watcher';

class AutoScheduleOptions extends React.Component {
    state = {
        watchers: [],
        igNameToProfileId: {}
    }

    componentDidMount() {
        chrome.storage.local.get(['watchers', 'igNameToProfileId'], ({ watchers, igNameToProfileId }) => {
            this.setState({ watchers: watchers || [], igNameToProfileId: igNameToProfileId || {} });
        })
    }

    handleCreateWatcher = () => {
        const { watchers } = this.state;
        const newWatchers = [ ...watchers, new Watcher() ];
        chrome.storage.local.set({ watchers: newWatchers }, () => {
            this.setState({ watchers: newWatchers })
        });
    }

    handleSave = (i, args) => {
        const { username, profileIgName, avoidWords } = args;
        const newWatchers = [ ...this.state.watchers ];
        const profileId = this.state.igNameToProfileId[profileIgName];
        newWatchers[i] = new Watcher(username, profileIgName, profileId, avoidWords);
        chrome.storage.local.set({ watchers: newWatchers }, () => {
            this.setState({ watchers: newWatchers });
        });
    }

    render() {
        const { watchers, igNameToProfileId } = this.state;

        return (
            <div class='container my-5'>
                <div class='row justify-content-center'>
                    <h1>Auto Schedule</h1>
                    <button class='btn btn-success' onClick={this.handleCreateWatcher}>Create Watcher</button>
                </div>

                <div class='container mt-5'>
                    <div class='row justify-content-center'>
                        <div class='col-6'>
                            { watchers.map((watcher, i) => {
                                return <WatcherDisplay 
                                    watcher={watcher}
                                    igNameToProfileId={igNameToProfileId}
                                    handleSave={(...args) => this.handleSave(i, ...args) }    
                                />
                            })}              
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default AutoScheduleOptions;
