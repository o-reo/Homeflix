const fetch = require('node-fetch')
const cheerio = require('cheerio')
const endpoints = require('./endpoints')

class Anime {
  /**
   * constructor, instantiates the object
   * @param {string} prefix - it uses this in front of the request, you could use this to prevent cors errors in browsers
   * @param {string} url - the url to make request to, default: http://animepill.com
   */
  constructor(prefix = '', url) {
    this.base = url || 'http://animepill.com'
    this.prefix = prefix
  }
  // options can look like this
  // {limit: 50}
  _genOptions(options) {
    let i = 0
    let res = ''
    for (let opt in options) {
      if (i === 0) {
        res += `?${opt}=${options[opt]}`
      } else {
        res += `&${opt}=${options[opt]}`
      }
      i++
    }
    return res
  }

  _parsePathParam(path, param) {
    const reg = /{(.*?)}/g // get the stuff between the {}
    const arr = path.match(reg) || [] // array with the results of the regexp
    for (var i = 0; i < arr.length; i++) {
      let par = param[arr[i].substr(1, arr[i].length - 2)]
      if (par) {
        path = path.replace(arr[i], par)
      } else {
        path = path.replace(arr[i], '')
      }
    }

    path = path.replace(/\/\/+/g, '/') // remove double slashes
    return path
  }

  _get(path, options, param) {
    if (
      path.search(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
      ) != -1
    ) {
      // url is passed
      return fetch(path).then(res => res.text())
    }
    return fetch(
      this.prefix +
        this.base +
        this._parsePathParam(path, param) +
        this._genOptions(options)
    ).then(res => res.text())
  }

  _getJson(path, options, param) {
    return fetch(
      this.prefix +
        this.base +
        this._parsePathParam(path, param) +
        this._genOptions(options)
    ).then(res => res.json())
  }

  /**
   * searches for anime
   * @param {string} query - what you are searching for
   * @returns {Promise<Object[]>} an array with results
   */
  search(query) {
    return this._getJson(endpoints.search, { q: query }).then(res => {
      return new Promise((resolve, reject) => {
        const output = []
        for (let item of res.data) {
          output.push(
            Object.assign({}, item, {
              getEpisodes: () => this.getEpisodes(item.slug)
            })
          )
        }
        resolve(output)
      })
    })
  }

  /**
   * gets episodes of an anime
   * @param {string} slug - the slug of an anime you can get a slug in a search
   * @returns {Promise<Object>} an object with all the episodes
   */
  getEpisodes(slug) {
    return this._get(endpoints.eps, {}, { slug: slug }).then(html => {
      return new Promise((resolve, reject) => {
        try {
          const $ = cheerio.load(html)
          const output = {}
          $('.anime__episodes')
            .children()
            .each((i, elem) => {
              elem = $(elem)
              const titles = elem
                .text()
                .trim()
                .split('"')
                .map(x => x.trim())
                .filter(x => x != '')
              const href = elem.find('a').attr('href')
              let episode = titles[0]
                .split(/([0-9]+)/)
                .filter(x => x != '')
                .filter(x => !isNaN(x))
                .map(x => parseInt(x))
              episode = episode[episode.length - 1]
              output[episode] = {
                titles: titles,
                href: href,
                episode: episode,
                slug: slug,
                getEpisode: () => this.getEpisode(href)
              }
            })
          resolve(output)
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  /**
   * searches for anime
   * @param {string} slug - the slug of an anime you can get a slug in a search
   * @returns {Promise<Object[]>} an array with the episode mp4 uri
   */
  getEpisode(slug, ep) {
    let endpoint = endpoints.ep
    if (
      slug.search(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
      ) != -1
    ) {
      // url is passed
      endpoint = slug
    }

    return this._get(endpoint, {}, { slug: slug, episode: ep }).then(html => {
      const $ = cheerio.load(html)
      return fetch($('#video-iframe').attr('src'))
        .then(data => data.text())
        .then(html => {
          return new Promise((resolve, reject) => {
            try {
              const searchPart = "<script type='text/javascript'>eval("
              html = html.substring(
                html.indexOf(searchPart) + searchPart.length - 1,
                html.length
              )
              html = html.substring(0, html.indexOf('</script>'))
              html = eval(html)
              html = html.substring(
                html.indexOf('myVideo.src(') + 'myVideo.src('.length,
                html.length - 2
              )
              resolve(eval(html))
            } catch (e) {
              reject(e)
            }
          })
        })
    })
  }
}

module.exports = Anime
