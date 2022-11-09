require("dotenv").config();
const express = require('express');
const { Pool } = require('pg');
const port = 3000;

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
})

pool.connect();

const getPhotos = async (reviewId) => {
  let queryString = 'SELECT id, url FROM photos WHERE review_id=' + reviewId;
  const getPics = await pool.query(queryString);
  Promise.all(getPics.rows);
  return getPics.rows;
};

const getReviews = (req, res) => {

  // let queryString = 'SELECT review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness FROM reviews WHERE product_id=' + req.query.product_id + ' LIMIT 10';

  let queryString = 'SELECT * FROM (SELECT  r.review_id, r.rating, r.summary, r.recommend, r.response, r.body, to_timestamp(r.date/1000), r.reviewer_name, r.helpfulness, (SELECT json_agg(p) FROM (SELECT id, url FROM photos WHERE review_id = r.review_id) p) as photos FROM reviews as r WHERE product_id=' + req.query.product_id + ' AND r.reported=false) x;'

  return pool.query(queryString)
    .then(results => {
      return results.rows;
    })
    .catch(err => {
      console.log(err, ': error inside get reviews db.js')
    })
}

const getMetaData = (req, res) => {
  let productId = req.query.product_id;
  let queryString = `SELECT json_build_object
  (
    'product_id', ${productId},
    'ratings',
      (select json_object_agg(rating, count) as rating_details
        from (
        SELECT rating, COUNT(rating) FROM reviews WHERE product_id =${productId} GROUP BY rating
        ) as t),
    'recommend',
      (select json_object_agg(recommend, count) as recomment_count
        from(
          SELECT recommend, COUNT(recommend) FROM reviews where product_id=${productId} GROUP BY recommend)
          as r),
    'characteristics',
      (
      select (
        json_object_agg(
          name, jsonb_build_object(
            'id', id,
            'value', avg
          )
    )
      )
      FROM (SELECT char.name, char.id, avg(charreview.value)
        FROM characteristics
        AS char
        INNER JOIN characteristicreviews
        AS charreview
        ON char.id = charreview.characteristic_id
        WHERE char.product_id=${productId}
        GROUP BY char.id)
        as t

  )
  );
  `
  return pool.query(queryString)
    .then(results => {
      console.log(results.rows);
      return results.rows[0].json_build_object;
    })
    .catch(err => {
      console.log('there was an error in the metadata query');
      return err;
    })
}

const postReview = (req, res) => {
  const time = new Date().valueOf()

  const { product_id, rating, summary, body, recommend, name, email, photos, characteristics } = req.body;
  // console.log(`${product_id}, ${rating}, ${summary}, ${body}, ${recommend}, ${name}, ${email}, ${time}, ${photos}, ${characteristics}`);

  let queryString = `
    WITH new_review as (
      INSERT INTO reviews
      (product_id, rating, summary, body, recommend, reviewer_name,  reviewer_email, date)
      VALUES
      (${product_id}, ${rating}, '${summary}', '${body}', ${recommend}, '${name}', '${email}', ${time})
      returning review_id
    ), photo_urls as (
       select * from json_array_elements('${JSON.stringify(photos)}') as p
    ), photo_insert as (
    insert into photos (url, review_id)
    select * from photo_urls cross join (select * from new_review) as t
    ), char_val as (
    select * from (select key::int, value::text::int from json_each('${JSON.stringify(characteristics)}')) as f cross join (select * from new_review) as z
    )
  select * from char_val as m;
`

  return pool.query(queryString)
    .then(results => {
      console.log(results.rows)
      return results.rows;
    })
    .catch(err => {
      console.log(err, '< err inside postRevew')
    })
}

const markReviewHelpful = (req, res) => {
  let id = req.params.reviewId;
  let queryString = `update reviews set helpfulness=reviews.helpfulness+1 where review_id=${id}`;
  return pool.query(queryString)
    .then(results => {
      return results.rows;
    })
    .catch(err=> {
      console.log(err, 'err in markReviewHelpful');
      return err;
    })
}

const reportReview = (req, res) => {
  let id = req.params.reviewId;
  let queryString = `update reviews set reported=true where review_id=${id}`;
  return pool.query(queryString)
    .then(results => {
      return results.rows;
    })
    .catch(err=> {
      console.log(err, 'err in reportedReview');
      return err;
    })
}

module.exports = {
  getReviews,
  getMetaData,
  postReview,
  markReviewHelpful,
  reportReview
};



