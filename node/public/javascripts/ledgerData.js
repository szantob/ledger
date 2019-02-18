const ledgerData = function(){
    const publ = {};
    const priv = {};

    priv.ledgerName = null;
    priv.dataArray = [];
    priv.hash = null;
    priv.signer = null;
    priv.signature = null;
    priv.timestamp = null;

    publ.setLedger = function(ledger){
        priv.ledgerName = ledger;
    };
    publ.getLedger = function(){
        return priv.ledgerName;
    };
    publ.ledgerDataFromJSON = (jsonString) => {
        const dataRoot = JSON.parse(jsonString);
        if(dataRoot.ledgerName === null) return false;
        if(dataRoot.data === null) return false;

        if(dataRoot.ledgerName !== null) priv.ledgerName = dataRoot.ledgerName;
        priv.dataArray = dataRoot.data;
        priv.hash = dataRoot.hash;
        priv.signature = dataRoot.signature;
        priv.signer = dataRoot.signer;
        priv.timestamp = dataRoot.timestamp;
        return true;
    };

    publ.addData = (element) => {
        priv.dataArray.push(element);
        return priv.dataArray.indexOf(element);
    };
    publ.getData = (id) => {return priv.dataArray[id]};
    publ.nullData = (id) => {priv.dataArray[id] = null};
    publ.hasData = () => {return publ.dataLength() > 0};
    publ.dataLength = () => {return priv.dataArray.length};

    publ.setTimestamp = () => {priv.timestamp = new Date().getTime()};
    publ.getProtectableData = () => {return JSON.stringify(priv.ledgerName) + JSON.stringify(priv.dataArray) + JSON.stringify(priv.timestamp)};
    publ.setSignature = (name,sign) => {priv.signer = name; priv.signature = sign};
    publ.getSignature = () => {return priv.signature};
    publ.getSigner = () => {return priv.signer};

    publ.toString = () => {return JSON.stringify(priv)};

    return publ;
};

if(typeof module !== "undefined"){
    if(typeof module.exports !== "undefined"){
        module.exports = ledgerData;
    }
}