const express = require('express');
const handlebars = require('express-handlebars');
const admin = require('./routes/admin');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
require('./models/Postagem');
const Postagem = mongoose.model('postagens');

//Session
app.use(session({
    secret: 'qualquerSenhaAquiServe',
    resave: true,
    saveUninitialized: true
}));

//Flash
app.use(flash());  //<== tem que ficar abaixo da session

//Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next()
});

//Handlebars
app.engine('handlebars', handlebars({ extname: '.handlebars' }));
app.set('view engine', 'handlebars');

//BodyParser
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//Static Files
app.use(express.static(path.join(__dirname, 'public')));

//Mongoose
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/movies-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Conectado ao BD")
}).catch((err) => {
    console.log("Erro ao se conectar ao BD: " + err)
});

//Rotas
app.get('/', (req, res) => {
    Postagem.find().lean().populate('categoria').sort({date: 'desc'}).then((postagens) => {
        res.render('index', {postagens: postagens})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno.')
        res.redirect('/404')
    })
});

app.get('/404', (req, res) => {
    res.send('erro 404!')
});

app.get('/postagens/:slug', (req, res) => {
    Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
        if(postagem) {
            res.render('postagem/index', {postagem: postagem})
        }else {
            req.flash('error_msg', 'Esta postagem não existe.')
            res.redirect('/')
        }
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno.')
        res.redirect('/')
    })
});

app.get('/posts', (req, res) => {
    res.send('LISTA DE POSTS')
});

app.use('/admin', admin);

//Abrir Servidor
app.listen(8081, () => {
    console.log("Servidor online, port 8081")
});