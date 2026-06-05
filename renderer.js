console.log("window.api =", window.api)

// ================= TAB SWITCH =================

function showTab(tab) {
  const music = document.getElementById('musicTab')
  const launcher = document.getElementById('launcherTab')

  if (tab === 'music') {
    music.style.display = 'block'
    launcher.style.display = 'none'
  } else {
    music.style.display = 'none'
    launcher.style.display = 'block'
  }
}

// ================= TRACKS =================

function loadTracks() {
  const tracks = window.api.getTracks()

  const work = document.getElementById('workColumn')
  const done = document.getElementById('doneColumn')
  const release = document.getElementById('releaseColumn')

  work.innerHTML = ''
  done.innerHTML = ''
  release.innerHTML = ''

  tracks.forEach((track, index) => {

    const card = document.createElement('div')
    card.className = "card"
    card.draggable = true
    card.dataset.index = index

    card.innerHTML = `
      <b>${track.name}</b>
      <div class="genre">${track.genre || ''}</div>
      <div class="desc">${track.description || ''}</div>
    `

    const delBtn = document.createElement('button')
    delBtn.textContent = "✖"
    delBtn.className = "delete-btn"
    delBtn.onclick = () => {
      window.api.removeTrack(index)
      loadTracks()
    }

    card.appendChild(delBtn)

    card.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", index)
    })

    if (track.status === "Готово") {
      done.appendChild(card)
    } else if (track.status === "Релиз") {
      release.appendChild(card)
    } else {
      work.appendChild(card)
    }

  })
}

function addTrack() {
  const name = document.getElementById('trackName').value
  const genre = document.getElementById('trackGenre').value
  const description = document.getElementById('trackDescription').value
  const statusSelect = document.getElementById('trackStatus')

  const status = statusSelect ? statusSelect.value : "В работе"

  if (!name) return

  window.api.addTrack({
    name,
    genre,
    description,
    status
  })

  document.getElementById('trackName').value = ''
  document.getElementById('trackGenre').value = ''
  document.getElementById('trackDescription').value = ''

  loadTracks()
  loadMiniWork()
}

// ================= DRAG & DROP =================

function setupDropZones() {

  const columns = document.querySelectorAll('.column-content')

  columns.forEach(column => {

    column.addEventListener('dragover', (e) => {
      e.preventDefault()
      column.style.background = "rgba(255,255,255,0.1)"
    })

    column.addEventListener('dragleave', () => {
      column.style.background = ""
    })

    column.addEventListener('drop', (e) => {
      e.preventDefault()
      column.style.background = ""

      const index = Number(e.dataTransfer.getData("text/plain"))
      const parentColumn = column.closest('.column')
      const newStatus = parentColumn.dataset.status

      console.log("DROP WORKS", index, newStatus)

      window.api.updateTrackStatus(index, newStatus)
      loadTracks()
    })

  })
}

// ================= PROGRAMS =================

function loadPrograms() {
  const programs = window.api.getPrograms()
  const container = document.getElementById('programList')

  if (!container) return

  container.innerHTML = ''

  programs.forEach((program, index) => {
    const btn = document.createElement('button')
    btn.textContent = `${program.name} (${program.launches || 0})`
    btn.onclick = () => window.api.launchProgram(program.path, index)

    container.appendChild(btn)
  })
}

function loadPrograms() {
  const programs = window.api.getPrograms()
  const container = document.getElementById('programList')

  if (!container) return

  container.innerHTML = ''

  programs.forEach((program, index) => {

    const wrapper = document.createElement('div')
    wrapper.className = "program-item"

    const launchBtn = document.createElement('button')
    launchBtn.textContent = `${program.name} (${program.launches || 0})`
    launchBtn.className = "program-launch"
    launchBtn.onclick = () => {
      window.api.launchProgram(program.path)
    }

    const deleteBtn = document.createElement('button')
    deleteBtn.textContent = "✖"
    deleteBtn.className = "program-delete"
    deleteBtn.onclick = () => {
      window.api.removeProgram(index)
      loadPrograms()
      loadMiniPrograms()
    }

    wrapper.appendChild(launchBtn)
    wrapper.appendChild(deleteBtn)

    container.appendChild(wrapper)

  })
}

