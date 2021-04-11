const { readdirSync, existsSync } = require('fs')
require('dotenv').config()
const baseDir = process.env.ACPATH

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

function macchineDisponibili() {
    let final = {}
    let listamain = getDirectories(baseDir+"cars/")
    listamain.forEach(elem => {
        let path = baseDir+"cars/"+elem+"/skins/";
        if(existsSync(path)) {
            final[elem] = getDirectories(path)
        }
    })
    return final;
}

function mappeDisponibili() {
/*     let final = {}
    let listamain = getDirectories(baseDir+"tracks/")
    listamain.forEach(elem => {
        let path = baseDir+"tracks/"+elem+"/skins/";
        if(existsSync(path)) {
            final[elem] = getDirectories(path)
        }
    })
    return final; */
}

module.exports = {
    macchineDisponibili: macchineDisponibili,
    mappeDisponibili: mappeDisponibili,
}