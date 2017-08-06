import { ipcMain as ipc } from 'electron';
import '../../plugins/syntaxes/javascript/src/main';
import '../../plugins/syntaxes/css/src/main';
import MirrorModel from './mirrorModel';
import Event from '../event';

const modelsMap = new Map();

ipc.on('ant-monaco:createModel', (event, args) => {
  const model = args;
  const { uri, lines, eol, versionId, language } = model;
  const mirror = new MirrorModel(uri, lines, eol, versionId);
  modelsMap.set(model.uri, mirror);

  // create and init model
  Event.dispatchGlobalEvent(MirrorModel.Events.onCreateModel, { event, language, model: mirror });
})

ipc.on('ant-monaco:updateModel', (e, args) => {
  const { uri, events } = args;
  const model = modelsMap.get(uri);
  model.onEvents(events);

  // update model
  Event.dispatchLocalEvent(model, MirrorModel.Events.onContentChange, { event: e, model });
})

global.Ant = { modelsMap };
