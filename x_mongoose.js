const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]
const id = process.argv[5]

const url =
  `mongodb+srv://hevemiko:${password}@cluster0.quqg3jx.mongodb.net/?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  id: Number,
})

const Person = mongoose.model('person', personSchema)

const person = new Person({
  name,
  number,
  id
})

person.save().then(result => {
  console.log('person saved!')
  mongoose.connection.close()
})