const influx = require('influxdb-nodejs');
const fs = require('fs');
const forge = require('node-forge');

const client = new influx("http://nodejs:"+passwd+"@localhost:8086/db_grafana");
const schema = JSON.parse(fs.readFileSync('./lib/schema.json', 'utf8'));

var passwd;
fs.readFile("./keys/.pw_influx_nodejs", function(err, data) {
    if(err) return;
    passwd = data;
});

function influxParse(data){
    client.schema(data.ledger, schema.fieldSchema, schema.tagSchema, {
        stripUnknown: true,
    });
    for(var i=0;i<data.length;i++){
        var date = new Date(data.date);
        client.write(data.ledger)
            .time(date.valueOf()*1000000)
            .tag({
                "forras": data.forras,
                "deviza": data.deviza,
                "fkvnev": data.fkvnev,
                "ktghely":data.ktghely,
            }).field({
            "bizszam":data.bizszam,
            "jogcim": data.jogcim,
            "osszeg": data.osszeg,
        }).queue();
    }
    return true;
}

const influxProcess = function(dataRoot){
    const data = dataRoot.data;
    var recordNumber = 0;
    for(var i in data){
        if(data[i] !== null) {
            if(influxParse(data[i])) recordNumber++;
        }
    }
    if(recordNumber > 0){
        client.syncWrite()
            .then(() => console.info('sync write queue success'))
            .catch(err => console.error(`sync write queue fail, ${err.message}`));
    }
    return true;
};
const auth = function(data){
    const sha256 = forge.md.sha256.create();
    sha256.update(data.ledger + data.data);
    const signer = data.signer;
    const signature = data.signature;
    const hash = sha256.digest().toHex();

    if(hash !== data.hash){
        console.log("Hash error");
        return false;
    }

    var i = 0;
    const signatureDB = JSON.parse(fs.readFileSync('./keys/keys.json', 'utf8'));
    while(i !== signatureDB.length && signatureDB[i].name !== signer) i++;

    if(signatureDB[i].name !== signer || !signatureDB[i].active){
        console.log("Invalid signer");
        return false;
    }
    console.log("Signer: " +data.signer);

    const pki = forge.pki;
    const key = pki.publicKeyFromPem(signatureDB[i].key.toString());
    const sha1 = forge.md.sha1.create();
    sha1.update(hash, 'utf8');
    if(key.verify(sha1.digest().bytes(), signature)){
        console.log("Authorised");
        return true;
    }else{
        console.log("Unauthorised");
        return false;
    }
};
const upload = function(file){
    console.log("File processing");
    const data = JSON.parse(fs.readFileSync(file.path, 'utf8'));
    if(!auth(data)){
        console.log("Processing failed");
        return false;
    }else{
        const newRecords = influxProcess(data);
        if(newRecords > 0){
            console.log("Pocessing susseccful");
            console.log("New records: " + newRecords);
            return true;
        }else{
            console.log("No data found");
            return false;
        }
    }
};

module.exports.upload = upload;