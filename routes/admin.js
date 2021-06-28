const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model('categorias');
require('../models/Postagem')
const Postagem = mongoose.model('postagens')


router.get('/', (req, res) => {
    res.render('admin/index')
});

router.get('/posts', (req, res) => {
    res.send("pagina principal de posts")
});

router.get('/categorias', (req, res) => {
    Categoria.find().sort('-date').lean().then((categorias) => {
        res.render('admin/categorias', {categorias: categorias})
    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao listar as categorias")
        res.redirect('/admin')
    })
});

router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategorias')
});

router.post('/categorias/nova', (req, res) => {

    let erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({text: 'Nome inválido.'})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({text: 'Slug inválido.'})
    }

    if(req.body.slug < 2) {
        erros.push({text: 'Nome do slug muito curto.'})
    }

    if(req.body.nome < 2) {
        erros.push({text: 'Nome da categoria muito curto.'})
    }

    if(erros.length > 0) {
        res.render('admin/addcategorias', {erros: erros})
    }else{

        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect('/admin/categorias')
        }).catch((err) => {
            console.log('Erro ao salvar categoria: ' + err)
            res.redirect('/admin')
        })
    }
});

router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render('admin/editcategorias', {categoria: categoria})
    }).catch((err) => {
        req.flash('error_msg', 'Essa categoria não existe.')
        res.redirect('/admin/categorias')
    })
});

/* router.post('/categorias/edit', (req, res) => {
    
    Categoria.findOne({_id: req.body.id}).then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug
        categoria.save().then(() => {
            req.flash('success_msg', 'Categoria editada com successo!')
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao editar categoria.')
            res.redirect('/admin/categorias')
        })
    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao editar a categoria")
        res.redirect('/admin/categorias')
    })
}) */

router.post("/categorias/edit", (req, res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {
        let erros = []

        if (!req.body.nome || typeof req.body.nome == null || req.body.nome == undefined) {
            erros.push({ text: "Nome invalido" })
        }
        if (!req.body.slug || typeof req.body.slug == null || req.body.slug == undefined) {
            erros.push({ text: "Slug invalido" })
        }
        if (req.body.nome.length < 2) {
            erros.push({ text: "Nome da categoria muito pequeno" })
        }
        if (req.body.slug.length < 2) {
            erros.push({ text: "Nome do slug muito pequeno" })
        }
        if (erros.length > 0) {
            Categoria.findOne({ _id: req.body.id }).lean().then((categoria) => {
                req.flash('error_msg', erros[0].text)
                res.redirect(`edit/${req.body.id}`)
            })
            
        } else {

            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso!")
                res.redirect("/admin/categorias")
            }).catch((err) => {
                req.flash("error_msg", "Erro ao salvar a edição da categoria")
                res.redirect("admin/categorias")
            })

        }
    }).catch((err) => {
        req.flash("error_msg", "Erro ao editar a categoria")
        req.redirect("/admin/categorias")
    })
});

router.post('/categorias/deletar', (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso!')
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash('erros_msg', 'Houve um erro ao deletar a categoria')
        res.redirect('/admin/categorias')
    })
});

router.get('/postagens', (req, res) => {

    Postagem.find().lean().populate("categoria").sort({date: 'desc'}).then((postagens) => {
        res.render('admin/postagens', { postagens: postagens })
    }).catch((err) => {
        req.flash('error-msg', 'Houve um erro ao listar as postagens')
        res.redirect('/admin')
    })
});

router.get('/postagens/add', (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('admin/addpostagens', { categorias: categorias })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar todas as postagens.')
        res.redirect('/admin')
    })
});

router.post('/postagens/nova', (req, res) => {

    var erros = []

    if(req.body.categoria == 0 ){
        erros.push({text: 'Categoria inválida, registre uma categoria valida.'})
    }

    if(erros.length > 0 ) {
        res.render('admin/addpostagens', {erros: erros})
    }else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar postagem')
            res.redirect("/admin/postagens")
        })
    }
});

router.get('/postagens/edit/:id', (req, res) => {

    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {

        Categoria.find().lean().then((categorias) => {
            res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar as categorias.')
            res.redirect('/admin/postagens')
        })

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulario de edição.')
        res.redirect("/admin/postagens")
    })
});

router.post('/postagens/edit', (req, res) => {

    let erros = []

    if(!req.body.categoria) {
        erros.push({text: 'Selecione uma categoria.'})
    }

    if (erros.length > 0) {
        Postagem.findOne({ _id: req.body.id }).lean().then((postagem) => {
            req.flash('error_msg', erros[0].text)
            res.redirect(`edit/${req.body.id}`)
        })
    }

    Postagem.findOne({_id: req.body.id}).then((postagem) => {
        postagem.titulo = req.body.titulo,
        postagem.slug = req.body.slug,
        postagem.descricao = req.body.descricao,
        postagem.conteudo = req.body.conteudo,
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash('success_msg', 'Postagem editada com sucesso.')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            console.log(err)
            req.flash('error_msg', 'Houve um erro ao salvar postagem.')
            res.redirect('/admin/postagens')
        });

    }).catch((err) => {
        console.log(err)
        req.flash('error_msg', 'Houve um erro ao editar a postagem.')
        res.redirect('/admin/postagens')
    })
});

router.get('/postagens/delete/:id' ,(req, res) => {
    Postagem.deleteOne({_id: req.params.id}).then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso.')
        res.redirect('/admin/postagens')
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar postagem.')
        res.redirect('/admin/postagens')
    })
});

module.exports = router;