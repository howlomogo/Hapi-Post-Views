const Hapi = require('hapi')
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/taskdb')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err))

// Create Task Model
const Task = mongoose.model('Task', {text:String})

// Init Server
const server = new Hapi.Server()

// Add Connection
server.connection({
  port: 3000,
  host:'localhost'
})

// Home Route
server.route({
  method: 'GET',
  path: '/',
  handler: (request, reply) => {
    reply.view('index', {
      name: 'Matt Pilcher'
    })
  }
})

// Dynamic Route
server.route({
  method: 'GET',
  path: '/user/{name}',
  handler: (request, reply) => {
    reply('Hello, ' + request.params.name)
  }
})

// Get Tasks Route
server.route({
  method: 'GET',
  path: '/tasks',
  handler: (request, reply) => {
    let tasks = Task.find((err, tasks) => {
      reply.view('tasks', {
        tasks:tasks
      })
    })
    /*
    reply.view('tasks', {
      tasks: [
        {text: 'Text One'},
        {text: 'Text Two'},
        {text: 'Text Three'}
      ]
    })
    */
  }
})

// Post Tasks Route - listen for the form post request to /tasks
server.route({
  method: 'POST',
  path: '/tasks',
  handler: (request, reply) => {
    // Get the text coming from the form with payload - name = text
    let text = request.payload.text
    let newTask = new Task({
      text:text
    })
    newTask.save((err, task) => {
      if(err) {
        return console.log(err)
      }
      // redirect if successful
      return reply.redirect().location('tasks')
    })
  }
})

// Static Routes
server.register(require('inert'), (err) => {
  if(err){
    throw err
  }

  server.route({
    method: 'GET',
    path: '/about',
    handler: (request, reply) => {
      reply.file('./public/about.html')
    }
  })

  server.route({
    method: 'GET',
    path: '/image',
    handler: (request, reply) => {
      reply.file('./public/bear.jpg')
    }
  })
})

// Vision TEmplates
server.register(require('vision'), (err) => {
  if(err){
    throw err
  }

  server.views({
    engines: {
      html: require('handlebars')
    },
    path: __dirname + '/views'
  })
})

// Start Server
server.start((err) => {
  if(err){
    throw err
  }
  console.log(`Server started at: ${server.info.uri}`)
})
