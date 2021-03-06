class U.Setting
  reqState: []
  optState: []

  constructor: (@state) ->
    @el = document.createElement('div')
    @el.className = "setting " + @className
    @$el = $(@el)
    @state.when(@reqState, @optState, @render, @)

  render: (state) ->
    @$el.html(@template(state))

  delegateEvents: ->
    _.each(@events, (fn, ev) =>
      ev = ev.split(' ')
      selector = _.rest(ev).join(' ')
      ev = _.first(ev)
      @$el.on(ev, selector, _.bind(@[fn], @)))
