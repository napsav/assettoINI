async function getMappe () {
  const data = await fetch('/manager/mappe/disponibili')
  return data
}

window.onload = main

async function main () {
  const data = await (await getMappe()).json()
  const mappeDisponibili = data.map(obj => obj.name)
  console.log(data)
  console.log(mappeDisponibili)
  document.querySelectorAll('#mappaScelta').forEach(elem => {
    window.addEventListener('click', function (e) {
      if (!elem.contains(e.target)) {
        elem.lastElementChild.classList.add('hide')
      }
    })
  })
  const selectDiv = document.querySelectorAll('#mappaScelta')
  const searchInput = document.querySelectorAll('.search')
  document.querySelectorAll('.opzione-disabilitata').forEach(elem => { elem.remove() })
  selectDiv.forEach(elem => {
    elem.children[1].addEventListener('click', () => {
      elem.lastElementChild.classList.toggle('hide')
    })
    for (const mappa of data) {
      const opzione = document.createElement('div')
      opzione.className = 'opzione'
      opzione.setAttribute('data-primascelta', mappa.name)
      const cover = document.createElement('img')
      cover.className = 'cover-tracciato'
      if(mappa.layouts !== null) {
        opzione.textContent = mappa.layouts[0].data.name
        cover.src = mappa.layouts[0].outline
      } else {
        opzione.textContent = mappa.data.name
        cover.src = mappa.outline
      }
      opzione.append(cover)
      
      opzione.addEventListener('click', () => {
        opzione.parentElement.parentElement.classList.toggle('hide')
        const child = opzione.parentElement.parentElement.previousElementSibling
        const oggettoScelto = data.find(obj=> obj.name === opzione.dataset.primascelta)
        if (oggettoScelto.layouts !== null) {
          child.textContent = oggettoScelto.layouts[0].data.name
        } else {
          child.textContent = oggettoScelto.data.name
        }
        child.previousElementSibling.value = opzione.dataset.primascelta
        const event = new CustomEvent('change', {
          detail: {
            primascelta: opzione.dataset.primascelta
          }
        })
        elem.dispatchEvent(event)
      })
      elem.lastElementChild.lastElementChild.append(opzione)
    }
  })
  searchInput.forEach(elem => {
    elem.addEventListener('input', () => {
      const lista = Array.from(elem.nextElementSibling.children)
      for (const opzione of lista) {
        if (opzione.textContent.toLowerCase().indexOf(elem.value.toLowerCase()) > -1) {
          opzione.style.display = ''
        } else {
          opzione.style.display = 'none'
        }
      }
    })
  })

  selectDiv[0].addEventListener('change', function (e) {
    const opzione = e.detail.primascelta
    let layoutSelezione = document.getElementById('layoutScelto')
    if (data.find(obj => obj.name === opzione).layouts !== null) {
      if (layoutSelezione === null) {
        layoutSelezione = selectDiv[0].cloneNode(true)
        layoutSelezione.id = 'layoutScelto'
        layoutSelezione.firstElementChild.name = 'layoutScelto'
        layoutSelezione.children[1].textContent = 'Seleziona il layout'
        layoutSelezione.lastElementChild.lastElementChild.innerHTML = ''
        layoutSelezione.children[1].addEventListener('click', () => {
          layoutSelezione.children[2].classList.toggle('hide')
        })

        for (const layout of data.find(obj => obj.name === opzione).layouts) {
          const opzione = document.createElement('div')
          opzione.className = 'opzione'
          opzione.setAttribute('data-primascelta', layout.id)
          opzione.textContent = layout.id
          opzione.addEventListener('click', () => {
            opzione.parentElement.parentElement.classList.toggle('hide')
            const child = opzione.parentElement.parentElement.previousElementSibling
            child.textContent = opzione.dataset.primascelta
            child.previousElementSibling.value = opzione.dataset.primascelta
          })
          layoutSelezione.lastElementChild.lastElementChild.append(opzione)
        }
        selectDiv[0].insertAdjacentElement('afterend', layoutSelezione)
        document.querySelectorAll('#layoutScelto').forEach(elem => {
          window.addEventListener('click', function (e) {
            if (!elem.contains(e.target)) {
              elem.lastElementChild.classList.add('hide')
            }
          })
        })
      } else {
        layoutSelezione.children[2].lastElementChild.innerHTML = ''
        for (const layout of data.find(obj => obj.name === opzione).layouts) {
          const opzione = document.createElement('div')
          opzione.className = 'opzione'
          opzione.setAttribute('data-primascelta', layout.id)
          opzione.textContent = layout.id

          opzione.addEventListener('click', () => {
            opzione.parentElement.parentElement.classList.toggle('hide')
            const child = opzione.parentElement.parentElement.previousElementSibling
            
            child.textContent = opzione.dataset.primascelta
            child.previousElementSibling.value = opzione.dataset.primascelta
          })
          layoutSelezione.children[1].textContent = 'Seleziona il layout'
          layoutSelezione.children[2].lastElementChild.append(opzione)
        }
      }
    } else {
      if (layoutSelezione !== null) {
        layoutSelezione.remove()
      }
    }
  })
}
