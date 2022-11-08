const getAnswers = async (req, res) => {
  const getAnswers = await pool.query(`select answer_id, body, date, answerer_name, helpfulness from answers where question_id = ${req.params.question_id} limit ${req.query.page*req.query.count};`);

  var answers = getAnswers.rows;
  if (answers.length > 0) {
    answers.forEach((answer) => {
      answer.date = new Date(Number(answer.date)).toISOString();
    })
    var promises = answers.map((answer) => {
      return getImages(answer.answer_id)
        .then((response) => {
          answer.photos = response;
          return answer;
        });
    });
    Promise.all(promises)
      .then((result) => {
        res.json({"question": req.params.question_id.toString(), "page": Number(req.query.page), "count": Number(req.query.count), "results": result});
      });
  }
};

const getImages = async (aID) => {
  const getPhotos = await pool.query(`select id, url from answers_photo where answer_id = ${aID};`);
  return getPhotos.rows;
}