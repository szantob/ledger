const express = require('express');
const formidable = require('formidable');
var fs = require('fs');
const influx = require("../influxConnector");
const router = express.Router();


/* GET home page. */
router.get('/ping', function (req, res, next) {

});
router.get('/schema',function (req,res,next) {
    const JSONString = fs.readFileSync('./lib/schema.json', 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSONString).end();
});
router.post('/upload', function (req, res) {
    console.log("Upload start");
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = "./uploads";
    form.keepExtensions = true;
    form.maxFileSize = 1024 * 1024;
    form.parse(req, function (err, fields, files) {
    });
    form.on('fileBegin', function (name, file) {
        file.name = new Date().getTime().toString() + "record.json";
    });
    form.on('file', function (field, file) {
        console.log("File uploaded: " + file.name);
        influx.upload(file);
    });
    form.on('error', function (err) {
        res.sendStatus(500);
        console.log("an error has occured with form upload");
        console.log(err);
        request.resume();
    });
    form.on('aborted', function (err) {
        res.sendStatus(500);
        console.log("user aborted upload:" +err);
    });
    form.on('end', function () {
        res.sendStatus(200);
        console.log('-> upload done');
    });
});

module.exports = router;