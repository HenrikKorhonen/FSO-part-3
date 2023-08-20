const express = require("express")
const app = express()
const morgan = require("morgan")
const cors = require("cors")

const Person = require("./models/person")

app.use(cors())
app.use(express.static("build"))
app.use(express.json())
app.use(morgan(function (tokens, req, res) {
  const body = (req.method === "POST" || req.method === "PUT") ? req.body : "-"
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    JSON.stringify(body),
    tokens.res(req, res, "content-length"), "-",
    tokens["response-time"](req, res), "ms"
  ].join(" ")
}))

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>")
})

app.get("/info", (request, response) => {
  const elements = []
  Person.Person.countDocuments().then((res) => {
    elements.push(`<p>Phonebook has info for ${res} people</p>`)
    elements.push(`<p>${Date()}</p>`)
    response.send(elements.join(""))
  }
  )
})

app.get("/api/persons/:id", async (request, response, next) => {
  Person.getPerson(request.params.id).then(result => {
    return response.json(result)
  }
  ).catch(error => next(error))
})


app.delete("/api/persons/:id", async (request, response) => {
  response.json(await Person.deletePerson(request.params.id))
})


app.get("/api/persons", (request, response) => {
  Person.loadAll().then(result => {
    response.json(result)
  })
})

app.post("/api/persons", async (request, response, next) => {
  let newPerson = request.body
  let fail = null
  if (!newPerson.name || !newPerson.number) {
    fail = "Name or number is missing"
    response.body = JSON.json({ fail })
    response.status(400).end()
  } else {
    //newPerson.id = Math.round(Math.random()*10000)
    try {
      response.json(await Person.createPerson(newPerson))
    } catch (error) {
      next(error)
    }
  }
})

app.put("/api/persons/:id", async (request, response, next) => {
  let newPerson = request.body
  let fail = null
  if (!newPerson.name || !newPerson.number) {
    fail = "Name or number is missing"
    console.log(fail)
  }
  if (fail) {
    response.body = { "message": fail }
    response.status(400).end()
  } else {
    Person.updatePerson(newPerson).then(result =>
      response.json(result)
    ).catch(error => next(error))
  }
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({ error })
  }
  if (error.name === "ValidationError") {
    return response.status(400).send({ error })
  }
  else {
    response.status(500).send({ error })
  }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT || 3000
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`)
})