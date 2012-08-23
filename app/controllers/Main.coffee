Spine = require('spine')

GalaxyZooSubject = require('models/GalaxyZooSubject')

Dashboard = require('controllers/Dashboard')
Toolbox = require('controllers/Toolbox')
Map = require('controllers/Map')
Table = require('controllers/Table')

class Main extends Spine.Controller
  constructor: ->
    super
    console.log 'Main'
    @append require('views/main')()

    @dashboard = new Dashboard( {el: ".dashboard" } )
    @toolbox = new Toolbox( {el: ".toolbox", tools: [ {name: "Map", desc: "Maps Things"}, {name: "Table", desc: "Tables Things"} ]} )
    @toolbox.bind 'add-new-tool', @addTool

  addTool: (toolName) =>
    switch toolName
      when "Map" then @dashboard.createTool Map
      when "Table" then @dashboard.createTool Table

    
    
module.exports = Main