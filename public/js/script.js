$(document).ready(function() {

    // alert("Hello! I am an alert box!!");

    Handlebars.templates = Handlebars.templates || {};

    var templates = document.querySelectorAll('template');

    Array.prototype.slice.call(templates).forEach(function(tmpl) {
        Handlebars.templates[tmpl.id] = Handlebars.compile(tmpl.innerHTML.replace(/{{&gt;/g, '{{>'));
    });




    //         Router

    var Router = Backbone.Router.extend({
        routes: {
            'home': 'home',
            'image/:imageId': 'image',
            'upload': 'upload'
        },
        home: function() {
            console.log('home');
            new HomeView({
                model: new HomeModel,
                el: '#main'
            });
        },

        image: function(imageId) {
            console.log('image', imageId);
            new ImageView({
                model: new ImageModel({imageId:imageId}),
                el: '#main'
            });
        },

        upload: function() {
            console.log('upload');
            new UploadView({
                model: new UploadModel,
                el: '#main'
            });
        },

    });





    //           Models


    var HomeModel = Backbone.Model.extend({
        initialize: function() {
            this.fetch();
        },
        url: '/getHomeImages'
    });



    var ImageModel = Backbone.Model.extend({
        initialize: function(props) {
            this.url = "/image/" + props.imageId;
            this.fetch();
        }
    });



    var UploadModel = Backbone.Model.extend({
        initialize: function() {
            this.fetch();
        },
        url: '/upload'
    });




    //           Views


    var HomeView = Backbone.View.extend({
        initialize: function() {
            var view = this;
            this.model.on('change', function() {
                view.render();
            });
        },
        render: function() {
            var html = Handlebars.templates.home(this.model.toJSON());
            this.$el.html(html);
        },

    });



    var ImageView = Backbone.View.extend({
        initialize: function() {
            var view = this;
            this.model.on('change', function() {
                view.render();
            });
        },
        render: function() {
            var html = Handlebars.templates.image(this.model.toJSON());
            this.$el.html(html);
        },

        events: {
            'click #comment-button': function() {

                $.ajax({
                    url: '/comment',
                    method: 'POST',
                    data: {
                        image_id: window.location.hash.split("/")[1],
                        username: $('#image-username').val(),
                        comment: $('#image-comment').val()
                    },
                    complete: function () {
                        window.location.reload();
                    }
                });
            }
        }
    });


    var UploadView = Backbone.View.extend({
        initialize: function() {
            var view = this;
            view.render();

        },
        render: function() {
            var html = Handlebars.templates.upload(this.model.toJSON());
            this.$el.html(html);
        },
        events: {
            "click #upload-button": "submit",
        },
        submit:
        function() {
            var file = $('input[type="file"]').get(0).files[0];
            var username = $("#username").val();
            var title = $("#title").val();
            var description = $("#description").val();

            var formData = new FormData();

            formData.append('file', file);
            formData.append('username', username);
            formData.append('title', title);
            formData.append('description', description);

            $.ajax({
                url: '/upload',
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false
            });
        }
    });


    var router = new Router;
    Backbone.history.start();



});
