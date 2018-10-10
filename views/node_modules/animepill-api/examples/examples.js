const Anime = require("../");
const client = new Anime();

client.getEpisodes("kara-no-kyoukai-5-mujun-rasen")
  .then(eps => eps['5'].getEpisode())
  .then(vids => console.log(vids));

client.search("bleach")
  .then(res => {
    return res.find(x => x.type === "TV")
      .getEpisodes();
  })
  .then(eps => console.log(eps));

client.getEpisode("bleach", 5)
  .then(vids => console.log(vids));