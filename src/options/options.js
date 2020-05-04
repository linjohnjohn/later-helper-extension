/* global chrome */

import React from 'react';
import ReactDOM from 'react-dom';
import AutoScheduleOptions from './autoScheduleOptions';
import SaveLaterMediaOptions from './saveLaterMediaOptions';

class Options extends React.Component {
    state = {
    }

    render() {
        if (window.location.href.indexOf('#autoschedule') !== -1) {
            return <SaveLaterMediaOptions />;
        } else {
            return <AutoScheduleOptions />;
        }
    }
}

ReactDOM.render(<Options />, document.getElementById('root'));


