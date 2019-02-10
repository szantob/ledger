const influx = require('influxdb-nodejs');
const fs = require('fs');
const forge = require('node-forge');

//const schema = JSON.parse(fs.readFileSync('./lib/schema.json', 'utf8'));

var passwd;
fs.readFile("./keys/.pw_influx_nodejs", function(err, data) {
    if(err) return;
    passwd = data;
});
const client = new influx("http://nodejs:"+passwd+"@localhost:8086/db_grafana")

function upload2(file){
    data = JSON.parse(fs.readFileSync(files.file.path, 'utf8'));
    console.log("Insert data to ", data.measurement);
    client.schema(data.measurement, schema.fieldSchema, schema.tagSchema, {
        stripUnknown: true,
    });
    for(var i=0;i<data.data.length;i++){
        var d = new Date(data.data[i].date);
        client.write(data.measurement)
            .time(d.valueOf()*1000000)
            .tag({
                "forras": data.data[i].forras,
                "deviza": data.data[i].deviza,
                "fkvnev": data.data[i].fkvnev,
                "ktghely":data.data[i].ktghely,
            }).field({
            "bizszam":data.data[i].bizszam,
            "jogcim": data.data[i].jogcim,
            "osszeg": data.data[i].osszeg,
        }).then(() =>{
            console.info('write point success');
        }).catch(console.error);
    }
    return true;
}

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
        /*client.schema(data.measurement, schema.fieldSchema, schema.tagSchema, {
            stripUnknown: true,
        });*/
        console.log("Pocessing susseccful");
        return true;
    }
};

module.exports.upload = upload;