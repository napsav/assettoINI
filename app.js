const express = require('express')
const app = express()
const fs = require("fs");
const port = 3000
const { exec } = require("child_process");


const serverStatusFile = '/usr/share/nginx/html/serverstarted'
const serverCfg = '/assetto/cfg/server_cfg.ini'
const entryList = '/assetto/cfg/entry_list.ini'

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


app.get('/macchine', (req, res) => {
    try {
      if (fs.existsSync(serverStatusFile)) {
        res.send("Il server è ancora in esecuzione! Torna indietro e fermalo.")
      } else {
        try {
            var data = fs.readFileSync(entryList, 'utf8');
            var entryListObject = parseINIString(data);
            res.render("index.pug", {object: entryListObject})
        } 
        catch(e) {
            console.log(e);
        }
        
      }
    } catch(err) {
      console.error(err)
    }
})

app.post('/macchine/aggiungi', (req, res) => {
    console.log(req.body)
    console.log(req.body["macchina"+2])
    res.end()
})

app.use(function(req, res, next){
    res.status(404);
    res.format({
      html: function () {
        res.send("Non trovato")
      },
      json: function () {
        res.json({ error: 'Non trovato' })
      },
      default: function () {
        res.type('txt').send('Non trovato')
      }
    })
  });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})