require('dotenv').config()

const express = require('express')
const fs = require('fs')
const router = express.Router()

const { ensureAuthenticated } = require('./config/auth.js')
const { isAdmin } = require('./config/admin.js')
const content = require('./content.js')

const { parseINIString, saveINI } = require('./ini.js')

const serverStatusFile = process.env.STATUSFILE
const serverCfg = process.env.SERVERCFG

router.get('/', ensureAuthenticated, isAdmin, (req, res) => {
  try {
    if (fs.existsSync(serverStatusFile)) {
      res.render('errore.pug', { errore: 'Il server è ancora in esecuzione! Torna indietro e fermalo.' })
    } else {
      try {
        const data = fs.readFileSync(serverCfg, 'utf8')
        const serverCfgObject = parseINIString(data)
        res.render('mappe.pug', { mappa: serverCfgObject.SERVER.TRACK, configMappa: serverCfgObject.SERVER.CONFIG_TRACK })
      } catch (e) {
        console.log(e)
      }
    }
  } catch (err) {
    console.error(err)
  }
})

router.get('/disponibili', ensureAuthenticated, isAdmin, (req, res) => {
  res.json(content.mappeDisponibili())
})

router.post('/cambia', ensureAuthenticated, isAdmin, (req, res) => {
  if (fs.existsSync(serverStatusFile)) {
    res.render('errore.pug', { errore: 'Il server è ancora in esecuzione! Torna indietro e fermalo.' })
  } else {
    const data = content.mappeDisponibili()
    const serverdata = fs.readFileSync(serverCfg, 'utf8')
    const serverCfgObject = parseINIString(serverdata)
    const mappaProposta = req.body.mappaScelta
    const layoutProposta = req.body.layoutScelto
    const mappe = Object.keys(data)
    if (mappe.includes(mappaProposta)) {
      const layouts = data[mappaProposta]
      if (layouts !== undefined && layouts === null) {
        serverCfgObject.SERVER.TRACK = mappaProposta
        serverCfgObject.SERVER.CONFIG_TRACK = ''
      } else if (layouts.length > 0) {
        if (layoutProposta !== undefined) {
          if (data[mappaProposta].includes(layoutProposta)) {
            serverCfgObject.SERVER.CONFIG_TRACK = req.body.layoutScelto
            serverCfgObject.SERVER.TRACK = mappaProposta
          } else {
            res.render('errore.pug', { errore: 'Layout inesistente' })
          }
        } else {
          res.render('errore.pug', { errore: 'Layout mancante' })
        }
      } else {
        res.render('errore.pug', { errore: 'Richiesta illegale' })
      }
    } else {
      res.render('errore.pug', { errore: 'Mappa inesistente' })
    }

    fs.writeFileSync(serverCfg, saveINI(serverCfgObject))
    res.redirect('/manager/mappe')
  }
})

module.exports = router
