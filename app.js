require('dotenv').config()

const Prismic = require('@prismicio/client')
const PrismicH = require('@prismicio/helpers')
const fetch = require('node-fetch')

const express = require('express')
const path = require('path')
const app = express()
const port = 3000

const initApi = (req) => {
  return Prismic.createClient(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req,
    fetch
  })
}

const handleLinkResolver = (doc) => {
  return '/'
}

app.use((req, res, next) => {
  res.locals.Link = handleLinkResolver
  res.locals.PrismicH = PrismicH

  next()
})

app.set('views', path.join(__dirname, 'views'))
app.locals.basedir = app.get('views')
app.set('view engine', 'pug')

const handleRequest = async (api) => {
  const [meta, preloader, navigation, home, about, { results: collections }] =
    await Promise.all([
      api.getSingle('meta'),
      api.getSingle('preloader'),
      api.getSingle('navigation'),
      api.getSingle('home'),
      api.getSingle('about'),
      api.query(Prismic.Predicates.at('document.type', 'collection'), {
        fetchLinks: 'product.image'
      })
    ])

  //   console.log(about, home, collections);

  const assets = []

  about.data.gallery.forEach((item) => {
    assets.push(item.image.url)
  })

  about.data.body.forEach((section) => {
    if (section.slice_type === 'gallery') {
      section.items.forEach((item) => {
        assets.push(item.image.url)
      })
    }
  })

  collections.forEach((collection) => {
    collection.data.list.forEach((item) => {
      assets.push(item.product.data.image.url)
    })
  })

  console.log(assets)

  return {
    assets,
    meta,
    home,
    collections,
    about,
    navigation,
    preloader
  }
}

app.get('/', (req, res) => {
  res.render('pages/home')
})

app.get('/about', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)

  console.log(defaults.about.data.body[2])

  res.render('pages/about', {
    ...defaults
  })
})

app.get('/collections', (req, res) => {
  res.render('pages/collections')
})

app.get('/detail/:uid', async (req, res) => {
  console.log(req.params.uid)
  const api = await initApi(req)
  const defaults = await handleRequest(api)

  console.log(defaults.about.data.body[2])

  res.render('pages/detail/:uid', {
    ...defaults
  })
})

app.listen(port, () => {
  console.log(`listening port: ${port}`)
})
