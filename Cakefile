fs = require 'fs'
{spawn} = require 'child_process' 
{print} = require 'util'

option '-s', '--server', 'starts node static server on the build directory'
option '-p', '--port [PORT]', 'sets port for server to start on'
option '-m', '--minifiy', 'minifies the compiled output'

task 'build', 'Build lib/ from src', (options) ->
  if options.server
    invoke 'server'
  coffee = spawn './node_modules/.bin/coffee', ['-c', '-o', 'lib', 'src']
  coffee.stderr.on 'data', (data) ->
    process.stderr.write data.toString()
  coffee.stdout.on 'data', (data) ->
    print data.toString()
  coffee.on 'exit', (code) ->
    invoke 'copy'
    callback?() if code is 0

task 'watch', 'Watch src/ for changes', (options) ->
  if options.server
    invoke 'server'
  coffee_src = spawn './node_modules/.bin/coffee', ['-w', '-c', '-o', 'lib', 'src']
  coffee_src.stderr.on 'data', (data) ->
    process.stderr.write data.toString()
  coffee_src.stdout.on 'data', (data) ->
    invoke 'copy'
    print data.toString()

task 'server', "Serve contents of build", (options) ->
  port = options.port || 3001
  node_static = spawn './node_modules/.bin/static', ['build', '--port', port]
  node_static.stderr.on 'data', (data) ->
    process.stderr.write data.toString()
  node_static.stdout.on 'data', (data) ->
    print data.toString()

task 'copy', 'Copy lib and vendor to build', (options) =>
  cp = spawn 'cp', ['-r', __dirname + '/lib', __dirname + '/build/']
  cp2 = spawn 'cp', ['-r', __dirname + '/vendor', __dirname + '/build/']
  for copier in [cp, cp2]
    copier.stderr.on 'data', (data) ->
      process.stderr.write data.toString()
    copier.stdout.on 'data', (data) ->
      process.stdout.write data.toString()
    copier.on 'exit', (code) ->
      callback?() if code is 0