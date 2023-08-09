const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')

const password = process.env.PASSWORD

const url =
  `mongodb+srv://hevemiko:${password}@cluster0.quqg3jx.mongodb.net/?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
//mongoose.connect(url)

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan('tiny',
    {
    skip: function (req, res) { return req.method != "POST" }
  }))

let persons = []

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  id: Number
})

const Person = mongoose.model('Person', personSchema)

const loadAll = () => {
  console.log("loadAll()")
  mongoose.connect(url).then(() => {
    console.log("after connect")
    Person.find({}).then(result => {
      result.forEach(p => {
        console.log(p)
        persons.push(p)
      })
      mongoose.connection.close()
    })
  })
}


const createPerson = newPerson => {
  mongoose.connect(url).then(()=> {
    const person = new Person(newPerson)
    person.save().then(result => {
      console.log('person saved!')
      mongoose.connection.close()
    })
  })
}

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
  loadAll()
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
        createPerson(newPerson)
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
    Person.find({ id: newPerson.id }).then(result => {
      result.name = newPerson.name
      result.number = newPerson.number
    })
      loadAll()
      response.json(newPerson)
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`)
  })  