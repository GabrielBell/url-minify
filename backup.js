var express = require('express')
var app = express();
var path= require('path');
var port= process.env.PORT || 8080;
var mongoose = require('mongoose');
var uri = 'mongodb://localhost:27017/url_db'
var Link = require('./models/link');

mongoose.connect(uri)
var uniqueIDs= [];


var db= mongoose.connection;
db.on('open', function(){ console.log('connection established')})
db.on('error', function(){ console.log('unable to connect to mongodb')});


//ROUTES FOR OUR API
var router= express.Router();

router.use(function(req,res, next){
	console.log("something happening");
	console.log('request-url:', req.url);
	console.log(next.name);
	next();
})

router.route('/:short_id?')

.get(function(req,res){
	if(req.params.short_id){
		//perform lookup and redirect to original url
	}else{
		res.sendFile(path.join(__dirname, '/index.html'));
	}
})



router.route('/new/https://:link_name')

.get(function(req,res){
	console.log("i hit the second endpoint");
	res.send("found it");
	//validate req.params.link_name
	var original_url= req.params.link_name;
	var pattern= /^((https?):\/\/)?([w|W]{3}\.)+[a-zA-Z0-9\-\.]{3,}\.[a-zA-Z]{2,4}([.:]?[\w]+)?$/
	var matches= pattern.exec(original_url)
	if(!matches){ 
		res.send("invalid url"+original_url)
	}else{
		original_url= matches[0];
		//lets see if our database contains this url
		Link.findOne({'original_url': original_url}, 'original_url', 'short_url', function(err, link){
			if(err){
				//couldnt find so add
				var newLink = new Link({"original_url": original_url, "short_url":uniqueIDs.pop()})
				newLink.save(function(err,doc){
					res.json(doc);
				})
			}else{
				res.json(link)
			}

		})


	}

	

})
router.route('*').get(function(req,res){
	res.send('OOPS 404 ', req.url)
})

 
app.use('/api', router)

app.listen(port, function(){
	for (var i=0,t=10000;i<40;i++){
	uniqueIDs.push(Math.round(Math.random() *t));
}
	console.log("listening on port "+ port)
	console.log("succesfully created id array with ", uniqueIDs.length, " elements")
});
