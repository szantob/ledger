const ledgerData = function(){
    const root = {};
    const priv = {};

    var forge = forge;
    root.setDependencies = function(forgeD){
        forge = forgeD;
    };

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

    root.setLedger = function(ledger){
        priv.ledgerName = ledger;
    };
    root.getLedger = function(){
        return priv.ledgerName;
    };
    root.ledgerDataFromJSON = function(jsonString){
        const dataRoot = JSON.parse(jsonString);
        //TODO implement
    };
    root.appendJSON = function(jsonString){
        if (priv.ledger == null) {
            priv.ledger = appendRoot.ledger;
        }
        for (var i in appendRoot.data) {
            const element = appendRoot.data[i];
            priv.data.push(element);
        }
        return appendRoot.data.length; //TODO implement

    };
    root.addData = function(element){
        priv.data.push(element);
        return priv.dataArray.indexOf(element)
    };
    root.getData = function(id){
        return priv.dataArray[id];
    };
    root.nullData = function(id){
        priv.dataArray[id] = null;
    };
    root.calculateHash = function(){
        const md = forge.md.sha256.create();
        md.update(valuesToString());
        priv.hash = md.digest().toHex();
        return priv.hash;
    };
    root.signLedger = function(signer,keyString){
        const pki = forge.pki;
        const md = forge.md.sha1.create();
        priv.signer = signer;
        key = pki.privateKeyFromPem(keyString);
        md.update(root.calculateHash(), 'utf8');
        priv.signature = key.sign(md).toString('ascii');
        return priv.signature;
    };
    root.getSigner = function(){
        return priv.signer;
    };
    root.verifySignature = function(key){
        const pki = forge.pki;
        const md = forge.md.sha1.create();
        md.update(root.calculateHash(), 'utf8');
        return (key.verify(md.digest().bytes(), priv.signature));
    };
    root.toString = function(){
        return JSON.stringify(priv);
    };

    return root;
};

module.exports = ledgerData();