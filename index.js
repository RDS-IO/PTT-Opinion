console.log("hello world");

var lala = require('./fetch.js');

lala.fetchArticleList("/bbs/Gossiping/index.html", "2", function(result){
    console.log(result);
});


/*  Test Fetch Article

lala.fetchArticle("/bbs/sex/M.1420551984.A.3D0.html", function(result){
    console.log(result);
});
*/