function addProgram() {

  const name = document.getElementById('programName').value
  const path = document.getElementById('programPath').value

  if (!name || !path) return

  window.api.addProgram({ name, path })

  document.getElementById('programName').value = ''
  document.getElementById('programPath').value = ''

  loadPrograms()
  loadMiniPrograms()
}

async function selectFile() {
  const filePath = await window.api.selectProgram()

  if (filePath) {
    document.getElementById('programPath').value = filePath
  }
}

// ================= INIT =================

window.addEventListener("DOMContentLoaded", () => {

  loadTracks()
  loadPrograms()
  setupDropZones()
  loadMiniWork()
  loadMiniPrograms()
  updateMotivation()

})

window.mini.onMiniMode((isMini) => {

  const music = document.getElementById('musicTab')
  const launcher = document.getElementById('launcherTab')

  if (isMini) {
    document.body.classList.add('mini-mode')

    // скрываем вкладки
    music.style.display = 'block'
    launcher.style.display = 'none'

  } else {
    document.body.classList.remove('mini-mode')

    // возвращаем всё как было
    music.style.display = 'block'
    launcher.style.display = 'none'

    // 🔥 ОБЯЗАТЕЛЬНО перерисовываем
    loadTracks()
    loadPrograms()
  }

})

function loadMiniWork() {
  const tracks = window.api.getTracks()
  const container = document.getElementById('miniWork')

  if (!container) return

  container.innerHTML = ''

  tracks
    .filter(t => t.status === "В работе")
    .forEach(track => {
      const div = document.createElement('div')
      div.textContent = track.name
      container.appendChild(div)
    })
}

function launchFL() {
  window.api.launchProgram(
    "C:/Program Files/Image-Line/FL Studio 2025/FL64.exe"
  )
}

function quickAddTrack() {

  const name = "Новый трек " + Date.now()

  window.api.addTrack({
    name,
    genre: "",
    description: "",
    status: "В работе"
  })

  loadTracks()
  loadMiniWork()
}

function loadMiniPrograms() {
  const programs = window.api.getPrograms()
  const container = document.getElementById('miniPrograms')

  if (!container) return

  container.innerHTML = ''

  programs.forEach((program, index) => {
    const btn = document.createElement('button')
    btn.textContent = program.name
    btn.onclick = () => {
      window.api.launchProgram(program.path, index)
    }
    container.appendChild(btn)
  })
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0]
}

let sessionInterval = null
let sessionSeconds = 0

function startSession() {

  sessionSeconds = 0

  if (sessionInterval) clearInterval(sessionInterval)

  sessionInterval = setInterval(() => {
    sessionSeconds++
    localStorage.setItem("lastProductionDate", getTodayDate())
    localStorage.setItem("todaySeconds", sessionSeconds)
    updateMotivation()
  }, 1000)

}

function updateMotivation() {

  const box = document.getElementById("motivationBox")
  if (!box) return

  const lastDate = localStorage.getItem("lastProductionDate")
  const today = getTodayDate()

  const todaySeconds = Number(localStorage.getItem("todaySeconds") || 0)
  const todayMinutes = Math.floor(todaySeconds / 60)

  if (!lastDate) {
    box.innerText = "Ты ещё ни разу не начинал прод-сессию 😶"
    return
  }

  const diffDays = Math.floor(
    (new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24)
  )

  if (diffDays >= 2) {
    box.innerText = `Ты ${diffDays} дня не делал трек.`
  } else if (todayMinutes === 0) {
    box.innerText = "Сегодня 0 минут продакшена."
  } else {
    box.innerText = `Сегодня ${todayMinutes} мин продакшена 🔥`
  }

}

function openLink(url) {
  window.api.openExternal(url)
}

function stopSession() {
  if (sessionInterval) {
    clearInterval(sessionInterval)
    sessionInterval = null
  }
}