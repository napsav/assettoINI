import { readdirSync, existsSync, readFileSync, writeFileSync } from 'fs'
import path from 'node:path'
import dotenv from 'dotenv'
dotenv.config()
const baseDir = process.env.ACPATH
const imagesDirectory = process.env.IMMAGINI
import crypto from 'node:crypto'
import imagemin from 'imagemin'
import imageminPngquant from 'imagemin-pngquant'

const optimizedImages = {}


const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

const getFiles = source =>
  readdirSync(source, { withFileTypes: true })
    .map(dirent => dirent.name)

function macchineDisponibili() {
  const final = {}
  const listamain = getDirectories(baseDir + 'content/cars/')
  listamain.forEach(elem => {
    const pathDaControllare = baseDir + 'content/cars/' + elem + '/skins/'
    if (existsSync(pathDaControllare)) {
      final[elem] = getDirectories(pathDaControllare)
    }
  })
  return final
}

/* async function optimizeImages(image) {
  await imagemin(image, {
    destination: imagesDirectory,
    plugins: [
      imageminPngquant()
    ]
  });
  const newPath = process.env.IMMAGINI + crypto.randomBytes(3*4).toString('base64') + '.png'
  renameSync(newPath, image)
  console.log('Images optimized');
  return newPath
} */

function getTrackData(pathToScan, id) {
  //const pathForLayout = baseDir + 'content/tracks/' + elem + '/ui/' + layoutElem
  const filesInDirectory = getFiles(pathToScan)
  if (filesInDirectory.includes('ui_track.json')) {
    try {
      const data = JSON.parse(readFileSync(pathToScan + '/ui_track.json'))
      const obj = {
        id: id,
        data: data
      }

      let outlinePath = null
      if (filesInDirectory.includes('outline.png')) {
        // obj['outline']
        outlinePath = pathToScan + '/outline.png'
        if (Object.keys(optimizedImages).includes(outlinePath)) {
          obj['outline'] = optimizedImages[outlinePath].replace(imagesDirectory,'/immagini/')
        } else {
          const data = readFileSync(outlinePath)
          const copiedOutlinePath = imagesDirectory + crypto.randomBytes(16).toString("hex") + '.png'

          //TODO: Rendere la copia asincrona, chiamare la funzione per ottimizzare le immagini dell'array

          writeFileSync(copiedOutlinePath, data)

          optimizedImages[outlinePath] = copiedOutlinePath
          obj['outline'] = copiedOutlinePath.replace(imagesDirectory,'/immagini/')

          // TODO: Ottimizzazione separata

        }
      }


      //outlineImage = Buffer.from(data).toString('base64')

      /*if(filesInDirectory.includes('preview.png')) {
                const data = readFileSync(pathForLayout+ '/preview.png')
                obj['preview'] = Buffer.from(data).toString('base64')
      } */
      return obj
    } catch (e) {
      console.log(e)
    }
  }
}


function mappeDisponibili() {
  const arrayFinal = []
  const listamain = getDirectories(baseDir + 'content/tracks/')
  listamain.forEach(elem => {
    const pathDaControllare = baseDir + 'content/tracks/' + elem
    if (readdirSync(pathDaControllare, { withFileTypes: true }).filter(file => path.extname(pathDaControllare + file.name) === '.kn5').length > 0) {
      const uiPath = pathDaControllare + '/ui/'
      const layouts = getDirectories(uiPath)
      const final = {}
      final['name'] = elem
      final['layouts'] = []
      if (layouts.length > 0) {
        layouts.forEach(layoutElem => {
          const data = getTrackData(uiPath + layoutElem, layoutElem)
          final['layouts'].push(data)
        })
      } else {
        final['layouts'] = null
        const data = getTrackData(uiPath, elem)
        final['data'] = data.data
        final['outline'] = data.outline
      }
      arrayFinal.push(final)
    }
  })
  return arrayFinal
}

export {
  macchineDisponibili,
  mappeDisponibili
}
