require('dotenv').config()

const Prismic = require('@prismicio/client')
const PrismicH = require('@prismicio/helpers')
const fetch = require('node-fetch')

const express = require('express')
const logger = require('morgan')
const errorHandler = require('errorhandler')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const path = require('path')
const app = express()
const port = 3000

app.use(
  logger('dev'),
  bodyParser.json(),
  methodOverride(),
  errorHandler(),
  bodyParser.urlencoded({ extended: false })
)

const initApi = (req) => {
  return Prismic.createClient(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req,
    fetch
  })
}

const handleLinkResolver = (doc) => {
  if (doc.type === 'product') {
    return `/detail/${doc.slug}`
  }

  if (doc.type === 'collection') {
    return '/collections'
  }

  if (doc.type === 'about') {
    return '/about'
  }

  return '/'
}

app.use((req, res, next) => {
  res.locals.Link = handleLinkResolver
  res.locals.PrismicH = PrismicH
  res.locals.Numbers = index => {
    return index === 0 ? 'One' : index === 1 ? 'Two' : index === 2 ? 'Three' : index === 3 ? 'Four' : ''
  }

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
      api.query(Prismic.Predicates.at('document.type', 'collections'), {
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
    collection.data.products.forEach((item) => {
      assets.push(item.products_products.data.image.url)
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

app.get('/', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)

  res.render('pages/home', {
    ...defaults
  })
})

app.get('/about', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)

  res.render('pages/about', {
    ...defaults
  })
})

app.get('/collections', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)

  res.render('pages/collections', {
    ...defaults
  })
})

app.get('/detail/:uid', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)

  const product = await api.getByUID('product', req.params.uid, {
    fetchLinks: 'collections.title'
  })
  console.log(product)
  res.render('pages/detail', {
    ...defaults,
    product
  })
})

app.listen(port, () => {
  console.log(`listening port: ${port}`)
})
