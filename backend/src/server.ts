import express from 'express'

import './database/connection'

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
  console.log('teste')
  res.send('teste')
})

app.listen(3333)