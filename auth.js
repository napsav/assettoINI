require('dotenv').config()

const express = require('express')
const router = express.Router()
const User = require('./models/user.js')
const bcrypt = require('bcrypt')
const passport = require('passport')
require('./config/passport')(passport)

const { ensureAuthenticated } = require('./config/auth.js')

router.get('/manager/registrazione', (req, res) => {
  res.render('reg.pug')
})

router.get('/manager/login', (req, res) => {
  res.render('login.pug')
})

router.post('/manager/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/manager',
    failureRedirect: '/manager/login',
    failureFlash: true
  })(req, res, next)
})

router.post('/manager/registrazione', (req, res) => {
  const { name, password, password2 } = req.body
  const errors = []
  if (!name || !password || !password2) {
    errors.push({ msg: 'Perfavore riempi tutti i campi' })
  }
  // check if match
  if (password !== password2) {
    errors.push({ msg: 'Le password non corrispondono' })
  }

  // check if password is more than 6 characters
  if (password.length < 6) {
    errors.push({ msg: 'La password deve essere almeno di 6 caratteri' })
  }
  if (errors.length > 0) {
    res.render('reg.pug', {
      errors: errors,
      name: name
    })
  } else {
    // validation passed
    User.findOne({ name: name }).exec((_err, user) => {
      if (user) {
        errors.push({ msg: 'nome già registrato' })
        res.render('reg.pug', { errors, name })
      } else {
        const newUser = new User({
          name: name,
          password: password
        })

        // hash password
        bcrypt.genSalt(10, (_err, salt) =>
          bcrypt.hash(newUser.password, salt,
            (err, hash) => {
              if (err) throw err
              // save pass to hash
              newUser.password = hash
              // save user
              newUser.save()
                .then((value) => {
                  req.flash('success_msg', 'Registrato con successo!')
                  res.redirect('/manager/login')
                })
                .catch(value => console.log(value))
            }))
      }
    })
  }
})

router.get('/manager/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', 'Il logout è stato effettuato correttamente')
  res.redirect('/manager/login')
})

router.get('/manager/errore', ensureAuthenticated, (req, res) => {
  res.render('asklogout.pug')
})

module.exports = router
