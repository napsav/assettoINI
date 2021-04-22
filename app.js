/* eslint-disable node/handle-callback-err */
import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
const app = express()
import fs from 'node:fs'
const port = 8080
import { exec } from 'child_process'


const serverStatusFile = process.env.STATUSFILE
const serverCfg = process.env.SERVERCFG
const entryList = process.env.ENTRYLIST

import passport from 'passport'


import { ensureAuthenticated } from './config/auth.js'
import { isAdmin } from './config/admin.js'
import session from 'express-session'
import flash from 'connect-flash'
import { macchine } from './macchine.js'
import { mappe } from './mappe.js'
import { auth } from './auth.js'
import { parseINIString, saveINI } from './ini.js'

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(session({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  next()
})

app.use('/manager/macchine', macchine)
app.use('/manager/mappe', mappe)
app.use(auth)

app.disable('x-powered-by')

// AUTENTICAZIONE

app.get('/manager', ensureAuthenticated, isAdmin, (req, res) => {
  try {
    if (fs.existsSync(serverStatusFile)) {
      res.render('manager.pug', { status: true })
    } else {
      res.render('manager.pug', { status: false })
    }
  } catch (err) {
    console.error(err)
  }
})

app.get('/manager/start', ensureAuthenticated, isAdmin, (req, res) => {
  exec('./runserver.sh', (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`)
      return
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`)
      return
    }
    console.log(`stdout: ${stdout}`)
    res.redirect('/manager')
  })
})

app.get('/manager/stop', ensureAuthenticated, isAdmin, (req, res) => {
  exec('./stopserver.sh', (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`)
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`)
    }
    console.log(`stdout: ${stdout}`)
    res.redirect('/manager')
  })
})

app.get('/manager/avanzate', ensureAuthenticated, isAdmin, (req, res) => {
  try {
    if (fs.existsSync(serverStatusFile)) {
      res.render('errore.pug', { errore: 'Il server è ancora in esecuzione! Torna indietro e fermalo.' })
    } else {
      try {
        const data = fs.readFileSync(serverCfg, 'utf8')
        const serverCfgObject = parseINIString(data)
        res.render('avanzate.pug', { object: serverCfgObject })
      } catch (e) {
        console.log(e)
      }
    }
  } catch (err) {
    console.error(err)
  }
})

app.post('/manager/avanzate', ensureAuthenticated, isAdmin, (req, res) => {
  if (fs.existsSync(serverStatusFile)) {
    res.render('errore.pug', { errore: 'Il server è ancora in esecuzione! Torna indietro e fermalo.' })
  } else {
    const nuovoConfig = req.body
    fs.writeFileSync(serverCfg, saveINI(nuovoConfig))
    res.redirect('/manager')
  }
})

app.get('/manager/export', ensureAuthenticated, isAdmin, (req, res) => { res.download(serverCfg) })
app.get('/manager/exportentrylist', ensureAuthenticated, isAdmin, (req, res) => { res.download(entryList) })

app.use(function (req, res, next) {
  res.status(404)
  res.format({
    html: function () {
      res.redirect('/404.html')
    },
    json: function () {
      res.json({ error: 'Non trovato' })
    },
    default: function () {
      res.type('txt').send('Non trovato')
    }
  })
})

app.listen(port, () => {
  console.log(`App avviata - http://localhost:${port}`)
})
