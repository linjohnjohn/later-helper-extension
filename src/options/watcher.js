/* global chrome */

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
// import Watcher from '../model/Watcher';

class WatcherDisplay extends React.Component {
    state = {
        isEditing: false,
        newUsername: '',
        newProfileIgName: '',
        newAvoidWords: []
    }

    handleUsernameChange = (e) => {
        this.setState({ newUsername: e.target.value });
    }

    handleProfileIgNameChange = (e) => {
        this.setState({ newProfileIgName: e.target.value });
    }

    handleAvoidWordsChange = (e) => {
        this.setState({ newAvoidWords: e.target.value });
    }

    handleEdit = () => {
        const { username, profileIgName, avoidWords } = this.props.watcher;
        console.log('hello')
        this.setState({
            isEditing: true,
            newUsername: username,
            newProfileIgName: profileIgName,
            newAvoidWords: avoidWords.join('\n')
        });
    }

    handleSave = () => {
        const { newUsername, newProfileIgName, newAvoidWords } = this.state;
        this.props.handleSave({
            username: newUsername,
            profileIgName: newProfileIgName,
            avoidWords: newAvoidWords.split('\n')
        });
        this.setState({ isEditing: false })
    }

    handleCancel = () => {
        this.setState({ isEditing: false })
    }

    render() {
        const { watcher } = this.props;
        const { isEditing, newUsername, newProfileIgName, newAvoidWords } = this.state;
        console.log('isEdit=', isEditing)

        if (isEditing) {
            return (
                <div className="border p-3">

                    <form>
                        <div class='form-group'>
                            <label>Watched Username: </label>
                            <input
                                type='text'
                                class='form-control'
                                name='username'
                                value={newUsername}
                                onChange={this.handleUsernameChange}
                            />
                        </div>
                        <div class='form-group'>
                            <label>Profile:</label>
                            <select className='custom-select' onChange={this.handleProfileIgNameChange} value={newProfileIgName}>
                                { Object.keys(this.props.igNameToProfileId).map(name => <option value={name}>{name}</option>)}
                            </select>
                        </div>
                        <div class='form-group'>
                            <label>Phrases to Avoid: </label>
                            <input
                                type='text'
                                class='form-control'
                                value={newAvoidWords}
                                onChange={this.handleAvoidWordsChange}
                            />
                        </div>

                        <button class='btn btn-primary' onClick={this.handleSave}>Save</button>
                        <button class='btn btn-danger' onClick={this.handleCancel}>Cancel</button>
                    </form>
                </div>

            )
        } else {
            return (
                <div class='border p-3'>
                    <p>Watched Username: {watcher.username} </p>
                    <p>Profile: {watcher.profileIgName} </p>
                    <p>ProfileId: {watcher.profileId} </p>
                    <p>Phrases to Avoid: {watcher.avoidWords.join(', ')} </p>
                    <button class='btn btn-primary' onClick={this.handleEdit}>Edit</button>
                </div>
            );
        }
    }
}

export default WatcherDisplay;