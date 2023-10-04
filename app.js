const express = require('express');
const app = express();
const { URL } = require('url');
const _ = require('lodash');

const myurl = new URL("https://intent-kit-16.hasura.app/api/rest/blogs");

const options = {
    method: 'GET',
    headers: {
        'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
    }
};

let response_obj = {};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
    _.memoize(async (req, res, next) => {
        await fetch(myurl, options)
            .then(response => response.json())
            .then(response => response_obj = response)
            .catch(err => console.error(err));

        next();
    })
);


app.get("/api/blog-stats", (req, res) => {
    const no_of_blogs = _.size(response_obj.blogs);
    let max = 0;
    let word = [];
    let titles = [];
    _.forEach(response_obj.blogs, (element) => {
        titles.push(element.title);
        let word_length = _.size(_.words(element.title));
        if (word_length > max) {
            max = word_length;
            word = _.words(element.title);
        }
    });

    let count = 0;

    _.forEach(titles, (title) => {
        if (_.includes(title, "Privacy")) {
            count++;
        };
    });

    let title = '';
    _.forEach(word, (w) => {
        title += `${w} `;
    })

    const obj = {
        number_of_blogs: no_of_blogs,
        longest_title: title,
        titles_with_privacy: count,
        unique_titles: _.uniq(titles)
    }

    res.send(obj);
});

app.get('/api/blog-search', (req, res) => {
    let results = [];
    _.forEach(response_obj.blogs, (blog) => {
        if(_.includes(blog.title, req.query.query)){
            results.push(blog);
        }
    });

    if(results.length == 0){
        res.send("No matching results found");
    }
    res.send(results);
});

app.listen(3000, () => {
    console.log("listening on port 3000")
})
