const express = require('express');
const router = express.Router();
const path = require('path');
const pool = require('../db');
const mysql = require('mysql');
const gravatar = require('gravatar-api');

router.use((req, res, next) => {
  if(req.session.authenticated && req.session.isUser) {
    let options = {
      email: req.session.name,
      parameters: { "size": "200"}
    }
    req.avatar = gravatar.imageUrl(options);
  }
  next();
});

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {auth: req.session.authenticated, avatar: req.avatar});
});

router.get('/about', (req, res, next) => {
  res.render('about', {auth: req.session.authenticated, avatar: req.avatar});
});

router.get('/listing', (req, res, next) => {
  res.render('listing', {auth: req.session.authenticated, avatar: req.avatar});
});

router.get('/contact', (req, res, next) => {
  res.render('contact', {auth: req.session.authenticated, avatar: req.avatar});
});

router.get('/profile', (req,res,next) => {
  res.render('profile', {auth: req.session.authenticated, avatar: req.avatar});
});

router.get('/transaction/:id', (req,res,next) => {
  if(req.session.authenticated == true){
    if(req.session.isUser == true){
      let user_id = req.session.client_id;
      let trans_id = req.params.id;
      pool.getConnection((err,con) => {
        if(err) throw err;
        con.query('SELECT client_id, points FROM transaction WHERE trans_id=' + mysql.escape(trans_id), (err, results) => {
          con.release();
          if(err) throw err;
          if(results[0].client_id == null){
            console.log("NO HABIA ID");
            con.query('UPDATE transaction SET client_id=' + mysql.escape(user_id) + ' WHERE trans_id=' + mysql.escape(trans_id), (err, answer) => {
              con.release();
              if(err) throw err;
            console.log(answer);
            });
          } else {
            console.log("YA HAY ID");
            next();
          }
        });
      });
      //res.render('transaction', {auth: req.session.authenticated, avatar: req.avatar, login: ""});
    } else {
      res.render('index', {auth: req.session.authenticated, avatar: req.avatar});
    }
  } else {
    res.render('transaction', {auth: req.session.authenticated, avatar: req.avatar, login: "/js/loginForced.js"});
  }
  //let trans_id = req.params.id;
  //let user_id = req.session.client_id;
  //pool.getConnection((err, con) => {
  //  con.query('SELECT ')
  //});

});

router.get('/negocio/:id', (req, res, next) => {
  let shop_id = req.params.id;
  pool.getConnection((err, con) => {
    if (err) throw err;
    con.query('SELECT shop_name, direction, c.display_name AS category, s.latitude, s.longitude, s.picture FROM shop s JOIN category c ON s.category = c.cat_id WHERE s.shop_id =' + mysql.escape(shop_id), (err, results) => {
      con.release();
      if(err) throw err;
      if(results.length != 0) {
        res.render('negocio', { image: results[0].picture, name: results[0].shop_name, direction: results[0].direction, category: results[0].category, lat: results[0].latitude, lgt: results[0].longitude, auth: req.session.authenticated, avatar: req.avatar });
      }else{
        next();
      }
    });
  });
});


module.exports = router;
