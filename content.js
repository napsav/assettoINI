import { readdirSync, existsSync, readFileSync, writeFileSync, writeFile, mkdir } from 'fs'
import path from 'node:path'
import dotenv from 'dotenv'
dotenv.config()
const baseDir = process.env.ACPATH
const imagesDirectory = process.env.IMMAGINI
import crypto from 'node:crypto'
import imagemin from 'imagemin'
import imageminPngquant from 'imagemin-pngquant'

let optimizedImages = []
const optimizedImagesJsonDir = './instance/'

function ensureExists(path, mask, cb) {
  if (typeof mask == 'function') { // allow the `mask` parameter to be optional
      cb = mask;
      mask = 484;
  }
  mkdir(path, mask, function(err) {
      if (err) {
          if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
          else cb(err); // something else went wrong
      } else cb(null); // successfully created folder
  });
}

function loadOptimizedImages() {
  optimizedImages = JSON.parse(readFileSync(optimizedImagesJsonDir + 'optimizedImages.json'))
}

function saveOptimizedImages() {
  if(Object.entries(optimizedImages).length > 0) {
    console.log('Saving images json')
    writeFile('./instance/optimizedImages.json', JSON.stringify(optimizedImages), {encoding:'utf8'}, () => {
      console.log('Json scritto')
    })
    optimizeImages(optimizedImages, ()=>{console.log('Immagini ottimizate con successo')})
  }
}


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

async function optimizeImages(oggetto, cb) {
  console.log('Ottimizzo le immagini...')
  const toBeOptimized = []
  for (const obj of oggetto) {
    if (!obj.optimized) {
      toBeOptimized.push(obj.path)
      
    }
  }
  console.log(toBeOptimized)
  if (toBeOptimized.length > 0) {
    imagemin(toBeOptimized, {
      destination: imagesDirectory,
      plugins: [
        imageminPngquant()
      ]
    }).then(()=>{
      console.log('Ottimizzazione completata')
      oggetto.filter((el)=>(!el.optimized)).forEach((obj)=>{obj.optimized = true})
    });
  } else {
    console.log('Immagini già ottimizzate')
  }

  cb()
}

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
        //Object.keys(optimizedImages).includes(outlinePath)
        const imageObj = optimizedImages.find((obj)=>{
          obj.originalPath === outlinePath
        })
        if (imageObj !== undefined) {
          obj['outline'] = imageObj.path.replace(imagesDirectory,'/immagini/')
        } else {
          const data = readFileSync(outlinePath)
          const copiedOutlinePath = imagesDirectory + crypto.randomBytes(16).toString("hex") + '.png'

          //TODO: Rendere la copia asincrona, chiamare la funzione per ottimizzare le immagini dell'array

          writeFileSync(copiedOutlinePath, data)
          const imageObj = {
            path: copiedOutlinePath,
            originalPath: outlinePath,
            optimized: false
          }
          optimizedImages.push(imageObj)
          obj['outline'] = copiedOutlinePath.replace(imagesDirectory,'/immagini/')
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
  mappeDisponibili,
  ensureExists,
  loadOptimizedImages,
  saveOptimizedImages,
}
