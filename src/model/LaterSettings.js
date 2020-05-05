import * as chromeStorage from './chromeStorage';

export default class LaterSettings {
    constructor() {
        this.uid = chromeStorage.uuidv4();
        this.slug = '';
        this.labels = {};
        this.selectedTemplate = null;
        this.selectedLabel = null;
    }
}