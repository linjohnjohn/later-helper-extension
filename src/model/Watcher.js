class Watcher {
    constructor(username = '', profileIgName = '', profileId = '', avoidWords = []) {
        this.username = username;
        this.profileIgName = profileIgName;
        this.profileId = profileId;
        this.avoidWords =  avoidWords;
    }

    static isNonEmptyString(s) {
        return typeof this.username === String && this.username.length !== 0
    }
    
    static fromObject(obj) {
        const { username, profileId, profileIgName, avoidWords } = obj;
        return new Watcher(username, profileIgName, profileId, avoidWords);
    }

    get isValidWatcher() {
        return this.isNonEmptyString(this.username) && this.isNonEmptyString(this.profileIgName) && this.isNonEmptyString(this.profileId);
    }

    copy() {
        return new Watcher(this.username, this.profileIgName, this.profileId, this.avoidWords);
    }
}

export default Watcher;