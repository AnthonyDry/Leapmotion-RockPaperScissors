/**
 * @author Anthony Dry
 */

(function() {
  var Game = {};
  window.Game = Game;
    // All navigation that is relative should be passed through the navigate
  // method, to be processed by the router.  If the link has a data-bypass
  // attribute, bypass the delegation completely.	
	//help function for getting relative template from Mustache.
  var PALME = "";
  var FINGERS = '';
  var template = function(name) {
    return Mustache.compile($('#'+name+'-template').html());
  };
  //LEAP TO BE Handled in Backbone,
  var SetHandMovement = function(hMove){
  	PALME = hMove;
  	//console.log(PALME);
  }
  var SetFingers = function(fin){
  	FINGERS = fin;
  	//console.log(PALME);
  }
  var GetHandMovement = function(){
  	return PALME;
  }
  var GetFingers = function(){
  	return FINGERS;
  }
  //LEAP
  var controller = new Leap.Controller({enableGestures: true})
		
		controller.loop(function(obj) {
		  var hands = obj.hands.length;
		  var fingers = obj.pointables.length;
		  var isStarted = false;
		  if(hands === 1){
		  	if(!isStarted)
		  	{
		  		Backbone.history.navigate("game", true);
		  		isStarted = true;
		  	}
		  }
		   var palmMovement = obj.hands.map(function(data) {
			    return data.palmPosition[1];
			    
		   }); 
		  SetHandMovement(palmMovement);
		  SetFingers(fingers);
		   
		});
		
		
		
		controller.on('deviceDisconnected', function() {
          Backbone.history.navigate("noleap", true);
      	});
      	controller.on('deviceConnected', function() {
          Backbone.history.navigate("", true);
      	});
  
  
  //gameModel
  Game.GameModel = Backbone.Model.extend({
  	/* invisible VARs
  		player1Name = players name,
  		player2Name = other players name default CPU,
  		player1Score = players score,
  		player2Score = other players score, 
  		handMove = Leap Palm Movement Y,
    */
   initialize:function(){
   	this.set('handMove','');
   	this.set('i', 0);
   	this.UpdateTimer();	
   	this.set('hasPulledUp', false);
   	this.set('hasPulledMiddle', false);
   	this.set('showHand', false);
   	this.set('PlayersChoice', '');
   	this.set('player1Score', 0);
    this.set('player2Score', 0);
    this.set('Scorepause', false);
   },
   
   UpdateTimer: function(){		
		setInterval(this.onTick.bind(this),10);
	},
	
	onTick:function(i){
		if(this.get('showHand') == false)
		{
			this.set('handMove', GetHandMovement());
			var move = this.get('handMove');
			
			//should probably be moved to separate function but anyway.
			move = JSON.stringify(move);
			move = move.replace("[", "");
			move = move.replace("]", "");
			var split = move.split('.');
			move = split[0];
			move = parseInt(move);
			if(move != NaN)
			{
				if(move <= 150 && this.get('hasPulledUp') === true)
				{
					this.set('hasPulledUp', false);
					this.set('i', this.get('i')+1);
					this.set('hasPassedMiddle', true);
					this.set('handShake', this.get('i'));
					this.checkShake();
					 
				}
				if(move >= 151 && move <= 250 && this.get('hasPassedMiddle') === true)
				{
					if(this.get('hasPulledUp') == true)
					{
						this.set('hasPulledUp', false);
					}
					else
					{
						this.set('hasPulledUp', true);
					}
					this.set('hasPassedMiddle', false);
					
					
				}
				if(move >= 251 && !this.get('hasPulledUp'))
				{
					this.set('hasPassedMiddle', true);
				}
			}
		}
	},
	
	getMovement:function(){
		return GetHandMovement();
	},
   
   CPURandomGesture:function(){
   	var random = Math.floor((Math.random()*3)+0);
   	if(random == 0){
   		return "ROCK";
   	}
   	else if(random == 1)
   	{
   		return "SCISSORS";
   	}
   	return "PAPER";
   },
   
   checkShake:function(){
   		if(this.get('i') == 3)
   		{
   			this.set('showHand', true);
   			this.getPlayersHand();
   		}
   },
   
   getPlayersHand:function(){
   		var gesture = parseInt(GetFingers());
   		if(gesture <= 1)
   		{
   			this.set('PlayersChoice', 'ROCK');
   		}
   		if(gesture <= 3 && gesture >= 2)
   		{
   			this.set('PlayersChoice', 'SCISSORS');
   		}
   		if(gesture >= 4)
   		{
   			this.set('PlayersChoice', 'PAPER');
   		}
   		
   },
   
   setGameText:function(){
   		if(this.get('showHand') == false)
   		{
   			if(this.get('i') == 0)
   			{
   				return "READY";
   			}
   			if(this.get('i') == 1)
   			{
   				return "SET";
   			}
   			if(this.get('i') == 2)
   			{
   				return "GO!!";
   			}
   		}
   		else if(this.get('i') == 3){
   			return this.CheckWinner();
   		}
   },
   
   CheckWinner:function(){
   		var CPU = this.CPURandomGesture();
   		var Player = this.get('PlayersChoice');
   		if(Player == CPU)
   		{
   			return Player+" <span class='white'>DRAW</span> <span class='red'>"+CPU+"</span>";
   		}
   		else if(Player == "ROCK" && CPU == "SCISSORS")
   		{	
   			
   			return Player+" <span class='white'>PLAYER WINS!</span> <span class='red'>"+CPU+"</span>";
   		}
   		else if(Player == "SCISSORS" && CPU == "PAPER")
   		{
   			
   			return Player+" <span class='white'>PLAYER WINS!</span> <span class='red'>"+CPU+"</span>";
   		}
   		else if(Player == "PAPER" && CPU == "ROCK")
   		{
   			
   			return Player+" <span class='white'>PLAYER WINS!</span> <span class='red'>"+CPU+"</span>";
   		}
   		else if(CPU == "ROCK" && Player == "SCISSORS")
   		{	
   			
   			return Player+" <span class='white'>CPU WINS</span> <span class='red'>"+CPU+"</span>";
   		}
   		else if(CPU == "SCISSORS" && Player == "PAPER")
   		{
   			
   			return Player+" <span class='white'>CPU WINS</span> <span class='red'>"+CPU+"</span>";
   		}
   		else if(CPU == "PAPER" && Player == "ROCK")
   		{
   			
   			return Player+" <span class='white'>CPU WINS</span> <span class='red'>"+CPU+"</span>";
   		}
   },
   
   resetGame:function(){
   	this.set('PlayersChoice', null);
   	this.set('hasPulledUp', false);
   	this.set('hasPulledMiddle', false);
   	this.set('showHand', false);
   	this.set('i', 0);
   	this.set('Scorepause', false);
   	console.log("INSIDE RESETGAME");
   },
  }),
  
  //IndexView
  Game.IndexView = Backbone.View.extend({
    template: template('index-view'),
    
    render:function()
    {
    	
        this.$el.html(this.template(this));
        return this;     
    },
  }), 
  
  Game.NoLeapView = Backbone.View.extend({
    template: template('noleap-view'),
    initialize:function(){
    	
    },
    render:function()
    {	
        this.$el.html(this.template(this));
        return this;     
    },
  }), 
  
  //GAMEVIEW,
  Game.GameView = Backbone.View.extend({
    template: template('start-view'),
    initialize:function(){
    	_.bindAll(this);
    	this.model.set('player1Name', 'Player1');
    	this.model.set('player2Name', 'CPU');
    	this.model.on('change', this.render, this);
    	this.model.set('pause', false);
    	//------
    },
    render:function()
    {	
    	if(this.model.get('showHand') == true && this.model.get('pause') == false)
    	{	
    		 this.resetGame(this);
    		 this.$el.html(this.template(this));
        	 return this;
    	}
    	else
    	{
        this.$el.html(this.template(this));
        return this;
        }     
    },
    playerName1:function(){ return this.model.get('player1Name');},
    playerScore1:function(){
    	return this.model.get('player1Score');
    },
    playerName2: function(){ return this.model.get('player2Name');},
    playerScore2:function(){
    	return this.model.get('player2Score');;
    },
    gameText:function(){
    	return this.model.setGameText();
   	},
   	resetGame:function(self){
   		//THIS IS VERY UGLY!!!
   		self.model.set('pause', true);
   		setTimeout(function(){
   			self.model.resetGame();
   			self.model.set('pause', false);
   		},1500);
   	},
  }), 
  //Router
  Game.Router = Backbone.Router.extend({
    initialize:function (options) {
        this.el = options.el;
        this.firstPage = true;
    },
    routes: 
    {
      "": "index",
      "noleap": "noleap",
      "game": "game"
    },
    index:function(){
    	var self = this;
    	self.el.empty(); 
    	self.changePage(new Game.IndexView());
    	
    }, 
    noleap:function(){
    	var self = this;
    	self.el.empty(); 
    	self.changePage(new Game.NoLeapView());
    	
    }, 
    game:function(){
    	var self = this;
    	var gameModel = new Game.GameModel();
    	self.el.empty(); 
    	self.changePage(new Game.GameView({model:gameModel}));
    	
    }, 
    
    
    changePage:function (page) {
        
        page.render();
        this.el.append($(page.el));
        
    }
}),
 
  //My booter starts up my application.
  Game.boot = function(container) 
  {
    container = $(container);
    var router = new Game.Router({el: container})
    Backbone.history.start();
  }
})()