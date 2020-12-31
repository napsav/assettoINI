const express = require('express')
const app = express()
var fs = require("fs");
const port = 3000
const { exec } = require("child_process");


function parseINIString(data){
    var regex = {
        section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
        param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
        comment: /^\s*;.*$/
    };
    var value = {};
    var lines = data.split(/[\r\n]+/);
    var section = null;
    lines.forEach(function(line){
        if(regex.comment.test(line)){
            return;
        }else if(regex.param.test(line)){
            var match = line.match(regex.param);
            if(section){
                value[section][match[1]] = match[2];
            }else{
                value[match[1]] = match[2];
            }
        }else if(regex.section.test(line)){
            var match = line.match(regex.section);
            value[match[1]] = {};
            section = match[1];
        }else if(line.length == 0 && section){
            section = null;
        };
    });
    return value;
}

app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))
/*
try {
	var data = fs.readFileSync('/assetto', 'utf8');
	var javascript_ini = parseINIString(data);
	console.log(javascript_ini['Section1']);
  
} 
catch(e) {
	console.log(e);
}
*/
app.get('/macchine', (req, res) => {
    exec("whoami", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
  res.render("index.pug")
})

app.post('/macchine/aggiungi', (req, res) => {
    console.log(req.body)
    console.log(req.body["macchina"+2])
    res.end()
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})