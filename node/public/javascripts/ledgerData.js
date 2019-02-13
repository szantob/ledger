const ledgerData = function(dForge){
    const forge = dForge;
    const publ = {};
    const priv = {};

    priv.ledgerName = null;
    priv.dataArray = [];
    priv.hash = null;
    priv.signer = null;
    priv.signature = null;

    const valuesToString = function(){
        return JSON.stringify(priv.ledgerName) + JSON.stringify(priv.dataArray);
    };
    const normalizeData = function(){
        //TODO implement later
    };

    publ.setLedger = function(ledger){
        priv.ledgerName = ledger;
    };
    publ.getLedger = function(){
        return priv.ledgerName;
    };
    publ.ledgerDataFromJSON = function(jsonString){
        const dataRoot = JSON.parse(jsonString);
        if(dataRoot.ledgerName === null) return false;
        if(dataRoot.data === null) return false;

        if(dataRoot.ledgerName !== null) priv.ledgerName = dataRoot.ledgerName;
        priv.dataArray = dataRoot.data;
        priv.hash = null;
        priv.signature = null;
        priv.signer = null;
        return true;
    };
    publ.addData = function(element){
        priv.dataArray.push(element);
        return priv.dataArray.indexOf(element)
    };
    publ.getData = function(id){
        return priv.dataArray[id];
    };
    publ.nullData = function(id){
        priv.dataArray[id] = null;
    };
    publ.hasData = function(){
        return publ.dataLength() > 0;
    };
    publ.dataLength = function(){
        return priv.dataArray.length;
    };
    publ.calculateHash = function(){
        const md = forge.md.sha256.create();
        md.update(valuesToString());
        priv.hash = md.digest().toHex();
        return priv.hash;
    };
    publ.signLedger = function(signer,keyString){
        const pki = forge.pki;
        const md = forge.md.sha256.create();
        priv.signer = signer;
        key = pki.privateKeyFromPem(keyString);
        md.update(valuesToString(), 'utf8');
        priv.signature = key.sign(md).toString('ascii');
        return priv.signature;
    };
    publ.getSigner = function(){
        return priv.signer;
    };
    publ.verifySignature = function(key){
        const pki = forge.pki;
        const md = forge.md.sha256.create();
        md.update(valuesToString(), 'utf8');
        return (key.verify(md.digest().bytes(), priv.signature));
    };
    publ.toString = function(){
        return JSON.stringify(priv);
    };

    return publ;
};
if(typeof module !== "undefined"){
    if(typeof module.exports !== "undefined"){
        module.exports = ledgerData;
    }
}