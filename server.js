const express = require('express')
const app = express()
const Airtable = require('airtable')

const dotenv = require('dotenv')
dotenv.config()

//const base = require('airtable').base(process.env.AIRTABLE_BASE_NAME)
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appf7mrRY6a3xK8jT');
//const table = base(process.env.AIRTABLE_TABLE_NAME)
/*
Airtable.configure({
    apiKey: process.env.AIRTABLE_API_KEY
})
*/
app.use(express.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

app.post('/form', (req, res) => {
  const name = req.body.name
  const date = req.body.date
  console.log(name)
  console.log(date)

  base('Subscriptions').create({
    "Name": name,
    "Date": date
  }, (err, record) => {
    if (err) {
      console.error(err)
      return
    }
    console.log(record.getId())
  })
  res.status(200).type('json').end()
})

const getNames = (date) => {
  return new Promise((resolve, reject) => {
    base('Subscriptions').select({
      maxRecords: 56,
      filterByFormula: 'Date=DATETIME_PARSE("' + date + '")'
    }).firstPage((err, records) => {
      if (err) {
        reject(err)
        return
      }
      resolve(records)
    })
  })
}

app.get('/list', (req, res) => {
  const ret = []
  const date = req.query.date
  console.log('date = ' + date)
  getNames(date).then(records => {
    records.forEach(record => {
      const name = record.get('Name')
      console.log(name)
      ret.push(name)
    })
    console.log('return names')
    res.status(200).type('json').end(JSON.stringify(ret))
  }).catch(err => {
    console.log(err)
  })

})
/*
console.log('return names')
res.status(200).type('json').end(JSON.stringify(names))  
*/
//res.sendFile(__dirname + '/views/list.pug') 

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
