var crypto = require('crypto');
var path = require('path');
var fs = require('fs');

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
    var configPath = path.join(process.env.HOME, '.jirabull.json');
    return require(configPath);
}

function setConfig(config) {
    var configPath = path.join(process.env.HOME, '.jirabull.json');
    var configJson = JSON.stringify(config, null, 4);
    fs.writeFileSync(configPath, configJson);
}

function setConfigOption(key, value) {
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

module.exports = {
    get: getConfigOption,
    set: setConfigOption,
    getCredentials: getCredentials,
    setCredentials: setCredentials
};
