const mongoose = require("mongoose")

const password = process.env.PASSWORD

//console.log(password)

const url =
  `mongodb+srv://hevemiko:${password}@cluster0.quqg3jx.mongodb.net/?retryWrites=true&w=majority`

mongoose.set("strictQuery",false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [3, "Name too short"],
    required: [true, "Peron's name is required"]
  },
  number: {
    type: String,
    validate: {
      validator: function(v) {
        return /\d{2,3}-\d+/.test(v)
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: [true, "User phone number required"]
  },
  id: String
})
personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model("Person", personSchema)

const loadAll = async () => {
  //return mongoose.connect(url).then(result =>
  return await Person.find({}).then(result => {
    //mongoose.connection.close()
    console.log(result.length   )
    return result
  })
  //)
}

//loadAll()

const createPerson = async newPerson => {
  await mongoose.connect(url)
  const person = new Person(newPerson)
  const result = await person.save()
  console.log("person saved!")
  return result
}

const getPerson = id => {
  return Person.findById(id)
}

const deletePerson = id => {
  //return mongoose.connect(url).then(()=> {
  return Person.findByIdAndDelete(id).then(result => {
    console.log("person deleted!")
    return result
    //mongoose.connection.close()
  })
  //})
}
const updatePerson = newPerson => {
  return Person.findByIdAndUpdate(newPerson.id, newPerson, { new: true, runValidators: true, context: "query"  })
}

module.exports = {
  Person: Person,
  loadAll: loadAll,
  createPerson: createPerson,
  getPerson: getPerson,
  deletePerson: deletePerson,
  updatePerson: updatePerson
}
