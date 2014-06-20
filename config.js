var crypto = require('crypto');
var path = require('path');
var fs = require('fs');
var CONFIG_PATH = path.join(process.env.HOME, '.jirabull.json');

function setCredentials(user, pass) {
    var auth = {
        user: user,
        pass: encrypt(pass)
    };
    setConfigOption('auth', auth);
}

function getCredentials() {
    var auth = getConfigOption('auth');
    if (!auth) {
        return null;
    }
    return {
        user: auth.user,
        pass: decrypt(auth.pass)
    };
}

function getConfig() {
    return require(CONFIG_PATH);
}

function setConfig(config) {
    var configJson = JSON.stringify(config, null, 4);
    fs.writeFileSync(CONFIG_PATH, configJson);
}

function setConfigOption(key, value) {
    ensureConfigFile();
    var config = getConfig();
    config[key] = value;
    setConfig(config);
}

function getConfigOption(key) {
    return getConfig()[key];
}

function encrypt(text){
    var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq');
    var crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text){
    var decipher = crypto.createDecipher('aes-256-cbc','d6F3Efeq');
    var dec = decipher.update(text,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
}

function ensureConfigFile() {
    if (!fs.existsSync(CONFIG_PATH)) {
        fs.writeFileSync(CONFIG_PATH, '{}');
    }
}

module.exports = {
    get: getConfigOption,
    set: setConfigOption,
    getCredentials: getCredentials,
    setCredentials: setCredentials
};
