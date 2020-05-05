import * as chromeStorage from './chromeStorage';

export default class CaptionTemplate {
    constructor(name) {
        this.uid = chromeStorage.uuidv4();
        this.name = name;
        this.template = '';
        this.hashtagList = [];
    }
}