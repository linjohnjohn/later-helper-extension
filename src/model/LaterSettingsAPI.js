import * as chromeStorage from './chromeStorage';

export default class LaterSettingsAPI {
    static async getLaterSettings(uid) {
        const result = await chromeStorage.get('laterSettings');
        const { laterSettings = {} } = result;
        return laterSettings;
    }

    static async updateLaterSettings(u) {
        const result = await chromeStorage.get('laterSettings');
        const { laterSettings = {} } = result;
        const updatedSettings = { ...laterSettings, ...u }
        await chromeStorage.set({ laterSettings: updatedSettings });
        return updatedSettings;
    }

}