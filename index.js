const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(morgan('tiny',
    {
    skip: function (req, res) { return req.method != "POST" }
  }))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
    let elements = []
    let n = persons.length
    elements.push(`<p>Phonebook has info for ${n} people</p>`)
    elements.push(`<p>${Date()}</p>`)
    response.send(elements.join(""))
  })

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(note => note.id === id)
    if (!person) {
        response.status(404).end()
    } else {
        response.json(person)
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(note => note.id === id)
    if (!person) {
        response.status(404).end()
    } else {
        persons = persons.filter(p => p.id === id)
        response.json(person)
    }
})


app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.post('/api/persons', (request, response) => {
    let newPerson = request.body
    let fail = null
    if (!newPerson.name || !newPerson.number) {
        fail = "Name or number is missing"
    } else if (persons.findIndex(p => p.name === newPerson.name) >= 0) {
        fail = "Name already exists"
    }
    if (fail) {
        response.body = { fail }
        response.status(400).end()
    } else {
        newPerson.id = Math.round(Math.random()*10000)
        persons.push(newPerson)
        response.json(newPerson)
    }
})

app.put('/api/persons/:id', (request, response) => {
  let newPerson = request.body
  let fail = null
  if (!newPerson.name || !newPerson.number) {
      fail = "Name or number is missing"
  } 
  if (persons.findIndex(p => p.id === newPerson.id) == -1) {
    fail = "Invalid ID"
  }
  if (fail) {
      response.body = { fail }
      response.status(400).end()
  } else {
      persons = persons.filter(p => p.id === newPerson.id)
      persons.push(newPerson)
      response.json(newPerson)
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })