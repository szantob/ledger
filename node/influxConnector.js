const influx = require('influxdb-nodejs');
const fs = require('fs');
const forge = require('node-forge');

const client = new influx("http://nodejs:"+passwd+"@localhost:8086/db_grafana");
const schema = JSON.parse(fs.readFileSync('./lib/schema.json', 'utf8'));

const ledgerData = require("./public/javascripts/ledgerData");
const keyData = require("./public/javascripts/keyData");

var passwd;
fs.readFile("./keys/.pw_influx_nodejs", function(err, data) {
    if(err) return;
    passwd = data;
});
const getKey = function (signer) {
    const signatureDB = JSON.parse(fs.readFileSync('./keys/keys.json', 'utf8'));
    for(var i in signatureDB){
        if(signatureDB[i].name === signer){
            if(signatureDB[i].active){
                console.log("[INFO][AUTH] Signer: " +signer);
                return signatureDB[i];
            }
            console.log("[ERROR][AUTH] Inactive signer");
        }
    }
    console.log("[ERROR][AUTH] Invalid signer");
};
const upload = function(file){
    console.log("[INFO][INFLUX] File processing");
    const uploadedData = ledgerData();
    const key = keyData(forge);
    const uploadedJSON = fs.readFileSync(file.path, 'utf8');
    uploadedData.ledgerDataFromJSON(uploadedJSON);
    const signer = uploadedData.getSigner();
    const signature = uploadedData.getSignature();
    const valuableData = uploadedData.getProtectableData();
    const keyJSON = JSON.stringify(getKey(signer));
    if(!key.readFromJSON(keyJSON)){
        console.log("[ERROR][AUTH] No key found");
        return;
    }

    if(!key.verify(valuableData,signature)){
        console.log("[ERROR][AUTH] Unauthorized");
        return;
    }else{
        const newRecords = influxProcess(uploadedData);
        if(newRecords > 0){
            console.log("[INFO][INFL] Pocessing susseccful");
            console.log("[INFO][INFL] New records: " + newRecords);
            return true;
        }else{
            console.log("[WARN][INFL] No data found");
            return false;
        }
    }
};
const influxProcess = function(data){
    const signer = data.getSigner();
    const ledger = data.getLedger();
    console.log("D[sign] "+signer);
    var recordNumber = 0;
    console.log("[INFO][INFL] Measurement: "+ledger+", Signer: "+signer);
    client.schema(ledger, schema.fieldSchema, schema.tagSchema, {
        stripUnknown: true,
    });
    for(var i=0; i<data.dataLength();i++){
        if(data.getData(i) !== null) {
            const record = data.getData(i);
            console.log("D[recA] "+JSON.stringify(record)); //TODO DEBUG
            influxParse(record,ledger,signer,client);
            recordNumber++;
        }
    }
    if(recordNumber > 0){
        client.syncWrite()
            .then(() => console.info('sync write queue success'))
            .catch(err => console.error(`sync write queue fail, ${err.message}`));
    }
    return recordNumber;
};
function influxParse(data,ledger,signer,client){
    const date = new Date(data.date);
    client.write(ledger)
        .time(date.valueOf()*1000000)
        .tag({
            "signer": signer,
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
module.exports.upload = upload;