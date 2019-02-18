const keyData = function (dForge){
    const forge = dForge;

    const priv = {};
    const publ = {};
    priv.name = null;
    priv.firstn = null;
    priv.lastn = null;
    priv.email = null;
    priv.publ = null;
    priv.priv = null;

    let privKeyS = null;
    let privKey = null;
    let pubKey = null;

    publ.readFromJSON = function(JSONString){
        const dataRoot = JSON.parse(JSONString);
        if(dataRoot.publ === null) return false;
        if(dataRoot.name === null) return false;

        priv.name = dataRoot.name;
        priv.publ = dataRoot.publ;
        pubKey = forge.pki.publicKeyFromPem(priv.publ);

        if(dataRoot.email !== null){
            priv.email = dataRoot.email;
            priv.firstn = dataRoot.firstn;
            priv.lastn = dataRoot.lastn;
        }

        if(dataRoot.priv !== undefined){
            privKeyS = dataRoot.priv;
            privKey = forge.pki.privateKeyFromPem(privKeyS);
        }
        console.log("[INFO][DATA] Data: "+publ.toString() ); //TODO DEBUG
        return true;
    };
    publ.unsafeWriteToJSON = function(){
        priv.priv = privKeyS;
        const json = JSON.stringify(priv);
        priv.priv = null;
        return json;
    };
    publ.safeWriteToJSON =function(){
        const json = JSON.stringify(priv);
        return json;
    };
    publ.sign = function(dataString){
        const md = forge.md.sha256.create();
        md.update(dataString, 'utf8');
        var pss = forge.pss.create({
            md: forge.md.sha256.create(),
            mgf: forge.mgf.mgf1.create(forge.md.sha256.create()),
            saltLength: 20
        });
        var signature = forge.util.encode64(privKey.sign(md, pss));
        if(publ.verify(dataString,signature))return signature;
        else console.log("[ERROR][AUTH] Signing failure");
    };
    publ.verify = function(dataString, signatureString) {
        const signature = forge.util.decode64(signatureString);
        let pss = forge.pss.create({
            md: forge.md.sha256.create(),
            mgf: forge.mgf.mgf1.create(forge.md.sha256.create()),
            saltLength: 20
        });
        const md = forge.md.sha256.create();
        md.update(dataString, 'utf8');
        const result = pubKey.verify(md.digest().getBytes(),signature, pss); //TODO hibas
        console.log("[INFO][AUTH] Signature verification ended with: " + result);
        return result;
    };
    publ.getUsername = () => {return priv.name;};
    publ.getFullName = () => {return priv.firstn + " " + priv.lastn};
    publ.getEmail = () => {return priv.email};

    return publ;
};

if(typeof module !== "undefined"){
    if(typeof module.exports !== "undefined"){
        module.exports = keyData;
    }
}