const data = ledgerData(forge);

var activeKey = null;
var signer = null;

const onLedgerChanged = function(event){      //TODO never called
    const name = event.valueOf().toString();
    data.setLedger(name);
    console.log("[INFO] Ledger set to \""+name+"\"");
};
const onFileOpened = function (event) {
    const input = event.target;
    const reader = new FileReader();
    reader.onload = function () {
        const newData = ledgerData(forge);
        console.log("File parsing...");
        if(!newData.ledgerDataFromJSON(reader.result)){
            console.log("Parse error");
            return;
        }
        data.setLedger(newData.getLedger());
        console.log("[INFO] Ledger set to \""+name+"\"");
        for (var i = 0; i<newData.dataLength(); i++) {
            const element = newData.getData(i);
            const id = data.addData(element);
            insertRow(element, id);
        }
        console.log(newData.dataLength() + " records parsed");
        console.log("File parse success");
    };
    reader.readAsText(input.files[0]);
};
const onKeyOpened = function (event) {
    const input = event.target;
    const pki = forge.pki;
    const reader = new FileReader();
    reader.onload = function () {
        const keyRoot = JSON.parse(reader.result);
        activeKey = keyRoot.key.toString();
        signer = keyRoot.name;
        console.log("[INFO] Key parse success");
        console.log("[INFO] ->Username: \"" + keyRoot.name + "\"");
    };
    reader.readAsText(input.files[0]);
};
const onAddButtonPressed = function(){
    if(!readRow()) alert("Hiányos bemenet");
};
const readRow = function () {    //bugos az input
    var element = {};
    if((element.forras = $("#in_forras").val().toString()) === "") return false;
    if((element.datum = $("#in_datum").val().toString()) === "") return false;
    if((element.bizonyl = $("#in_bizonyl").val().toString()) === "") return false;
    if((element.jogcim = $("#in_jogcim").val().toString()) === "") return false;
    if((element.deviza = $("#in_deviza").val().toString()) === "") return false;
    if((element.osszeg = $("#in_osszeg").val().toString()) === "") return false;
    if((element.fkvnev = $("#in_fkvnev").val().toString()) === "") return false;
    if((element.ktghely = $("#in_ktghely").val().toString()) === "") return false;
    const id = data.addData(element);
    insertRow(element, id);
    return true;
};
const insertRow = function (element, index) {
    const table = document.getElementById("table");
    const row = table.insertRow(-1);
    row.id = "row_" + index;
    row.insertCell(0).innerText = element.forras;
    row.insertCell(1).innerText = element.datum;
    row.insertCell(2).innerText = element.bizonyl;
    row.insertCell(3).innerText = element.jogcim;
    row.insertCell(4).innerText = element.deviza;
    row.insertCell(5).innerText = element.osszeg;
    row.insertCell(6).innerText = element.fkvnev;
    row.insertCell(7).innerText = element.ktghely;
    row.innerHTML += "<td class='editor'><button type='button' onclick='onDeleteButtonPressed("+index+")'>Töröl</button></td>";
};

const onPreviewButtonPressed = function () {
    if(!check()){
        alert("Formátum hiba");
        return;
    }
    $("#d_editor").hide();
    $("#d_signer").show();
    $(".editor").hide();
};
const onEditorModeButtonPressed = function () {
    $("#d_editor").show();
    $("#d_signer").hide();
    $(".editor").show();
};
const onSaveButtonPressed = function () {
    hash();
    var a = document.createElement("a");
    var file = new Blob([data.toString()], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = 'json.txt';
    a.click();
};
const onDeleteButtonPressed = function (index) {
    console.log("[INFO] Delete row "+index);
    data.nullData(index);
    $("#row_" + index).hide();
};
const check = function(){
    if(data.getLedger() === null){
        console.log("[ERROR] Ledger does not set");
        return false;
    }
    if(!data.hasData()){
        console.log("[ERROR] No data");
        return false;
    }
    return true;
};
const hash = function () {
    data.hasData();
};
const onSignButtonPressed = function () {
    hash();
    if (activeKey == null) {
        alert("Aláíró kulcs nincs megadva");
        return;
    }

    if(data.signLedger(signer,activeKey) === null){
        console.log("[ERROR] Document sign failure");
        return;
    }

    const file = new Blob([data.toString()], {type: 'text/json'});

    const formData = new FormData();
    formData.append('file', file, 'transaction.json');
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            console.log("[INFO] Transaction sent");
            onSuccess(request.response)
        }
    };
    request.open('POST', '/api/upload');
    request.send(formData);

    const onSuccess = function (response) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(file);
        a.download = 'transaction.json';
        a.click();
    };
};


$(document).ready(function () {
    console.log("[INFO] Window loaded");
    onEditorModeButtonPressed();

    const xmlhttp = new XMLHttpRequest();
    const url = "/api/schema";

    xmlhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            console.log("[INFO] schema.json loaded");
            const schema = JSON.parse(this.responseText);
            for(var i in schema.ledger){
                const name = schema.ledger[i];
                $('#sel_ledger').append('<option value="'+name+'">'+name+'</option>');
            }
            $('#sel_ledger').append('<option onclick="onNewLedger()">Új..</option>');
            for(var i in schema.tagSchema.forras){
                const name = schema.tagSchema.forras[i];
                $('#in_forras').append('<option value="'+name+'">'+name+'</option>');
            }
            $('#in_forras').append('<option onclick="onNewLedger()">Új..</option>');
            for(var i in schema.tagSchema.deviza){
                const name = schema.tagSchema.deviza[i];
                $('#in_deviza').append('<option value="'+name+'">'+name+'</option>');
            }
            $('#in_deviza').append('<option onclick="onNewLedger()">Új..</option>');
            for(var i in schema.tagSchema.fkvnev){
                const name = schema.tagSchema.fkvnev[i];
                $('#in_fkvnev').append('<option value="'+name+'">'+name+'</option>');
            }
            $('#in_fkvnev').append('<option onselect="onNewLedger()">Új..</option>');
            for(var i in schema.tagSchema.ktghely){
                const name = schema.tagSchema.ktghely[i];
                $('#in_ktghely').append('<option value="'+name+'">'+name+'</option>');
            }
            $('#in_ktghely').append('<option onclick="onNewLedger()">Új..</option>');
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
});

const onNewLedger = function(){
    alert("TODO");
};