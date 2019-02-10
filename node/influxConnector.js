const influx = require('influxdb-nodejs');
const fs = require('fs');

const schema = JSON.parse(fs.readFileSync('./lib/schema.json', 'utf8'));

var passwd;
fs.readFile("./keys/.pw_influx_nodejs", function(err, data) {
    if(err) return;
    passwd = data;
});
const client = new influx("http://nodejs:"+passwd+"@localhost:8086/db_grafana")

function upload(file){
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
