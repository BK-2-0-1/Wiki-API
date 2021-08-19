// подключение
const express = require("express");
const app = express();

const port = 3000;

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});


// ejs
app.set('view engine', 'ejs');


// ▼▼▼▼ body-parser ▼▼▼▼, теперь его не нужно импортировать отдельно, достаточно написать такой код:
app.use(express.urlencoded({
    extended: true
}));


// ▼▼▼▼ подключил css ▼▼▼▼
app.use(express.static(__dirname + '/public'));

// mongoose ВАЖНО ПОСЛЕ 27017 УКАЗЫВАЕТСЯ НАЗВАНИЕ DATABASE. В МОЕМ СЛУЧАЕ БЫЛО test, далее я изменю его на todolistDB. РАНЕЕ ИЗ ЗА ЭТОГО Я ЖЕСТКО ЗАТУПИЛ И НЕ МОГ ПОНЯТЬ КУДА СОХРАНЯЮТСЯ ЛЮДИ(person). А ОКАЗЫВАЕТСЯ ОНИ СОХРАНЯЛИСЬ В БАЗУ ФРУКТОВ(fruitsDB), и внутри fruitsDB уже были people. то есть это была не отдельная база.
// А ИМЕННО БАЗА ИЗНАЧАЛЬНО УКАЗЫВАЕТСЯ ЗДЕСЬ
const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/wikiDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// articles collections
const articleSchema = new mongoose.Schema({
    title: String,
    content: String
});

const Article = mongoose.model('Article', articleSchema);

// ========================================== Request Targetting all Articles =======================================
// route (get, post, delete)
// рефакторинг кода и создание чейна
app.route('articles')

    .get((req, res) => {
        Article.find((err, foundArticles) => {
            if (!err) {
                res.send(foundArticles);
            } else {
                res.send(err);
            }
        });
    })

    .post((req, res) => {
        console.log(req.body.title);
        console.log(req.body.content);

        const newArticle = new Article({
            title: req.body.title,
            content: req.body.content
        });

        newArticle.save((err) => {
            if (!err) {
                res.send("Successfully added a new article");
            } else {
                res.send(err);
            }
        });
    })

    .delete((req, res) => {
        Article.deleteMany((err) => {
            if (!err) {
                res.send("All deleted!");
            } else {
                res.send(err);
            }
        });
    });


// ========================================== Request Targetting a Specific Article =======================================
app.route("/articles/:articleTitle")

    .get((req, res) => {
        Article.findOne({
            title: req.params.articleTitle
        }, (err, foundArticle) => {
            if (foundArticle) {
                res.send(foundArticle);
            } else {
                res.send("No matches found.");
            }
        });
    })

    .put((req, res) => {
        Article.updateOne({
                title: req.params.articleTitle
            }, {
                title: req.body.title,
                content: req.body.content
            }, {
                overwrite: true
            },
            (err) => {
                if (!err) {
                    res.send("Successfully updated the selected article");
                }
            }
        );
    })

    .patch((req, res) => {
        Article.updateOne({
                title: req.params.articleTitle
            }, {
                $set: req.body
            },
            (err) => {
                if (!err) {
                    res.send("Successfully updated article");
                } else {
                    res.send(err);
                }
            });
    })

    .delete((req, res) => {
        Article.deleteOne({
                title: req.params.articleTitle
            },
            (err) => {
                if (!err) {
                    res.send("Successfully deleted article");
                } else {
                    res.send(err);
                }
            }
        );
    });