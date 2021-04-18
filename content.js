const { readdirSync, existsSync } = require('fs')
const path = require('path')
require('dotenv').config()
const baseDir = process.env.ACPATH

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

const getFiles = source =>
  readdirSync(source, { withFileTypes: true })
    .map(dirent => dirent.name)

function macchineDisponibili () {
  const final = {}
  const listamain = getDirectories(baseDir + 'content/cars/')
  listamain.forEach(elem => {
    const pathDaControllare = baseDir + 'content/cars/' + elem + '/skins/'
    if (existsSync(pathDaControllare)) {
      final[elem] = getDirectories(path)
    }
  })
  return final
}

function mappeDisponibili () {
  const final = {}
  const listamain = getDirectories(baseDir + 'content/tracks/')
  listamain.forEach(elem => {
    const pathDaControllare = baseDir + 'content/tracks/' + elem
    if (readdirSync(pathDaControllare, { withFileTypes: true }).filter(elem => path.extname(pathDaControllare + elem.name) === '.kn5').length > 0) {
      const uiPath = baseDir + 'content/tracks/' + elem + '/ui/'
      const layouts = getDirectories(uiPath)
      if (layouts.length > 0) {
        final[elem] = layouts
      } else {
        final[elem] = null
      }
    }
  })
  return final
}

module.exports = {
  macchineDisponibili: macchineDisponibili,
  mappeDisponibili: mappeDisponibili
}
