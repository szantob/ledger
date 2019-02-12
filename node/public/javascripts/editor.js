const dataRoot = {};
dataRoot.ledger = null;
dataRoot.data = [];
dataRoot.hash = null;
dataRoot.signer = null;
dataRoot.signature = null;

var activeKey = null;
var signer = null;

const setLedger = function(event){
    dataRoot.ledger = event.valueOf().toString();
};
const openFile = function (event) {
    const input = event.target;
    const reader = new FileReader();
    reader.onload = function () {
        const root = JSON.parse(reader.result);
        console.log("File parseing...");
        console.log(root.data.length + " records parsed");
        if (dataRoot.ledger == null) {
            dataRoot.ledger = root.ledger;
        }//TODO Error handling
        for (var i in root.data) {
            const element = root.data[i];
            dataRoot.data.push(element);
            insertRow(element, dataRoot.data.indexOf(element));
        }
        console.log("File parse success");
    };
    reader.readAsText(input.files[0]);
};
const openKey = function (event) {
    const input = event.target;
    const pki = forge.pki;
    const reader = new FileReader();
    reader.onload = function () {
        var keyRoot = JSON.parse(reader.result);
        activeKey = pki.privateKeyFromPem(keyRoot.key.toString());
        signer = keyRoot.name;
        console.log("Key parse success");
        console.log("Username: " + keyRoot.name);
    };
    reader.readAsText(input.files[0]);
};
const add = function(){
    if(!readRow()) alert("Hiányos bemenet")
}
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
    dataRoot.data.push(element);
    insertRow(element, dataRoot.data.indexOf(element));
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
    row.innerHTML += "<td class='editor'><button type='button' onclick='del(\"+index+\")'>Töröl</button></td>";
};

const preview = function () {
    if(!check()){
        alert("Formátum hiba");
        return;
    }
    $("#d_editor").hide();
    $("#d_signer").show();
    $(".editor").hide();
};
const editorMode = function () {
    $("#d_editor").show();
    $("#d_signer").hide();
    $(".editor").show();
};
const save = function () {
    hash();
    var a = document.createElement("a");
    var file = new Blob([JSON.stringify(dataRoot)], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = 'json.txt';
    a.click();
};
const del = function (index) {
    dataRoot.data[index] = null;
    $("#row_" + index).hide();
};
const check = function(){
    if(dataRoot.ledger === null) return false;
    if(dataRoot.data.length === 0) return false;
    return true;
}
const hash = function () {
    var md = forge.md.sha256.create();
    md.update(dataRoot.ledger + dataRoot.data);
    dataRoot.hash = md.digest().toHex();
};
const sign = function () {
    hash();
    if (activeKey == null) {
        alert("Aláíró kulcs nincs megadva");
        return;
    }
    const md = forge.md.sha1.create();
    md.update(dataRoot.hash, 'utf8');
    dataRoot.signer = signer;
    dataRoot.signature = activeKey.sign(md).toString('ascii');

    var file = new Blob([JSON.stringify(dataRoot)], {type: 'text/json'});

    var formData = new FormData();
    formData.append('file', file, 'transaction.json');
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            console.log("Transaction sent");
            onSuccess(request.response)
        }
    };
    request.open('POST', '/api/upload');
    request.send(formData);

    const onSuccess = function (response) {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(file);
        a.download = 'transaction.json';
        a.click();
    };
};


$(document).ready(function () {
    editorMode();
});