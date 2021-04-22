function getSkins(dataObject, macchina) {
  const skins = dataObject[macchina]
  if (skins != null) {
    return skins
  } else {
    return null
  }
}

function parseINIString(data) {
  const regex = {
    section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
    param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
    comment: /^\s*;.*$/
  }
  const value = {}
  const lines = data.split(/[\r\n]+/)
  let section = null
  lines.forEach(function (line) {
    if (regex.comment.test(line)) {
      return
    } else if (regex.param.test(line)) {
      var match = line.match(regex.param)
      if (section) {
        value[section][match[1]] = match[2]
      } else {
        value[match[1]] = match[2]
      }
    } else if (regex.section.test(line)) {
      var match = line.match(regex.section)
      value[match[1]] = {}
      section = match[1]
    } else if (line.length === 0 && section) {
      section = null
    };
  })
  return value
}

function generaOggDaForm(dataObject, formObject) {
  const final = []
  const n = parseInt(formObject.numeroMacchineForm)
  const dataObjectKeys = Object.keys(dataObject)
  if ((n !== undefined && n !== NaN) && n <= 22) {
    for (let i = 1; i <= n; i++) {
      const nome = formObject['macchina' + i]
      const skinsDisponibili = getSkins(dataObject, nome)
      let skin = null
      if (skinsDisponibili === null) {
        skin = null
      } else {
        skin = formObject['skinMacchina' + i]
      }
      if (dataObjectKeys.includes(nome)) {
        const x = {}
        x.nome = nome
        if (skin != null && skinsDisponibili.includes(skin)) {
          x.skin = skin
        } else {
          x.skin = ''
        }
        final.push(x)
      } else {
        return null
      }
    }
    return final
  } else {
    return null
  }
}

function generaINI(macchine) {
  let data = ''
  let i = 0
  for (const elem of macchine) {
    data += '[CAR_' + i + ']\n'
    data += 'MODEL=' + elem.nome + '\n'
    data += 'SKIN=' + elem.skin + '\n'
    data += 'SPECTATOR_MODE=0\nDRIVERNAME=\nTEAM=\nGUID=\nBALLAST=0\nRESTRICTOR=0\n'
    data += '\n'
    i++
  }
  return data
}

function saveINI(oggetto) {
  let dataINI = ''
  for (const array of Object.entries(oggetto)) {
      dataINI += '[' + array[0] + ']\n'
      for(const opzione of Object.entries(array[1])) {
          dataINI += opzione[0] + '=' + opzione[1] + '\n'
      }
  }
  return dataINI
}

export {
  parseINIString,
  generaOggDaForm,
  generaINI,
  saveINI
}
