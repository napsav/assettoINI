import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import fs from 'node:fs'
const router = express.Router()

import { ensureAuthenticated } from './config/auth.js'
import { isAdmin } from './config/admin.js'
import { mappeDisponibili } from './content.js'

import { parseINIString, saveINI } from './ini.js'

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
  res.json(mappeDisponibili())
})

router.post('/cambia', ensureAuthenticated, isAdmin, (req, res) => {
  if (fs.existsSync(serverStatusFile)) {
    res.render('errore.pug', { errore: 'Il server è ancora in esecuzione! Torna indietro e fermalo.' })
  } else {
    const data = mappeDisponibili()
    const serverdata = fs.readFileSync(serverCfg, 'utf8')
    const serverCfgObject = parseINIString(serverdata)
    const mappaProposta = req.body.mappaScelta
    const layoutProposta = req.body.layoutScelto
    const mappe = data.map(obj => obj.name)
    if (mappe.includes(mappaProposta)) {
      const layouts = data.find(obj => obj.name === mappaProposta).layouts
      if (layouts !== undefined && layouts === null) {
        serverCfgObject.SERVER.TRACK = mappaProposta
        serverCfgObject.SERVER.CONFIG_TRACK = ''
      } else if (layouts.length > 0) {
        if (layoutProposta !== undefined) {
          if (layouts.find(obj => obj.id === layoutProposta) !== undefined) {
            serverCfgObject.SERVER.CONFIG_TRACK = layoutProposta
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

export { router as mappe }
