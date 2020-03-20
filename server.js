const APIKEY = require('./api.js');
const EasyPost = require('@easypost/api');
const express = require('express');
var bodyParser = require('body-parser');

const api = new EasyPost(APIKEY);

var app = express();

app.use(express.static(__dirname + '/views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get("/", (req,res) => {
    res.render("index.html");
});

app.get("/image", (req,res) => {
    const toAddress = new api.Address({
        name: req.query.to_name,
        street1: req.query.to_street1,
        street2: req.query.to_street2,
        city: req.query.to_city,
        state: req.query.to_state,
        zip: req.query.to_zip,
        country: req.query.to_country,
        phone: req.query.to_phone
      });

      const fromAddress = new api.Address({
        name: req.query.from_name,
        street1: req.query.from_street1,
        street2: req.query.from_street2,
        city: req.query.from_city,
        state: req.query.from_state,
        country: req.query.from_country,
        zip: req.query.from_zip,
        phone: req.query.from_phone
      });

      const parcel = new api.Parcel({
        //convert string to number 
          length: Number(req.query.length),
          width: Number(req.query.width),
          height: Number(req.query.height),
          weight: Number(req.query.weight)
        });

      parcel.save().then(parc => {
          console.log(parc);
      }).catch((error) => {
          console.log(error);
      })
      fromAddress.save().then(addr => {
          console.log(addr);
      });

      toAddress.save().then(addr => {
          console.log(addr);
      });

      const shipment = new api.Shipment({
          to_address: toAddress,
          from_address: fromAddress,
          parcel: parcel
        });

      shipment.save().then((ship) => {
          api.Shipment.retrieve(ship.id).then((shipment) => {
              shipment.buy(shipment.lowestRate())
                  .then((ship) => res.redirect(ship.postage_label.label_url))
                  .catch((error) => {
                      console.log(error);
                  });
          }).catch((err) => {
              console.log("error");
              console.log(err);
          });
      }
      );
})

app.listen(8080,() => {
    console.log("listening on 8080");
})
