const prismic = require('@prismicio/client')
const PrismicDOM = require('prismic-dom')
require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
const port = 3000

const initApi = req => {
  return prismic.getApi(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_CLIENT_TOKEN,
    req
  })
}

const handleLinkResolver = (doc) => {
  return '/'
}

app.use((req, res, next) => {
  res.locals.ctx = {
    endpoint: process.env.PRISMIC_ENDPOINT,
    linkResolver: handleLinkResolver
  }
  res.locals.PrismicDOM = PrismicDOM
  next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('pages/home')
})

app.get('/about', async (req, res) => {
  initApi(req).then(api => {
    api.query(
      prismic.predicates.any('document.type', ['about', 'meta'])).then(response => {
      const { results } = response
      const [about, meta] = results
      // console.log(about.data.body)
      console.log(about.data.body.section)

      about.data.gallery.forEach(media => {
        console.log(media)
      })
      // console.log(about, meta)
      res.render('pages/about', {
        meta,
        about
      })
    })
  })
})

app.get('/collections', (req, res) => {
  res.render('pages/collections')
})

app.get('/detail/:id', (req, res) => {
  res.render('pages/detail')
})

app.listen(port, () => {
  console.log(`listening port: ${port}`)
})
