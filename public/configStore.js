const Store = require('electron-store');
const electron = require('electron');
const os = require('os');
const { join } = require('path');
const { pathExists } = require('fs-extra');

const { app } = electron;


const defaultKeyBindings = [
  { keys: 'plus', action: 'addSegment' },
  { keys: 'space', action: 'togglePlayResetSpeed' },
  { keys: 'k', action: 'togglePlayNoResetSpeed' },
  { keys: 'j', action: 'reducePlaybackRate' },
  { keys: 'l', action: 'increasePlaybackRate' },
  { keys: 'z', action: 'toggleComfortZoom' },
  { keys: ',', action: 'seekBackwardsShort' },
  { keys: '.', action: 'seekForwardsShort' },
  { keys: 'c', action: 'capture' },
  { keys: 'i', action: 'setCutStart' },
  { keys: 'o', action: 'setCutEnd' },
  { keys: 'backspace', action: 'removeCurrentSegment' },
  { keys: 'd', action: 'cleanupFiles' },
  { keys: 'b', action: 'splitCurrentSegment' },
  { keys: 'r', action: 'increaseRotation' },

  { keys: 'left', action: 'seekBackwards' },
  { keys: ['ctrl+left', 'command+left'], action: 'seekBackwardsPercent' },
  { keys: 'alt+left', action: 'seekBackwardsKeyframe' },
  { keys: 'shift+left', action: 'jumpCutStart' },

  { keys: 'right', action: 'seekForwards' },
  { keys: ['ctrl+right', 'command+right'], action: 'seekForwardsPercent' },
  { keys: 'alt+right', action: 'seekForwardsKeyframe' },
  { keys: 'shift+right', action: 'jumpCutEnd' },

  { keys: 'up', action: 'jumpPrevSegment' },
  { keys: ['ctrl+up', 'command+up'], action: 'zoomIn' },

  { keys: 'down', action: 'jumpNextSegment' },
  { keys: ['ctrl+down', 'command+down'], action: 'zoomOut' },

  // https://github.com/mifi/lossless-cut/issues/610
  { keys: ['ctrl+z', 'command+z'], action: 'undo' },
  { keys: ['ctrl+shift+z', 'command+shift+z'], action: 'redo' },

  { keys: ['enter'], action: 'labelCurrentSegment' },

  { keys: 'e', action: 'export' },
  { keys: 'h', action: 'toggleHelp' },
  { keys: 'escape', action: 'closeActiveScreen' },
];

const defaults = {
  captureFormat: 'jpeg',
  customOutDir: undefined,
  keyframeCut: true,
  autoMerge: false,
  autoDeleteMergedSegments: true,
  timecodeShowFrames: false,
  invertCutSegments: false,
  autoExportExtraStreams: true,
  exportConfirmEnabled: true,
  askBeforeClose: false,
  enableAskForImportChapters: true,
  enableAskForFileOpenAction: true,
  muted: false,
  autoSaveProjectFile: true,
  wheelSensitivity: 0.2,
  language: undefined,
  ffmpegExperimental: false,
  preserveMovData: false,
  movFastStart: true,
  avoidNegativeTs: 'make_zero',
  hideNotifications: undefined,
  autoLoadTimecode: false,
  segmentsToChapters: false,
  preserveMetadataOnMerge: false,
  simpleMode: true,
  outSegTemplate: undefined,
  keyboardSeekAccFactor: 1.03,
  keyboardNormalSeekSpeed: 1,
  enableTransferTimestamps: true,
  outFormatLocked: undefined,
  keyBindings: defaultKeyBindings,
};

// For portable app: https://github.com/mifi/lossless-cut/issues/645
async function getCustomStoragePath() {
  try {
    const isWindows = os.platform() === 'win32';
    if (!isWindows || process.windowsStore) return undefined;

    const customStoragePath = app.getAppPath();
    const customConfigPath = join(customStoragePath, 'config.json');
    if (await pathExists(customConfigPath)) return customStoragePath;
    return undefined;
  } catch (err) {
    console.error('Failed to get custom storage path', err);
    return undefined;
  }
}

let store;

async function init() {
  const customStoragePath = await getCustomStoragePath();
  if (customStoragePath) console.log('customStoragePath', customStoragePath);

  for (let i = 0; i < 5; i += 1) {
    try {
      store = new Store({ defaults, cwd: customStoragePath });
      return;
    } catch (err) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise(r => setTimeout(r, 2000));
      console.error('Failed to create config store, retrying', err);
    }
  }

  throw new Error('Timed out while creating config store');
}

function get(key) {
  return store.get(key);
}

function set(key, val) {
  if (val === undefined) store.delete(key);
  else store.set(key, val);
}

function reset(key) {
  set(key, defaults[key]);
}

module.exports = {
  init,
  get,
  set,
  reset,
};
