var request = require("request"),
  zlib = require("zlib"),
  cheerio = require("cheerio"),
  events = require("events"),
  sys = require("sys");
var fs = require("fs");

var CrawlerInterno = function (options) {
  if (options.url) {
    this.url = options.url;
  } else {
    this.category = options.category;
    this.search = options.search;
    this.page = options.page || 1;
    this.pages = options.pages || -1;
  }
};

sys.inherits(CrawlerInterno, events.EventEmitter);

CrawlerInterno.prototype.start = function () {
  this.scrapPage();
};

CrawlerInterno.prototype.single = function (page) {
  this.page = page || this.page;
  this.scrapPage(true);
};

CrawlerInterno.prototype.prepURL = function () {
  return this.url;
};

CrawlerInterno.prototype.scrapPage = function (single) {
  var url = this.prepURL();

  console.log("Fetching " + url);

  var options = {
    method: "GET",
    url: url,
    headers: {
      "Accept-Encoding": "gzip",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36",
    },
  };

  var response = request(options);

  this.gunzipJSON(response, function () {});
};

CrawlerInterno.prototype.gunzipJSON = function (response, cb) {
  var gunzip = zlib.createGunzip();
  var bulk = "";

  gunzip.on("data", function (data) {
    bulk += data.toString();
  });

  gunzip.on("end", function () {
    $ = cheerio.load(bulk);
    let text = "";

    let result = $("script").get();

    result.forEach(function (data) {
      if (data.attribs.id) {
        const dados = JSON.parse(data.attribs["data-json"]);

        if (dados.ad.phone.phone != "") {
          console.log(dados.ad.phone);
          text += dados.ad.user.name + "," + dados.ad.phone.phone + "\n";
        }
      }
    });
    fs.appendFile(`page.txt`, text, function (erro) {
      if (erro) {
        throw erro;
      }
    });
    cb();
  });

  response.pipe(gunzip);
};

module.exports = CrawlerInterno;
