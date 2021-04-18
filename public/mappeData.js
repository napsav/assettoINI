async function getMappe () {
  const data = await fetch('/manager/mappe/disponibili')
  return data
}

window.onload = main

async function main () {
  const data = await (await getMappe()).json()
  const selezioneMappa = document.getElementById('mappaScelta')
  document.getElementById('loading').remove()
  const mappeDisponibili = Object.keys(data)
  console.log(data)
  for (const mappa of mappeDisponibili) {
    const option = document.createElement('option')
    option.value = mappa
    option.text = mappa
    selezioneMappa.append(option)
  }
  selezioneMappa.addEventListener('change', function () {
    const opzione = selezioneMappa.selectedOptions[0].value
    let layoutSelezione = document.getElementById('layoutScelto')
    if (data[opzione] !== null) {
      if (layoutSelezione === null) {
        layoutSelezione = document.createElement('select')
        layoutSelezione.name = 'layoutScelto'
        layoutSelezione.id = 'layoutScelto'
        for (const layout of data[opzione]) {
          const option = document.createElement('option')
          option.value = layout
          option.text = layout
          layoutSelezione.append(option)
        }
        selezioneMappa.insertAdjacentElement('afterend', layoutSelezione)
      } else {
        layoutSelezione.innerHTML = ''
        for (const layout of data[opzione]) {
          const option = document.createElement('option')
          option.value = layout
          option.text = layout
          layoutSelezione.append(option)
        }
      }
    } else {
      if (layoutSelezione !== null) {
        layoutSelezione.remove()
      }
    }
  })
}
