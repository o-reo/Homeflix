# animepill-api
scrapes videos from animepill

## installation
``npm install --save animepill-api``

## usage
```javascript
const Anime = require("animepill-api");
const client = new Anime();

client.getEpisodes("bleach")
  .then(eps => eps[3].getEpisode())
  .then(vids => console.log(vids));

client.search("bleach")
  .then(res => {
    return res.find(x => x.type === "TV")
      .getEpisodes();
  })
  .then(eps => console.log(eps));
```

# docs
<a name="Anime"></a>

## Anime
**Kind**: global class

* [Anime](#Anime)
    * [new Anime(prefix, url)](#new_Anime_new)
    * [.search(query)](#Anime+search) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
    * [.getEpisodes(slug)](#Anime+getEpisodes) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.getEpisode(slug)](#Anime+getEpisode) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>

<a name="new_Anime_new"></a>

### new Anime(prefix, url)
constructor, instantiates the object


| Param | Type | Description |
| --- | --- | --- |
| prefix | <code>string</code> | it uses this in front of the request, you could use this to prevent cors errors in browsers |
| url | <code>string</code> | the url to make request to, default: http://animepill.com |

<a name="Anime+search"></a>

### anime.search(query) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
searches for anime

**Kind**: instance method of [<code>Anime</code>](#Anime)
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - an array with results

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | what you are searching for |

<a name="Anime+getEpisodes"></a>

### anime.getEpisodes(slug) ⇒ <code>Promise.&lt;Object&gt;</code>
gets episodes of an anime

**Kind**: instance method of [<code>Anime</code>](#Anime)
**Returns**: <code>Promise.&lt;Object&gt;</code> - an object with all the episodes

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | the slug of an anime you can get a slug in a search |

<a name="Anime+getEpisode"></a>

### anime.getEpisode(slug) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
searches for anime

**Kind**: instance method of [<code>Anime</code>](#Anime)
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - an array with the episode mp4 uri

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | the slug of an anime you can get a slug in a search |