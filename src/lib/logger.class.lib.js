const colors = require('colors');

function __callerfile() {
  try {
      var err = new Error();
      var callerfile;
      var currentfile;

      Error.prepareStackTrace = function (err, stack) { return stack; };

      currentfile = err.stack.shift().getFileName();

      while (err.stack.length) {
          callerfile = err.stack.shift().getFileName();

          if(currentfile !== callerfile) return callerfile.replace(process.env.dirname, '');
      }
  } catch (err) {}
  return undefined;
}

class Print {
  info (...msg) { console.log(`[${new Date().toUTCString()}]`.cyan, ...msg) }
  response(ms, url, method, http_code, ip) { 
    ip = ip.replace('::ffff:', '');
    ip = (ip == '::1') ? 'localhost' : ip;

    ms = new Date().getTime() - ms;

    console.log(`[${new Date().toUTCString()} • ${ms}ms]`.cyan + ` ${url} • ${method} • ${http_code} • ${ip}`)
  }
  error (...msg) { console.log(`[${new Date().toUTCString()} • ${__callerfile()}]`.red, ...msg) }
  warn (...msg) { console.log(`[${new Date().toUTCString()} • ${__callerfile()}]`.yellow, ...msg) }
}

const print = new Print();

module.exports = { Print, print }