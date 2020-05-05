/* global chrome */

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, HashRouter, Route, Switch } from 'react-router-dom';
import AutoScheduleOptions from './autoScheduleOptions';
import CaptionTemplateOverview from './CaptionTemplateOverview';
import CaptionTemplateView from './CaptionTemplateView';

class Options extends React.Component {
    state = {
    }

    render() {
        return <HashRouter>
            <Switch>
                <Route exact={true} path='/'>
                    <CaptionTemplateOverview />;
                </Route>
                <Route exact={true} path='/captiontemplates/:templateId' component={CaptionTemplateView} />
            </Switch>
        </HashRouter>
        // if (window.location.href.indexOf('#autoschedule') !== -1) {
        //     return <AutoScheduleOptions />;
        // } else {
        // }
    }
}

ReactDOM.render(<Options />, document.getElementById('root'));


