async function getCars () {
  const data = await fetch('/manager/macchine/disponibili')
  return data
}

function getSkins (data, macchina) {
  const skins = data[macchina]
  if (skins != null) {
    return skins
  } else {
    return null
  }
}

window.onload = main

async function main () {
  const data = await (await getCars()).json()
  console.log(data)
  let numeroMacchine = 0
  const macchineDisponibili = Object.keys(data)
  document.getElementById('aggiungiMacchine').onclick = function () {
    if (numeroMacchine <= 21) {
      numeroMacchine++
      const numeroMacchineForm = document.getElementById('numeroMacchineForm')

      const div = document.createElement('div')
      div.style = 'display: block'
      div.id = numeroMacchine
      div.className = 'macchina'

      const select = document.createElement('select')
      select.name = 'macchina' + numeroMacchine
      select.id = select.name

      const selezioneSkin = document.createElement('select')
      selezioneSkin.classList.add('hidden')
      const labelSkin = document.createElement('label')
      labelSkin.classList.add('hidden')

      for (const macchina of macchineDisponibili) {
        const option = document.createElement('option')
        option.value = macchina
        option.text = macchina
        select.appendChild(option)
      }

      const label = document.createElement('label')
      label.innerHTML = 'Macchina ' + numeroMacchine + ':'
      label.htmlFor = select.id
      label.id = 'label' + numeroMacchine

      const rimuovi = document.createElement('button')
      rimuovi.innerHTML = '<i class="fas fa-trash-alt"></i>'
      rimuovi.value = numeroMacchine
      rimuovi.id = 'rimuovi' + numeroMacchine
      rimuovi.onclick = function () {
        document.getElementById(this.value).remove()
        const ids = parseInt(rimuovi.value) + 1
        for (let i = ids; i <= numeroMacchine; i++) {
          const x = i
          const n = i - 1
          document.getElementById(x).id = n

          const selectDaModificare = document.getElementById('macchina' + x)
          selectDaModificare.id = 'macchina' + n
          selectDaModificare.name = 'macchina' + n

          const labelDaModificare = document.getElementById('label' + x)
          labelDaModificare.id = 'label' + n
          labelDaModificare.innerHTML = 'Macchina ' + n + ':'
          labelDaModificare.htmlFor = 'macchina' + n

          const rimuoviDaModificare = document.getElementById('rimuovi' + x)
          rimuoviDaModificare.id = 'rimuovi' + n
          rimuoviDaModificare.value = n

          const cambiaSkinId = document.getElementById('skinMacchina' + x)
          if (cambiaSkinId != null) {
            cambiaSkinId.id = 'skinMacchina' + n
            cambiaSkinId.name = 'skinMacchina' + n
            const cambiaSkinLabel = document.getElementById('labelSkin' + x)
            cambiaSkinLabel.id = 'labelSkin' + n
            cambiaSkinLabel.htmlFor = 'skinMacchina' + n
          }
        }
        numeroMacchine--
        numeroMacchineForm.value = numeroMacchine
      }

      const opzioneList = select.selectedOptions
      const opzione = opzioneList[0].value
      console.log(opzione)
      const skins = getSkins(data, opzione)

      // Rende visibile il select per le skin

      selezioneSkin.classList.remove('hidden')
      selezioneSkin.name = 'skinMacchina' + div.id
      selezioneSkin.id = selezioneSkin.name
      selezioneSkin.className = 'skin'
      selezioneSkin.innerHTML = ''

      // Rende visibile il label per le skin

      labelSkin.classList.remove('hidden')
      labelSkin.innerHTML = 'Skin:'
      labelSkin.id = 'labelSkin' + div.id
      labelSkin.htmlFor = selezioneSkin.id

      // Popola le opzioni con le skin disponibili
      for (elem of skins) {
        elemento = document.createElement('option')
        elemento.value = elem
        elemento.text = elem
        selezioneSkin.add(elemento)
      }
      select.addEventListener('change', function () {
        const opzioneList = select.selectedOptions
        const opzione = opzioneList[0].value
        console.log(opzione)
        const skins = getSkins(data, opzione)
        if (skins != null) {
          // Rende visibile il select per le skin

          selezioneSkin.classList.remove('hidden')
          selezioneSkin.name = 'skinMacchina' + div.id
          selezioneSkin.id = selezioneSkin.name
          selezioneSkin.className = 'skin'
          selezioneSkin.innerHTML = ''

          // Rende visibile il label per le skin

          labelSkin.classList.remove('hidden')
          labelSkin.innerHTML = 'Skin:'
          labelSkin.id = 'labelSkin' + div.id
          labelSkin.htmlFor = selezioneSkin.id

          // Popola le opzioni con le skin disponibili
          for (elem of skins) {
            elemento = document.createElement('option')
            elemento.value = elem
            elemento.text = elem
            selezioneSkin.add(elemento)
          }
        } else {
          console.log(div.childNodes)
          if (div.childNodes.length > 3) {
            const primo = document.getElementById('skinMacchina' + div.id)
            const secondo = document.getElementById('labelSkin' + div.id)
            primo.innerHTML = ''
            secondo.innerHTML = ''
            primo.classList.add('hidden')
            secondo.classList.add('hidden')
          }
        }
      })
      div.appendChild(label)
      div.appendChild(select)
      div.appendChild(labelSkin)
      div.appendChild(selezioneSkin)
      div.append(rimuovi)
      document.getElementById('gestioneMacchine').appendChild(div)
      numeroMacchineForm.value = numeroMacchine
    } else {
      alert('Non puoi aggiungere più di 22 macchine')
    }
  }
}
