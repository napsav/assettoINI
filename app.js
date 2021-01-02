const express = require('express')
const app = express()
const fs = require("fs");
const port = 3000
const { exec } = require("child_process");
const { PassThrough } = require('stream');


const serverStatusFile = '/usr/share/nginx/html/serverstarted'
const serverCfg = '/assetto/cfg/server_cfg.ini'
const entryList = '/assetto/cfg/entry_list.ini'
const data = fs.readFileSync('cars.json', 'utf8');
const dataObject = JSON.parse(data)
function getSkins(macchina) {
  skins = dataObject[macchina]
  if (skins != null) {
    return skins;
  } else {
    return null;
  }
}

function parseINIString(data) {
  var regex = {
    section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
    param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
    comment: /^\s*;.*$/
  };
  var value = {};
  var lines = data.split(/[\r\n]+/);
  var section = null;
  lines.forEach(function (line) {
    if (regex.comment.test(line)) {
      return;
    } else if (regex.param.test(line)) {
      var match = line.match(regex.param);
      if (section) {
        value[section][match[1]] = match[2];
      } else {
        value[match[1]] = match[2];
      }
    } else if (regex.section.test(line)) {
      var match = line.match(regex.section);
      value[match[1]] = {};
      section = match[1];
    } else if (line.length == 0 && section) {
      section = null;
    };
  });
  return value;
}

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

function generaOggDaForm(formObject) {
  var final = [];
  var n = parseInt(formObject.numeroMacchineForm)
  console.log(n)
  console.log("Chiavi:")
  console.log(Object.keys(dataObject))
  var dataObjectKeys = Object.keys(dataObject)
  if ((n != undefined && n != NaN) && n <= 22) {
    console.log("avvio loop")
    for (var i = 1; i <= n; i++) {
      var nome = formObject["macchina"+i]
      console.log(nome)
      var skinsDisponibili = getSkins(nome)
      console.log(skinsDisponibili)
      if (skinsDisponibili === null) {
        var skin = null;
      } else {
        var skin = formObject["skinMacchina"+i]
        console.log("SKIN MACCHINA: "+skin)
      }
      console.log(dataObjectKeys.includes("ks_ford_gt40"))
      console.log(dataObjectKeys.includes(nome))
      if (dataObjectKeys.includes(nome)) {
        x = {}
        x["nome"]=nome
        if (skin != null && skinsDisponibili.includes(skin)) {
          x["skin"]=skin
        } else {
          x["skin"]=""
        }
        final.push(x)
      } else {
        return null;
      }
    }
    return final;
  } else {
    return null;
  }
}

function generaINI(macchine) {
  let data = "";
  let i = 0
  for (elem of macchine) {
    data += "[CAR_"+i+"]\n"
    data += "MODEL="+elem.nome+"\n"
    data += "SKIN="+elem.skin+"\n"
    data += "SPECTATOR_MODE=0\nDRIVERNAME=\nTEAM=\nGUID=\nBALLAST=0\nRESTRICTOR=0\n"
    data += "\n"
    i++;
  }
  return data;
}

function saveINI(oggetto) {
  var dataINI = "";
  for ([key, value] of Object.entries(oggetto)) {
    dataINI += "["+key+"]\n"
    
    console.log(key)
    console.log(value)
    for ([valore, prop] of Object.entries(oggetto[key])) {
      dataINI += valore +"=" + prop + "\n"
    }
  }
  console.log(dataINI)
  return dataINI;
}

app.get('/manager', (req, res) => {
  try {
    //fs.existsSync(serverStatusFile)
    //res.send("Il server è ancora in esecuzione! Torna indietro e fermalo.")
      try {
        //var data = fs.readFileSync(entryList, 'utf8');
        //var entryListObject = parseINIString(data);
        //res.render("macchine.pug", { object: entryListObject })
        res.render("manager.pug")
      }
      catch (e) {
        console.log(e);
      }

    
  } catch (err) {
    console.error(err)
  }
})

app.get('/manager/macchine', (req, res) => {
  try {
    if (fs.existsSync(serverStatusFile)) {
      res.send("Il server è ancora in esecuzione! Torna indietro e fermalo.")
    } else {
      try {
        var data = fs.readFileSync(entryList, 'utf8');
        var entryListObject = parseINIString(data);

        res.render("macchine.pug", { object: entryListObject })
      }
      catch (e) {
        console.log(e);
      }
    }
  } catch (err) {
    console.error(err)
  }
})

app.get('/manager/mappe', (req, res) => {
  try {
    if (fs.existsSync(serverStatusFile)) {
      res.send("Il server è ancora in esecuzione! Torna indietro e fermalo.")
    } else {
      try {
        var data = fs.readFileSync(serverCfg, 'utf8');
        var serverCfgObject = parseINIString(data);
        console.log(serverCfgObject)
        res.render("mappe.pug", {mappa: serverCfgObject.SERVER.TRACK, configMappa: serverCfgObject.SERVER.CONFIG_TRACK})
      }
      catch (e) {
        console.log(e);
      }
    }
  } catch (err) {
    console.error(err)
  }
})

app.get('/manager/export', (req, res) => {res.download(serverCfg)})
app.get('/manager/exportentrylist', (req, res) => {res.download(entryList)})

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

app.post('/manager/macchine/aggiungi', (req, res) => {
  console.log(req.body)
  var macchine = generaOggDaForm(req.body)
  var serverdata = fs.readFileSync(serverCfg, 'utf8');
  var serverCfgObject = parseINIString(serverdata);
  if (macchine != null) {
    fs.writeFileSync(entryList, generaINI(macchine))
    var macchinecfg = [];
    macchine.forEach((elem)=>{macchinecfg.push(elem.nome)})
    console.log(macchinecfg)
    serverCfgObject.SERVER.CARS = macchinecfg.filter(onlyUnique).join(";")
    console.log(serverCfgObject)
    fs.writeFileSync(serverCfg, saveINI(serverCfgObject))
  }
  res.redirect('/manager/macchine')
})

app.post('/manager/mappe/cambia', (req, res) => {
  var serverdata = fs.readFileSync(serverCfg, 'utf8');
  var serverCfgObject = parseINIString(serverdata);
    serverCfgObject.SERVER.TRACK = req.body.mappaScelta
    console.log(serverCfgObject)
    fs.writeFileSync(serverCfg, saveINI(serverCfgObject))
  res.redirect('/manager/mappe')
})

app.get('/manager/macchine/reset', (req, res) => {
  fs.writeFileSync(entryList, "")
  res.redirect('/manager/macchine')
})

app.use(function (req, res, next) {
  res.status(404);
  res.format({
    html: function () {
      res.redirect("/404.html")
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
  console.log(`App avviata - http://localhost:${port}`)
})
