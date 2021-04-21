async function getMappe () {
  const data = await fetch('/manager/mappe/disponibili')
  return data
}

window.onload = main

async function main () {
  const data = await (await getMappe()).json()
  const mappeDisponibili = Object.keys(data)
  console.log(data)
  document.querySelectorAll('#mappaScelta').forEach(elem => {
    window.addEventListener('click', function (e) {
      if (!elem.contains(e.target)) {
        elem.lastElementChild.classList.add('hide')
      }
    })
  })
  const selectDiv = document.querySelectorAll('#mappaScelta')
  const searchInput = document.querySelectorAll('.search')
  console.log(mappeDisponibili)
  document.querySelectorAll('.opzione-disabilitata').forEach(elem => { elem.remove() })
  selectDiv.forEach(elem => {
    elem.children[1].addEventListener('click', () => {
      elem.lastElementChild.classList.toggle('hide')
    })
    for (const mappe of mappeDisponibili) {
      const opzione = document.createElement('div')
      opzione.className = 'opzione'
      opzione.setAttribute('data-primascelta', mappe)
      opzione.textContent = mappe
      opzione.addEventListener('click', () => {
        opzione.parentElement.parentElement.classList.toggle('hide')
        const child = opzione.parentElement.parentElement.previousElementSibling
        child.textContent = opzione.dataset.primascelta
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
    console.log(opzione)
    let layoutSelezione = document.getElementById('layoutScelto')
    if (data[opzione] !== null) {
      if (layoutSelezione === null) {
        layoutSelezione = selectDiv[0].cloneNode(true)
        layoutSelezione.id = 'layoutScelto'
        layoutSelezione.firstElementChild.name = 'layoutScelto'
        layoutSelezione.children[1].textContent = 'Seleziona il layout'
        layoutSelezione.lastElementChild.lastElementChild.innerHTML = ''
        layoutSelezione.children[1].addEventListener('click', () => {
          layoutSelezione.children[2].classList.toggle('hide')
        })

        for (const layout of data[opzione]) {
          const opzione = document.createElement('div')
          opzione.className = 'opzione'
          opzione.setAttribute('data-primascelta', layout)
          opzione.textContent = layout
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
        for (const layout of data[opzione]) {
          const opzione = document.createElement('div')
          opzione.className = 'opzione'
          opzione.setAttribute('data-primascelta', layout)
          opzione.textContent = layout
          opzione.addEventListener('click', () => {
            opzione.parentElement.parentElement.classList.toggle('hide')
            const child = opzione.parentElement.parentElement.previousElementSibling
            child.textContent = opzione.dataset.primascelta
            child.previousElementSibling.value = opzione.dataset.primascelta
          })
          layoutSelezione.append(opzione)
        }
      }
    } else {
      console.log(layoutSelezione)
      if (layoutSelezione !== null) {
        layoutSelezione.remove()
      }
    }
  })
}
