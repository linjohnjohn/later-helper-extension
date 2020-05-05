import * as chromeStorage from './chromeStorage';
import CaptionTemplate from './CaptionTemplate';

export default class CaptionTemplateAPI {
    static async createTemplate(name) {
        const result = await chromeStorage.get('captionTemplates');
        const { captionTemplates = [] } = result;
        const newCT = new CaptionTemplate(name);
        captionTemplates.push(newCT);
        await chromeStorage.set({ captionTemplates });
        return newCT;
    }

    static async getAllTemplates() {
        const result = await chromeStorage.get('captionTemplates');
        const { captionTemplates = [] } = result;
        return captionTemplates.map(CaptionTemplateAPI.fromObject);
    }

    static async getTemplate(uid) {
        const result = await chromeStorage.get('captionTemplates');
        const { captionTemplates = [] } = result;
        const t = captionTemplates.filter(t => t.uid === uid)[0]
        return CaptionTemplateAPI.fromObject(t);
    }

    static async updateTemplate(uid, updatedCT) {
        const result = await chromeStorage.get('captionTemplates');
        const { captionTemplates = [] } = result;
        const oldCT = captionTemplates.filter(t => t.uid === uid)[0];
        const u = Object.assign(oldCT, updatedCT);
        await chromeStorage.set({ captionTemplates });
        return u;
    }

    static async deleteTemplate(uid) {
        const result = await chromeStorage.get('captionTemplates');
        const { captionTemplates = {} } = result;
        const newCaptionTemplates = captionTemplates.filter(t => t.uid !== uid);
        await chromeStorage.set({ captionTemplates: newCaptionTemplates });
        return newCaptionTemplates;
    }

    static fromObject(obj) {
        const c = new CaptionTemplate();
        return Object.assign(c, obj);
    }
}