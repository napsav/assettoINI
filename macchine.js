import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import fs from 'node:fs'
const router = express.Router()

import { ensureAuthenticated } from './config/auth.js'
import { isAdmin } from './config/admin.js'
import { macchineDisponibili } from './content.js'
import { parseINIString, generaINI, generaOggDaForm, saveINI } from './ini.js'

const serverStatusFile = process.env.STATUSFILE
const serverCfg = process.env.SERVERCFG
const entryList = process.env.ENTRYLIST

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}

router.get('/', ensureAuthenticated, isAdmin, (req, res) => {
  try {
    if (fs.existsSync(serverStatusFile)) {
      res.render('errore.pug', { errore: 'Il server è ancora in esecuzione! Torna indietro e fermalo.' })
    } else {
      try {
        const data = fs.readFileSync(entryList, 'utf8')
        const entryListObject = parseINIString(data)

        res.render('macchine.pug', { object: entryListObject })
      } catch (e) {
        console.log(e)
      }
    }
  } catch (err) {
    console.error(err)
  }
})

router.post('/aggiungi', ensureAuthenticated, isAdmin, (req, res) => {
  if (fs.existsSync(serverStatusFile)) {
    res.render('errore.pug', { errore: 'Il server è ancora in esecuzione! Torna indietro e fermalo.' })
  } else {
    const macchine = generaOggDaForm(macchineDisponibili(), req.body)
    const serverdata = fs.readFileSync(serverCfg, 'utf8')
    const serverCfgObject = parseINIString(serverdata)
    if (macchine != null) {
      fs.writeFileSync(entryList, generaINI(macchine))
      const macchinecfg = []
      macchine.forEach((elem) => { macchinecfg.push(elem.nome) })
      serverCfgObject.SERVER.CARS = macchinecfg.filter(onlyUnique).join(';')
      fs.writeFileSync(serverCfg, saveINI(serverCfgObject))
    }
    res.redirect('/manager/macchine')
  }
})

router.get('/disponibili', ensureAuthenticated, isAdmin, (req, res) => {
  res.json(macchineDisponibili())
})

router.get('/reset', ensureAuthenticated, isAdmin, (req, res) => {
  if (fs.existsSync(serverStatusFile)) {
    res.render('errore.pug', { errore: 'Il server è ancora in esecuzione! Torna indietro e fermalo.' })
  } else {
    fs.writeFileSync(entryList, '')
    res.redirect('/manager/macchine')
  }
})

export { router as macchine }