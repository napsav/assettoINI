require('dotenv').config()
const express = require('express')
const app = express()
const fs = require("fs");
const port = 8080
const { exec } = require("child_process");
const { PassThrough } = require('stream');
const User = require("./models/user.js")
const bcrypt = require('bcrypt');
const serverStatusFile = '/usr/share/nginx/html/serverstarted'
const serverCfg = '/assetto/cfg/server_cfg.ini'
const entryList = '/assetto/cfg/entry_list.ini'
const data = fs.readFileSync('cars.json', 'utf8');
const dataObject = JSON.parse(data)
const passport = require('passport');
require("./config/passport")(passport)
const {ensureAuthenticated} = require("./config/auth.js")
const {isAdmin} = require("./config/admin.js")
const session = require('express-session');
const flash = require('connect-flash');

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
      var nome = formObject["macchina" + i]
      console.log(nome)
      var skinsDisponibili = getSkins(nome)
      console.log(skinsDisponibili)
      if (skinsDisponibili === null) {
        var skin = null;
      } else {
        var skin = formObject["skinMacchina" + i]
        console.log("SKIN MACCHINA: " + skin)
      }
      console.log(dataObjectKeys.includes("ks_ford_gt40"))
      console.log(dataObjectKeys.includes(nome))
      if (dataObjectKeys.includes(nome)) {
        x = {}
        x["nome"] = nome
        if (skin != null && skinsDisponibili.includes(skin)) {
          x["skin"] = skin
        } else {
          x["skin"] = ""
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
    data += "[CAR_" + i + "]\n"
    data += "MODEL=" + elem.nome + "\n"
    data += "SKIN=" + elem.skin + "\n"
    data += "SPECTATOR_MODE=0\nDRIVERNAME=\nTEAM=\nGUID=\nBALLAST=0\nRESTRICTOR=0\n"
    data += "\n"
    i++;
  }
  return data;
}

function saveINI(oggetto) {
  var dataINI = "";
  for ([key, value] of Object.entries(oggetto)) {
    dataINI += "[" + key + "]\n"

    console.log(key)
    console.log(value)
    for ([valore, prop] of Object.entries(oggetto[key])) {
      dataINI += valore + "=" + prop + "\n"
    }
  }
  console.log(dataINI)
  return dataINI;
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(session({
  secret:process.env.SECRET,
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req,res,next)=> {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error  = req.flash('error');
next();
})

app.disable('x-powered-by');
// AUTENTICAZIONE

app.get('/manager/registrazione', (req, res) => {
  res.render('reg.pug')
})

app.get('/manager/login', (req, res) => {
  res.render('login.pug')
})

app.post('/manager/login', (req, res, next) => {
  passport.authenticate('local',{
    successRedirect : '/manager',
    failureRedirect : '/manager/login',
    failureFlash : true,
  })(req,res,next);
})

app.post('/manager/registrazione', (req, res) => {
  const { name, password, password2 } = req.body;
  let errors = [];
  console.log(' Name ' + name + ' pass:' + password);
  if (!name || !password || !password2) {
    errors.push({ msg: "Perfavore riempi tutti i campi" })
  }
  //check if match
  if (password !== password2) {
    errors.push({ msg: "Le password non corrispondono" });
  }

  //check if password is more than 6 characters
  if (password.length < 6) {
    errors.push({ msg: 'La password deve essere almeno di 6 caratteri' })
  }
  if (errors.length > 0) {
    res.render('reg.pug', {
      errors: errors,
      name: name,
    })
  } else {
    //validation passed
    User.findOne({ name: name }).exec((err, user) => {
      console.log(user);
      if (user) {
        errors.push({ msg: 'nome già registrato' });
        res.render('reg.pug', { errors, name })
      } else {
        const newUser = new User({
          name: name,
          password: password
        });

        //hash password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt,
            (err, hash) => {
              if (err) throw err;
              //save pass to hash
              newUser.password = hash;
              //save user
              newUser.save()
                .then((value) => {
                  console.log(value)
                  req.flash('success_msg','Registrato con successo!')
                  res.redirect('/manager/login');
                })
                .catch(value => console.log(value));
            }));
      }
    })
  }
})

app.get('/manager/logout', (req, res) => {
  req.logout();
  req.flash('success_msg','Il logout è stato effettuato correttamente');
res.redirect('/manager/login');
})

app.get('/manager/errore', ensureAuthenticated, (req, res) => {
  res.render('asklogout.pug')
})

app.get('/manager',ensureAuthenticated,isAdmin, (req, res) => {
  try {
    if (fs.existsSync(serverStatusFile)) {
      res.render("manager.pug", { status: true })
    } else {
      res.render("manager.pug", { status: false })
    }
  } catch (err) {
    console.error(err)
  }
})

app.get('/manager/start',ensureAuthenticated,isAdmin, (req, res) => {
  exec("./runserver.sh", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    res.redirect("/manager")
  });
})

app.get('/manager/stop',ensureAuthenticated,isAdmin, (req, res) => {
  exec("./stopserver.sh", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);

    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);

    }
    console.log(`stdout: ${stdout}`);
    res.redirect("/manager")
  });

})

app.get('/manager/macchine',ensureAuthenticated,isAdmin, (req, res) => {
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

app.get('/manager/mappe',ensureAuthenticated,isAdmin, (req, res) => {
  try {
    if (fs.existsSync(serverStatusFile)) {
      res.send("Il server è ancora in esecuzione! Torna indietro e fermalo.")
    } else {
      try {
        var data = fs.readFileSync(serverCfg, 'utf8');
        var serverCfgObject = parseINIString(data);
        console.log(serverCfgObject)
        res.render("mappe.pug", { mappa: serverCfgObject.SERVER.TRACK, configMappa: serverCfgObject.SERVER.CONFIG_TRACK })
      }
      catch (e) {
        console.log(e);
      }
    }
  } catch (err) {
    console.error(err)
  }
})

app.get('/manager/export',ensureAuthenticated,isAdmin, (req, res) => { res.download(serverCfg) })
app.get('/manager/exportentrylist',ensureAuthenticated,isAdmin, (req, res) => { res.download(entryList) })

app.post('/manager/macchine/aggiungi',ensureAuthenticated,isAdmin, (req, res) => {
  console.log(req.body)
  var macchine = generaOggDaForm(req.body)
  var serverdata = fs.readFileSync(serverCfg, 'utf8');
  var serverCfgObject = parseINIString(serverdata);
  if (macchine != null) {
    fs.writeFileSync(entryList, generaINI(macchine))
    var macchinecfg = [];
    macchine.forEach((elem) => { macchinecfg.push(elem.nome) })
    console.log(macchinecfg)
    serverCfgObject.SERVER.CARS = macchinecfg.filter(onlyUnique).join(";")
    console.log(serverCfgObject)
    fs.writeFileSync(serverCfg, saveINI(serverCfgObject))
  }
  res.redirect('/manager/macchine')
})

app.post('/manager/mappe/cambia',ensureAuthenticated,isAdmin, (req, res) => {
  var serverdata = fs.readFileSync(serverCfg, 'utf8');
  var serverCfgObject = parseINIString(serverdata);
  serverCfgObject.SERVER.TRACK = req.body.mappaScelta
  console.log(serverCfgObject)
  fs.writeFileSync(serverCfg, saveINI(serverCfgObject))
  res.redirect('/manager/mappe')
})

app.get('/manager/macchine/reset',ensureAuthenticated,isAdmin, (req, res) => {
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
