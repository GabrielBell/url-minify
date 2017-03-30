var express = require('express')
var app = express();
var path= require('path');
var port= process.env.PORT || 8080;
var mongoose = require('mongoose');
var uri = 'mongodb://localhost:27017/url_db'
var Link = require('./models/link');

mongoose.connect(uri)



var db= mongoose.connection;
db.on('open', function(){ console.log('connection established')})
db.on('error', function(){ console.log('unable to connect to mongodb')});


//ROUTES FOR OUR API

app.param('short_url', function(req,res,next,short_url){
	
	if(/^\d+$/.test(short_url)){ req.short= short_url;	}
	next();
})

app.get('/:short_url?',function(req,res){
	//get request with a digit suffix means perform a lookup and redirect
	if(typeof(req.short) != 'undefined'){	
		
		Link.findOne({'short_url': req.short }, {'_id':false,'original_url':true, 'short_url':true}, function(err, link){
			if(err) { res.send(err); }
			if(!link) {
				console.log("invalid")
				res.send("that shortened url doesn't exist");
			}else{
				res.redirect(link.original_url);
			}
			
		})
	}
	//otherwise its a get request for our homepage
	else{	
		res.sendFile(path.join(__dirname, '/index.html'));

}	
		
})



app.get('/new/*', function(req,res){
	//var shortened= uniqueIDs.pop();
	var shortened= new Date().getTime();
	//validate req.params.link_name
	var original_url= req.url.replace(/\/new\//g, '');
	var pattern= /^((https?):\/\/)?([w|W]{3}\.)+[a-zA-Z0-9\-\.]{3,}\.[a-zA-Z]{2,4}([.:]?[\w]+\/?)?$/
	var matches= pattern.exec(original_url)
	if(!matches){ 
		res.send("invalid url "+original_url);
	}else{
		//see if our database contains this url
		//if it doesn't make sure shortened isn't in database
		Link.findOne({'original_url': original_url}, {'_id':false,'original_url':true, 'short_url':true}, function(err, link){
			if(err){ res.send(err)	}
			if(!link){
				console.log("this url is not stored yet")
				var newLink = new Link({"original_url": original_url, "short_url":shortened})
				console.log("created new link:", newLink);
				newLink.save(function(err,doc){
					if (err) throw err;
					console.log("save succesfull");
					res.json({"original_url":doc.original_url,"short_url": doc.short_url});
				});
			}else{
				console.log("this link already exists in db");
				console.log(link.short_url);
				res.json(link);
			}
			
				
		})
	}
				
		
})

app.get('*', function(req,res){
	res.send('oops 404')
})


 


app.listen(port, function(){ console.log("listening on port "+ port) });
