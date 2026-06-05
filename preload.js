console.log("PRELOAD LOADED")

const { contextBridge, ipcRenderer, shell } = require('electron')
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')

// 🔥 ПРАВИЛЬНЫЙ ПУТЬ ДЛЯ БИЛДА
const userDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'bat9bros-control')

if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true })
}

const dataPath = path.join(userDataPath, 'tracks.json')
const programsPath = path.join(userDataPath, 'programs.json')

function ensureFile(file) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '[]')
  }
}

contextBridge.exposeInMainWorld('api', {

  openExternal: (url) => shell.openExternal(url),

  // ================= TRACKS =================

  getTracks: () => {
    ensureFile(dataPath)
    return JSON.parse(fs.readFileSync(dataPath))
  },

  addTrack: (track) => {
    ensureFile(dataPath)
    const tracks = JSON.parse(fs.readFileSync(dataPath))
    tracks.push(track)
    fs.writeFileSync(dataPath, JSON.stringify(tracks, null, 2))
    return tracks
  },

  removeTrack: (index) => {
    const tracks = JSON.parse(fs.readFileSync(dataPath))
    tracks.splice(Number(index), 1)
    fs.writeFileSync(dataPath, JSON.stringify(tracks, null, 2))
    return tracks
  },

  updateTrackStatus: (index, newStatus) => {
    const tracks = JSON.parse(fs.readFileSync(dataPath))
    tracks[Number(index)].status = newStatus
    fs.writeFileSync(dataPath, JSON.stringify(tracks, null, 2))
    return tracks
  },

  // ================= PROGRAMS =================

  getPrograms: () => {
    ensureFile(programsPath)
    return JSON.parse(fs.readFileSync(programsPath))
  },

  addProgram: (program) => {
  ensureFile(programsPath)
  const programs = JSON.parse(fs.readFileSync(programsPath))

  programs.push({
    name: program.name,
    path: program.path,
    launches: 0
  })

  fs.writeFileSync(programsPath, JSON.stringify(programs, null, 2))
  return programs
},

  removeProgram: (index) => {
    ensureFile(programsPath)
    const programs = JSON.parse(fs.readFileSync(programsPath))
    programs.splice(Number(index), 1)
    fs.writeFileSync(programsPath, JSON.stringify(programs, null, 2))
    return programs
  },

  selectProgram: () => ipcRenderer.invoke('select-program'),

  launchProgram: (programPath) => {
    spawn(programPath, [], { detached: true, stdio: 'ignore' }).unref()
  }

})

contextBridge.exposeInMainWorld('mini', {
  onMiniMode: (callback) => {
    ipcRenderer.on('mini-mode', (_, value) => {
      callback(value)
    })
  }
})