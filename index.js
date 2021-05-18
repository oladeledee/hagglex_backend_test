
const express = require('express');
const    fs = require('fs');
const    path = require('path');
const    request = require('request');
const    cheerio = require('cheerio');
const    app = express();
const    bodyParser = require('body-parser');
const   env  = process.env;

//support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({extended: true}));

//tell express that we want to use the frontend folder for our static assets
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/frontend/index.html'))
);
app.post('/scrape', function(req, res){
    res.setHeader('Content-Type', 'application/json');

    //make a new request to the URL provided in the HTTP POST request
    request(req.body.url, function (error, response, responseHtml) {
        
        // error
        if (error) {
            res.send({error: 'Error!! enter a Url or refresh page'});
            return;
        }

        //create the cheerio object
      const  resObj = {};
      //set a reference to the document that came back
      const  ch_ = cheerio.load(responseHtml);
     //create a reference to the meta elements
      const  ch_title =ch_('head title').text();
      const  ch_desc = ch_('meta[name="description"]').attr('content');
      const  ch_kwd = ch_('meta[name="keywords"]').attr('content');
      const  ch_ogTitle = ch_('meta[property="og:title"]').attr('content');
      const  ch_ogImage = ch_('meta[property="og:image"]').attr('content');
      const  ch_ogkeywords = ch_('meta[property="og:keywords"]').attr('content');
      const  ch_images = ch_('img');

        if (ch_title) {
            resObj.title = ch_title;
        }

        if (ch_desc) {
            resObj.description = ch_desc;
        }

        if (ch_kwd) {
            resObj.keywords = ch_kwd;
        }

        if (ch_ogImage && ch_ogImage.length){
            resObj.ogImage = ch_ogImage;
        }

        if (ch_ogTitle && ch_ogTitle.length){
            resObj.ogTitle = ch_ogTitle;
        }

        if (ch_ogkeywords && ch_ogkeywords.length){
            resObj.ogkeywords = ch_ogkeywords;
        }

        if (ch_images && ch_images.length){
            resObj.images = [];

            for (var i = 0; i < ch_images.length; i++) {
                resObj.images.push(ch_(ch_images[i]).attr('src'));
            }
        }

        //send the response
        res.end(JSON.stringify(resObj));
    }) ;
});

const PORT =process.env.PORT || 3000;
//listen for an HTTP request
app.listen(PORT, env.NODE_IP || 'localhost');

//server is running
console.log(' listening on http://localhost:3000');
