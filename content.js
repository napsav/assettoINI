const { readdirSync } = require('fs')
require('dotenv').config()

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)


function macchineDisponibili() {
    return getDirectories(process.env.ACPATH+"cars/")
}

function mappeDisponibili() {
    return getDirectories(process.env.ACPATH+"tracks/")
}

module.exports = {
    macchineDisponibili: macchineDisponibili,
    mappeDisponibili: mappeDisponibili,
}