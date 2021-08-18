var request = require("request"),
  zlib = require("zlib"),
  cheerio = require("cheerio"),
  events = require("events"),
  sys = require("sys");
var CrawlerInterno = require("./crawlerInterno");

var Crawler = function (options) {
  if (options.url) {
    this.url = options.url;
  } else {
    this.category = options.category;
    this.search = options.search;
    this.page = options.page || 1;
    this.pages = options.pages || -1;
  }
};

sys.inherits(Crawler, events.EventEmitter);

Crawler.prototype.start = function () {
  this.scrapPage();
};

Crawler.prototype.single = function (page) {
  this.page = page || this.page;
  this.scrapPage(true);
};

Crawler.prototype.prepURL = function () {
  var url = this.url || "http://se.olx.com.br/";

  if (!this.url) {
    if (this.search) {
      url = "http://se.olx.com.br/";
    }

    url += this.category + "?o=" + this.page + "&q=" + (this.search || "");
  } else {
    url += "?o=" + this.page;
  }

  return url;
};

Crawler.prototype.scrapPage = function (single) {
  var self = this;

  var url = this.prepURL();

  // console.log("Fetching " + url);

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

  this.gunzipJSON(response, function () {
    self.emit("page", {
      page: self.page,
    });
    if (!single && (self.pages - self.page >= 0 || self.pages === -1)) {
      setTimeout(function () {
        self.page++;
        self.scrapPage();
      }, 1000);
    }
  });
};

Crawler.prototype.gunzipJSON = function (response, cb) {
  var gunzip = zlib.createGunzip();
  var bulk = "";

  gunzip.on("data", function (data) {
    bulk += data.toString();
  });

  gunzip.on("end", function () {
    $ = cheerio.load(bulk);
    $("#ad-list").each(function () {
      this.children.forEach(function (child) {
        if (typeof child.children[0]?.attribs.href != "undefined") {
          var opts = {
            url: child.children[0].attribs.href,
            page: this.page,
          };

          var olx = new CrawlerInterno(opts);
          olx.start();
        }
      });
    });
    cb();
  });

  response.pipe(gunzip);
};

module.exports = Crawler;
