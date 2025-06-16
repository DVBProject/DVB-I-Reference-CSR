


let logger = null;


const ERROR = "error"
const LOG = "log"
const WARN = "warn"
const INFO = "info"

const logs = {
  [LOG]: console.log,
  [WARN]: console.warn,
  [INFO]: console.info,
  [ERROR]: console.error
}

const graylog = {
  [LOG]: logger?.log,
  [WARN]: logger?.warning,
  [INFO]: logger?.info,
  [ERROR]: logger?.error
}

function log(...val) {
  logging(LOG,...val)
}
function warn(...val) {
  logging(WARN,...val)
}
function info(...val) {
  logging(INFO,...val)
}
function error(...val) {
  logging(ERROR,...val)
}

function logging(type,...val) {
  try {
    if(logger) {
      //TODO implement logging, graylog for example
    }
    else {
      logs[type].call(this,...val)
    }
  }
  catch(e) {
    console.error("Logging error",e,type,...val)
  }

}

module.exports = {log,warn,info,error}