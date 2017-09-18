import * as extensions from './extensions';
import * as commands from './commands';
import * as workspace from './workspace';
import window from './window';
import languages from './languages';
import { EventEmitter } from './Event';
import { IndentAction } from './const.d';
import Promise from 'bluebird';
import * as types from './types';

export default {
  env: {
    APPINSIGHTS_INSTRUMENTATIONKEY: 'antmonacoown'
  },
  ...types,

  // features
  extensions,
  commands,
  workspace,
  window,
  languages,

  // event
  EventEmitter,

  // const
  IndentAction,
}