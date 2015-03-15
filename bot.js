// Get the libs
var irc = require('irc'),
      fs = require('fs'),
      jf = require('jsonfile'),
	  express = require('express'),
	  FeedParser = require('feedparser'),
	  request = require('request'),
      util = require('util');

var app = express();
app.get('/',
    function(req,res)
    {res.send("<title></title>"+
"<style>html,body {"+
"margin:10px;"+
"background-color: #FFFFFF;"+
"color: #000000;"+
"font-family: arial;"+
"font-size: 15px;"+
"font-variant: small-caps;"+
"line-height: 16px;"+
"border-radius: 7px;"+
"text-shadow: 0px 0px 8px #DDDDDD;"+
"}</style>"+
"<u>Twitch Chat Commands:</u><br>"+
"/timeout <username> <time in seconds> -Times out the specified user for x number of seconds<br>"+
"/timeout <username> – times out the selected user for ten minutes<br>"+
"/timeout <username> 1 – purges the chat of the user. (Actually it times out the user for one second.)<br>"+
"/ban <username> - Bans the specified username<br>"+
"/mods – Calls up list of channel moderators<br>"+
"/slow – Turns slow mode on. I would prefer to be the only one using this command.<br>"+
"/slowoff – Turns slow mode off.<br>"+
"/clear – Clears the chat. We try to use this command sparingly and opt for the \"purge\" command.<br><br>"+

"Der Bot besitzt konstante Befehle und Channel bezogene die gelöscht und hinzugefügt werden können<br><br>"+
"<b>Konstante Befehle:</b><br>"+
"!status > zeigt wie lange der Bot schon Online ist und wie viele viewer der Bot gezählt hat<br>"+
"!allow [user] > erlaubt einen Viewer für 2min einen Link zu posten<br>"+
"!help > zeigt und erklärt nochmal diese Befehle<br>"+
"!admin > Zeigt die Admins vom Bot<br>"+
"!violators > Zeigt die User die vom Bot schon verwarnt wurden<br>"+
"!setviewers > setzt die Viewer anzahl für den Bot<br>"+
"!ads > Aktiviert(90min) oder Deaktiviert die Werbung für diesen Channel<br>"+
"!randomreply > Regelt ob der Bot auf \"bot\" und seinen Namen reagieren darf<br>"+
"!add > Fügt einen neuen !Befehl dem Bot hinzu: \"!add facebook www.facebook.com\"<br>"+
"!del > löscht einen verfügbaren Befehl: \"!del facebook\"<br>"+
"!lastupdated > gibt das Datum und die Uhrzeit von der letzten Änderung der Datenbank aus<br>"+
"!twitch > Schreibt die Überschrift das aktuelle Spiel und die Follower aus<br>"+
"!facebooknews > Postet den letzten Facebook Status falls eine Facebook ID in der DB hinterlegt ist<br>"+
"!steamprofil > Schreibt den Steam Status, Name und falls vorhanden das aktuelle Spiel in den Chat sofern die SteamID in der DB hinterlegt ist<br><br>"+

"Der Bot erlaubt Links mit den Domains: youtube.com, soundcloud.com, steamcommunity.com, reddit.com<br>"+
"(Hintergrund ist das so ScamLinks vermieden werden und nicht jeder nett gemeinte Link gelöscht wird)<br><br>"+
"<u>BOT Settings & Channel bezogene Befehle:</u> (Umlaute werden später richtig ausgegeben)<br>"+
//util.inspect(commands).replace(/\r\n|\n/g,"<br>").replace(/ /g, '&nbsp;')
"<pre>"+JSON.stringify(commands, undefined, 2)+"</pre>"
	)}
);
// Start the server.
//var port = process.env.OPENSHIFT_NODEJS_PORT || 8080  //
var port = process.env.OPENSHIFT_NODEJS_PORT || 80
, ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
app.listen(port, ip);

/////////////////////// CONFIG ///////////////////////
var steamapi = '1234567890098765432112345678900987654321' // http://steamcommunity.com/dev/apikey
var settings = {
  //channels: ["#channel1","#channel2"],
  channels: ["#botttich"], //channels you want the bot to join
  server: "irc.twitch.tv",  
  botName: "botttich", // twitch Name
  botNick: ["botttich"], //i use these to trigger random messages from the bot
  password: "oauth:", // "oauth:abcde12345" http://twitchapps.com/tmi/
  admins: ['botttich', 'moobot', 'nightbot'], //admins that can control the bot
  //swears: ['badword1','badword2','badwords'], //use this as a profanity filter
  swears: [], //use this as a profanity filter
  quotes: [
      "Did someone say my name?",
      "You've enjoyed all the power you've been given, haven't you? I wonder how you'd take to working in a pocket calculator.",
      "On the other side of the screen, it all looks so easy.",
      "FYI man, alright. You could sit at home, and do like absolutely nothing, and your name goes through like 17 computers a day. 1984? Yeah right, man. That's a typo. Orwell is here now. He's livin' large. We have no names, man. No names. We are nameless!",
      "Someone didn't bother reading my carefully prepared memo on commonly-used passwords. Now, then, as I so meticulously pointed out, the four most-used passwords are: love, sex, secret, and God. So, would your holiness care to change her password?",
      "Type \"cookie\", you idiot.",
      "Did someone say my name?",
      "/me  is starting to hear things...",
      "You're in the butter zone now, baby.",
      "Thank you {NICK}! But our Princess is in another castle!",
      "\"When I get all excited about a topic I start gesticulating.\" -Ian Murdock",
      "\"If I were wearing a black turtle neck, I'd tell you this was going to be a magical experience\" -Kevin Parkerson",
      "\"This is going to make you ill with joy\" -Kevin Parkerson",
      "Hello. My name is Inigo Montoya. You killed my father. Prepare to die.",
      "You rush a miracle man, you get rotten miracles.",
      "Oh, the sot has spoken. What happens to her is not truly your concern. I will kill her. And remember this, never forget this: when I found you, you were so slobbering drunk, you couldn't buy Brandy!",
      "As I told you, it would be absolutely, totally, and in all other ways inconceivable.",
      "You keep using that word. I do not think it means what you think it means.",
      "I do not mean to pry, but you don't by any chance happen to have six fingers on your right hand?",
      "I can't compete with you physically, and you're no match for my brains. Let me put it this way. Have you ever heard of Plato, Aristotle, Socrates? Morons.",
      "Life is pain, {NICK}. Anyone who says differently is selling something.",
      "This will be a day long remembered. It has seen the end of Kenobi, and will soon see the end of the rebellion.",
      "Oh no! Nuclear launch detected!",
      "What a piece of junk!",
      "Snake? Snake? SNAAAAAAAAKE!!!",
      "AREEEEEEEEEES!!!!!!!!!",
      "Show me your moves, {NICK}!",
      "{NICK}, feeling happy is a fucking skill. Learn it!",
      "…",
      "It’s dangerous to go alone; take this! PJSalt",
      "Hey dudes thanks, for rescuing me. Let's go for a burger....Ha! Ha! Ha! Ha! - The President",
      "{NICK}, you must construct additional pylons.",
      "Don't call me a mindless philosopher, you overweight glob of grease.",
      "Why not take a break? You can pause the game by pressing +. Just kidding! Instead, press \"Follow\"! Kappa",
      "Don't worry {NICK}, I'm here to rescue you.",
      "Evacuate in our moment of triumph? I think you overestimate their chances.",
      "If this is a consular ship, where is the ambassador? - Commander, tear this ship apart until you've found those plans. And bring me the passengers, I want them alive!",
      "Look, good against remotes is one thing, good against the living, that's something else.",
      "Aren't you a little short for a stormtrooper?",
      "Hey {NICK}, stay a while, and listen!",
      "In the year 200x a super robot named Mega Man was created.",
      "Boomshakalaka!",
      "First blood! BloodTrail",
      "I need a weapon.",
      "Wakka wakka wakka!",
      "It's time to kick ass and chew bubble gum, and I'm all out of gum.",
      "Segaaaaaaaaaaaaaaaaaaaaa.",
      "What are we going to do? We'll be sent to the spice mines of Kessel and smashed into who knows what.",
      "That's no moon, it's a space station.",
      "Oh look, another visitor. Stay awhile... Stay FOREVER! (and click 'Follow')",
      "Spy's sappin’ my sentry!",
      "The President has been kidnapped by ninjas. Are you a bad enough dude to rescue the president, {NICK}?",
      "This is some rescue. You came in here and you didn't have a plan for getting out?",
      "He's the brains, sweetheart!",
      "Wake me when you need me.",
      "Mos Eisley spaceport. You will never find a more wretched hive of scum and villainy.",
      "Into the garbage chute, flyboy!",
      "Hey hey hey it's time to make some carrrrazzzyy money are ya ready? Here we go!",
      "This is Red 5, I'm going in.",
      "Boring conversation anyway. Luke, we're gonna have company!",
      "The right man in the wrong place can make all the difference in the world, {NICK}",
      "The Force is strong with this one.",
      "All your base are belong to us.",
      "I suggest a new strategy, R2. Let the wookiee win.",
      "I'm a member of the Imperial Senate on a diplomatic mission to Alderaan.",
      "You are part of the Rebel Alliance and a traitor. Take her away!",
      "You're all clear, kid! Now let's blow this thing and go home!",
      "These blast points - too accurate for sandpeople. Only imperial stormtroopers are so precise.",
      "I've got a very bad feeling about this.",
      "You've never heard of the Millennium Falcon? ... It's the ship that made the Kessel run in less than 12 parsecs.",
      "When I left you, I was but the learner, now I am the master.",
      "/me  thinks {NICK} talks too much.",
      "{NICK} has died of dysentery",
      "I am error. BibleThump",
      "Fus-ro-dah!",
      "{NICK}, Finish Him!",
      "Welcome to Summoner's Rift....Pfft, just kidding. SwiftRage",
      "I find your lack of faith disturbing.",
      "I am the great mighty poo, and I’m going to throw my shit at you.",
      "This is your fault, {NICK}, I'm going to kill you. And all the cake is gone. You don't even care, do you?",
      "Use the Force, {NICK}",
      "You don't need to see his identification ... These aren't the droids you're looking for ... He can go about his business ... Move along.",
      "Help me {NICK}. You're my only hope.",
      "No one said you have to like me, but you're in MY house, buster!",
      "I'm fine... We're all fine here. How are you?",
      "Didn’t we have some fun though? Remember when the platform was sliding into the fire pit and I said 'Goodbye' and you were like 'NO WAY!' and then I was all 'We pretended we were going to murder you'? That was great.",
      "C-c-c-combo breaker!",
      "It's a-me! MGbot! Kappa",
      "Sorry {NICK}, our princess is in another castle!"
    ],
    backtalk:[
    "Hey, {NICK}, watch your fucking mouth!",
    "{NICK}, watch what you say, there might be fucking kids in here!",
    "GOD DAMNIT, {NICK} I said NO fucking swearing!",
    "You kiss your mother with that mouth, {NICK}?",
    "Sigh, I give up! Fuckers be swearing all over this bitch!",
    "/me  is really starting to not like {NICK}",
    "Stop poking me!",
    "Damn {NICK}, you are worse than Khrono!",
    "I will kill your dicks! - (Bulletstorm)",
    "Learn from your parents' mistakes, {NICK}, use birth control!",
    "The universe is laughing behind {NICK}'s back.",
    "You're just jealous because the voices only talk to me.",
    "Hey Sailor! Join the Army, meet interesting people, kill them",
    "/me  is looking for a new job",
    "Wow {NICK}, your vocab talents will be recognized and suitably rewarded.",
    "Deep down I'm a very shallow person.",
    "Sigh! Bullshit: the art of making the idiotic sound sensible.",
    "Watch your mouth kid, or you'll find yourself floating home."],
    adminMsgs:[
      'Welcome to {CHANNEL}\'s channel. Click \'FOLLOW\' to stay up to date on when {CHANNEL} goes live.',
      'You guys rock! Thanks for hanging out with us today!'
    ]
}

console.log("*** Bot Started ***");
var violators = [];
var startTime = new Date();
var utc = new Date(startTime.getTime() + startTime.getTimezoneOffset() * 70000); // time lag
var admins = settings.admins;
var swears = settings.swears;

//Get Stored Data
console.log('loading violators...');
var file = 'violators.json';
violators = jf.readFileSync(file);
// console.log('violators:',violators);

var commandsfile = 'commands.json';
commands = jf.readFileSync(commandsfile);
 //console.log('commands:',commands);

//console.log('Last Updated: '+commands.lastupdated);

// console.log('channel length',settings.channels.length);
//Create viewer counters for each channel
for(var i = 0; i < settings.channels.length; i++){
  var chanObj = settings.channels[i].substr(1);
  // console.log(chanObj);
  settings[chanObj] = {};
  settings[chanObj].viewers = 0;
  settings[chanObj].adminMsg = null;
  settings[chanObj].allowing = '';
  settings[chanObj].msgCount = 0;
  // console.log(chanObj, settings[chanObj].viewers, settings[chanObj].adminMsg);
}

// console.log(settings.channels);

// Create the bot name
var bot = new irc.Client(settings.server, settings.botName, {
  channels: [settings.channels + " " + settings.password],
  debug: true,
  showErrors: true,
  floodProtection: true,
  floodProtectionDelay: 1600,
  password: settings.password,
  username: settings.botName
});

// Error handler
bot.addListener('error', function(message) {
	console.log('ERROR')
	//console.log('error: ', message);
	bot.say("#botttich","Error: "+message);
	//console.log('MESSAGE.command '+JSON.stringify(message))
	console.log('message '+message)
});

//Handle on connect event
bot.addListener("disconnect", function () {
	console.log("*** Bot disconnect ***");
	//bot.say("#botttich","*** Bot disconnect *** "+new Date(startTime.getTime() + startTime.getTimezoneOffset() * 70000));
});

bot.addListener('pm', function (from, message) {
    console.log(from + ' => ME: ' + message);
		if(message.indexOf('status') !== -1){ //is it a youtube link?
			 bot.say(from,"I have been running since: "+utc);
		}
});

// Listen for joins
bot.addListener("join", function(channel, who) {
  // Welcome them in!
  // console.log(who, "joined the chat!");  //  bot.say("#botttich","*** Bot Connected *** "+utc);
  settings[channel.substr(1)].viewers++;
  if(settings[channel.substr(1)].viewers >= 8 && commands[channel.substr(1)].botsettings.viewerads){
    console.log(channel.substr(1)+' viewers = '+settings[channel.substr(1)].viewers);
    if(!settings[channel.substr(1)].adminMsg){
      console.log('starting interval for adminMsg');
      settings[channel.substr(1)].adminMsg = setInterval(function(){sendAdminMsg(channel)},600000);
    }
  }
});

// Listen for any message, say to him/her in the room
bot.addListener("message", function (from, to, text, message) {
  //console.log(arguments);
  /* 
  if(text === "cookie"){
    bot.say(to, "Great! You jump off bridges when bots tell you to as well?");
    return;
  }
  // else if(text.match('recruiting')){
  //   bot.say(to, "Hey, "+from+", are you looking to be recruited? We are always looking for new people to join us in competition, fun, and just everyday __bullshit__. Head over to our forums and make a post telling us about yourself. Link: http://www.mobility-gaming.com");
  //   return;
  // }
  if(text === text.toUpperCase() && text.length > 5){
    if(!adminCheck(from, from)){
      setTimeout(function(){
            bot.say(to, "/timeout "+from+" 20");
            bot.say(to, from+", calm down! Try that again in 20 secs. BloodTrail");},1500);
            checkViolations(from);
    }
          return;
  }
  if(!scanForLink(text)){
    if(!adminCheck(from, from)){
      if(settings[to.substr(1)].allowing != from){
        setTimeout(function(){
          bot.say(to, "/timeout "+from+" 20");
          bot.say(to, "Ahem! "+from+", did you ask for permission to post that link?");},1500);
        checkViolations(from);
      }
      return;
    }
  }*/
  if(text.substr(0,1) == "!"){
    parseCmd(text.substr(1).toLowerCase(),to,from);
    return;
  }
  // nick = from;
  // channel = to;
  //textScan(text, to, from);
});

//Handle on connect event
bot.addListener("connect", function () {
  console.log("*** Bot Connected ***");
  bot.say("#botttich","*** Bot Connected *** "+utc);
  //bot.say(config.channels[0], "I am Here Bitches!");
  for(var i = 0; i < settings.channels.length; i++){
    clearInterval(settings[settings.channels[i].substr(1)].adminMsg);
    settings[settings.channels[i].substr(1)].adminMsg = false;
  }
});

bot.addListener("part", function (channel, nick, reason, message) {
  //console.log("*** PART:",channel, nick, reason, message);
  // console.log(nick,'left chat!');
  settings[channel.substr(1)].viewers--;
  if(settings[channel.substr(1)].viewers < 0){
    settings[channel.substr(1)].viewers = 0;
  }
  if(settings[channel.substr(1)].viewers < 8){
    clearInterval(settings[channel.substr(1)].adminMsg);
    settings[channel.substr(1)].adminMsg = false;
    console.log('clearing adminMsg interval for '+channel);
  }
  console.log(channel.substr(1)+" viewers = "+settings[channel.substr(1)].viewers);
});

bot.addListener("quit", function (nick, reason, channels, message) {
  //console.log("*** QUIT:",nick, reason, message);
  // console.log(nick,'has quit!');
  settings[channel.substr(1)].viewers--;
  if(settings[channel.substr(1)].viewers < 0){
    settings[channel.substr(1)].viewers = 0;
  }
  if(settings[channel.substr(1)].viewers < 8){
    clearInterval(settings[channel.substr(1)].adminMsg);
    settings[channel.substr(1)].adminMsg = false;
    console.log('clearing adminMsg interval for '+channel);
  }
  console.log(channel.substr(1)+" viewers = "+settings[channel.substr(1)].viewers);
});

function adminCheck(name, channel){
admins.push(channel.substr(1));
  for(var i=0; i< settings.admins.length; i++){
	if((admins[i]) === name){
	  admins.pop(channel.substr(1));
      return true;
    }
  }
  admins.pop(channel.substr(1));
  return false;
}

function noMoreLinks(channel){
  bot.say(channel,'/me  is no longer accepting links from '+settings[channel.substr(1)].allowing);
  settings[channel.substr(1)].allowing = '';
}

function sendAdminMsg(channel){
	 if(commands[channel.substr(1)].botsettings.viewerads){
		  console.log('Sending Admin Message. Viewers: '+settings[channel.substr(1)].viewers);
		  bot.say(channel, settings.adminMsgs[settings[channel.substr(1)].msgCount].replace(/{CHANNEL}/g,channel.substr(1).toUpperCase()));
		  settings[channel.substr(1)].msgCount++;
		  console.log('Admin Msgs:',settings.adminMsgs.length,'count:', settings[channel.substr(1)].msgCount);
		  if(settings[channel.substr(1)].msgCount == settings.adminMsgs.length){
			settings[channel.substr(1)].msgCount = 0;
		  }
	 } 
}

function textScan(text, channel, from){
  var nameCheck;
  for(var i = 0; i<settings.botNick.length;i++){
    var nameCheck = text.toLowerCase().match(settings.botNick[i]);
    if(nameCheck != null){
      console.log("sending random message to "+channel);
      getRandomReply('misc',channel,from);
      return;
    }
  }
  swearCheck(text, channel, from);
}

function scanForLink(text){
  // var re = /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
  // var re = /([a-z0-9_-]+\.)+[a-z]{2,4}\/[^ ]*|(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\s|^)((https?:\/\/|www\.)+[a-z0-9_.\/?=&-]+)/gi;
  var re = /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|tv|local|internal|xxx))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@\/?]*)?)(\s+|$)/gi;
  //console.log(text.match(re));
  if(text.match(re) != null){
    if((text.indexOf('youtube.com') || text.indexOf('soundcloud.com') || text.indexOf('steamcommunity.com') || text.indexOf('reddit.com')) == -1){ //is it a valid link?
      return false; //no;
    }else{
      return true; //yes;
    }
  }else{
    return true;
  }
}

function swearCheck(text, channel, from){
  for(var i=0;i<swears.length;i++){
    var textCheck =  text.match(settings.swears[i]);
    if(textCheck != null){
      console.log("sending random swear");
      getRandomReply('swear', channel, from);
      return;
    }
  }
}

function getRandomReply(type, channel, from) {
	
	 if(commands[channel.substr(1)].botsettings.randomreply){
		  var message = '';
		  if(type == 'swear'){
			message = settings.backtalk[Math.floor(Math.random() * settings.backtalk.length)];
			checkViolations(from);
		  }else if(type == 'misc'){
			message = settings.quotes[Math.floor(Math.random() * settings.quotes.length)];
		  }
		  message = message.replace("{NICK}", from);
		  bot.say(channel,message);
	 }  
}

function parseCmd(cmd,channel,user){
  var cmdall = cmd
  cmd = cmd.split(' ');
  switch(cmd[0]){
	case "status":
      getStatus(channel);
      break;
//    case "creator": // the REAL
//      bot.say(channel,"I am ready to meet my Maker. Whether my Maker is prepared for the ordeal of meeting me is another matter. His name is....RedSeal.");
//      break; 
    case "allow":
      if(adminCheck(user, channel)){
        settings[channel.substr(1)].allowing = cmd[1];
        bot.say(channel,'/me  is allowing links from '+cmd[1]+' (2min)');
        setTimeout(function(){noMoreLinks(channel);},120000);
      }else{
        bot.say(channel,"Nice try, "+user+", but I do not obey you.");
      }
      break;
    // case "clear":
    //   if(adminCheck(user)){
    //     violators = [];
    //     bot.say(channel,"Violations have been cleared.")
    //   }else{
    //     bot.say(channel,"Nice try, "+user+", but I do not obey you.");
    //   }
    //   break;
    case "help":
      bot.say(channel,"=======================");
      bot.say(channel,"status - get various information");
      // bot.say(channel,"mumble - display our mumble info");
      bot.say(channel,"admin - display people I listen to");
      bot.say(channel,"violators - display people that annoy");
      bot.say(channel,"allow [name]- admins only; allows user to post links");
      bot.say(channel,"setviewers [#] - admins only; set the viewer count to the right #");
      // bot.say(channel,"clear - admins only; clears violators");
      // bot.say(channel,"creator - find out who the genius is behind this bad ass bot");
      bot.say(channel,"=========================================");
      break;
    // case "mumble":
      // bot.say(channel,"Our Mumble Info is: low.mumble.com port 6735.");
      // break;
    case "admin":
      var adm = "People who can control me are: ";
      for(var j = 0; j < admins.length;j++){
        adm += (j == 0) ? admins[j] : ", "+admins[j];
      }
      bot.say(channel,adm);
      break;
    case "violators":
      getViolatorsList(channel);
      break;
    case "setviewers":
      if(adminCheck(user, channel)){
        settings[channel.substr(1)].viewers = cmd[1];
        bot.say(channel, "I have set viewer count to "+settings[channel.substr(1)].viewers);
        if(settings[channel.substr(1)].viewers >= 8){
          if(!settings[channel.substr(1)].adminMsg){
            console.log('starting interval for adminMsg');
            settings[channel.substr(1)].adminMsg = setInterval(function(){sendAdminMsg(channel)},1800000);
          }
        }else{
          clearInterval(settings[channel.substr(1)].adminMsg);
          settings[channel.substr(1)].adminMsg = false;
          console.log('clearing adminMsg interval for '+channel);
        }
      }else{
        bot.say(channel,"Nice try, "+user+", but I do not obey you.");
      }
      break;
	 case "gronkh": // choice chamber
		if(channel == '#botttich'){
			if(adminCheck(user, channel)){	
				gronkh(cmd[1], cmd[2]);
			}
		}
	  break;
		case "botttich":
		if(channel == '#botttich'){
			if(adminCheck(user, channel)){	
				botttich(cmd[1], cmd[2]);
			}
		}
	  break;
	 case "ads":
			if(adminCheck(user, channel)){	
				advertising(channel);
			}
	  break;
	 case "randomreply":
			if(adminCheck(user, channel)){	
				randomreply(channel);
			}
	  break;
	 case "add":
			if(adminCheck(user, channel)){	
				addcommand(channel, cmdall);
			}
	  break;
	 case "del":
			if(adminCheck(user, channel)){	
				deletecommand(channel, cmd[1]);
			}
	  break;
	 /*case "rss": //WIP
		console.log('case rss');
		rss(channel);
	  break; */
	 case "lastupdated":
		bot.say(channel,'Last Updated: '+commands.lastupdated);
		console.log('Last Updated: '+commands.lastupdated);
      break;
	 case "twitch":
		twitchstatus(channel);
      break;
	 case "facebooknews":
			if(commands[channel.substr(1)].botsettings.facebookapi){
				facebooknews(channel);
			} else {
				bot.say(channel,'Die Facebook ID ist in der Datenbank nicht hinterlegt.');
			}
      break;
	 case "steamprofil":
		if(adminCheck(user, channel)){	
			if(commands[channel.substr(1)].botsettings.steamid){
				steamstatus(channel);
			} else {
				bot.say(channel,'Die SteamID ist in der Datenbank nicht hinterlegt.');
			}
		}
      break;
    default:
      //if(cmd[0].length > 1){  bot.say(channel,"I'm sorry, "+user+", but I do not understand the ["+cmd[0]+"] command. Try typing \"!help\" to get the available commands."); }
	   if (commands[channel.substr(1)][cmd]) {
			bot.say(channel, commands[channel.substr(1)][cmd])
	   } else if(cmd[0].length > 1){
			bot.say(channel,"I'm sorry, "+user+", but I do not understand the ["+cmd[0]+"] command. Try typing \"!help\" to get the available commands.");
	   }
  }
}

/*
function rss(channel) {
	console.log('rss');
			feedparser.parseStream(request({ 'uri': 'http://www.hltv.org/blog.rss.php' }))
			.on('item', function (article) {
			//do something
			});
}*/

function steamstatus(channel) {
	var url = "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key="+steamapi+"&steamids="+commands[channel.substr(1)].botsettings.steamid
	request({
		url: url,
		json: true
	}, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			if (body.response.players[0].communityvisibilitystate !== 1) {
				
					switch (body.response.players[0].personastate) {
					case 0:
						var status = "Offline";
						break;
					case 1:
						var status = "Online";
						break;
					case 2:
						var status = "Busy";
						break;
					case 3:
						var status = "Away";
						break;
					case 4:
						var status = "Snooze";
						break;
					case 5:
						var status = "looking to trade";
						break;
					case 6:
						var status = "looking to play";
						break;
					}

					if (body.response.players[0].gameextrainfo !== undefined) {
						var gameinfo = ' Spiel: '+body.response.players[0].gameextrainfo
					} else {
						var gameinfo = ''
					}

				bot.say(channel,'['+status+'] Steam Name: '+body.response.players[0].personaname+gameinfo)
			} else {
				bot.say(channel,'Steam profile ist private')
			}
		}
	})
}

function twitchstatus(channel) {
	var url = "https://api.twitch.tv/kraken/channels/"+channel.substr(1)
	request({
		url: url,
		json: true
	}, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			partner = body.partner == true ? ' Twitch partner' : ' kein Twitch partner'
			bot.say(channel,'Twitch Headline: '+body.status+' Spiel: '+body.game+' Followers: '+body.followers+partner)
		}
	})
}

function facebooknews(channel) {
	var url = 'http://graph.facebook.com/'+commands[channel.substr(1)].botsettings.facebookapi+'/feed?limit=1'
	request({
		url: url,
		json: true
	}, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			bot.say(channel,'Facebook News: '+body.data[0].message)
		}
	})
}

function randomreply(channel) {
	commands[channel.substr(1)].botsettings.randomreply = !commands[channel.substr(1)].botsettings.randomreply
	bot.say(channel,commands[channel.substr(1)].botsettings.randomreply == true ? "RandomReplys sind nun eingeschaltet" : "RandomReplys sind nun ausgeschaltet");
	commands.lastupdated = new Date();
	jf.writeFileSync(commandsfile, commands)
}

function advertising(channel) {
	commands[channel.substr(1)].botsettings.advertising = !commands[channel.substr(1)].botsettings.advertising
	bot.say(channel,commands[channel.substr(1)].botsettings.advertising == true ? "Werbung ist nun eingeschaltet" : "Werbung ist nun ausgeschaltet");
	commands.lastupdated = new Date();
	jf.writeFileSync(commandsfile, commands)
}

function advertisinggg() {
  for(var i=0; i< settings.channels.length; i++){
	var channel = settings.channels[i]
		if(commands[channel.substr(1)].botsettings.advertising == true){
			bot.say(channel,commands[channel.substr(1)].botsettings.advertisingtext);
		}					
  }
}
ads__ = setInterval(function(){advertisinggg()},5400000); //90min

function addcommand(channel, cmd){
console.log(channel)
	cmd = cmd.substr(4);
	//console.log('['+cmd+']')
	var n = cmd.indexOf(' ');
	instruction = cmd.substr(0, n);
	//console.log('['+instruction+']')
	value = cmd.substr(++n);
	//console.log('['+value+']')
	commands[channel.substr(1)][instruction] = value;
	commands.lastupdated = new Date();
	jf.writeFileSync(commandsfile, commands)
	bot.say(channel, 'Command !'+instruction+' ['+value+'] wurde hinzugefügt.')
}

function deletecommand(channel, cmd){
	//delete commands.z3us.test
	//delete commands.channel.cmd
	delete commands[channel.substr(1)][cmd]
	commands.lastupdated = new Date();
	jf.writeFileSync(commandsfile, commands)
	bot.say(channel, 'Command !'+cmd+' wurde gelöscht.')
}

function gronkh(cmd, time){
	bot.say('#botttich', 'Befehl: '+cmd+' wird nun '+time+' geschrieben.')
	if(cmd !== undefined && time !== undefined && !isNaN(time)){
			for(var i = 0; i < time; i++){
				bot.say('#gronkh',cmd);
			}
			bot.say('#botttich', 'Fertig.')
		}
}

function royalphunk(cmd, time){
	bot.say('#botttich', 'Befehl: '+cmd+' wird nun '+time+' geschrieben.')
	if(cmd !== undefined && time !== undefined && !isNaN(time)){
			for(var i = 0; i < time; i++){
				bot.say('#royalphunk',cmd);
			}
			bot.say('#botttich', 'Fertig.')
		}
}

function wr3x2k15(cmd, time){
	bot.say(channel, 'Befehl: '+cmd+' wird nun '+time+' geschrieben.')
	if(cmd !== undefined && time !== undefined && !isNaN(time)){
			for(var i = 0; i < time; i++){
				bot.say('#wr3x2k15',cmd);
			}
			bot.say('#botttich', 'Fertig.')
		}
}

function botttich(cmd, time){
	console.log('asd')
	bot.say('#botttich', 'Befehl: '+cmd+' wird nun '+time+' geschrieben.')
	var timee = 0;
		if(cmd !== undefined && time !== undefined && !isNaN(time)){
			for(var i = 0; i < time; i++){
				bot.say('#botttich',cmd);
			}
			bot.say('#botttich', 'Fertig.')
		}
}

function getStatus(channel){
  bot.say(channel,"=======================");
  // bot.say(channel,"ItsBoshyTime I have been running since: "+startTime.toDateString()+" "+startTime.toLocaleTimeString()+ ' CST');
  bot.say(channel,"ItsBoshyTime I have been running since: "+utc);
  bot.say(channel,"I am currently seeing the following viewers:");
  for(var i = 0; i < settings.channels.length; i++){
    var chanObj = settings.channels[i].substr(1);
    bot.say(channel, chanObj + ' has '+ settings[chanObj].viewers + ((settings[chanObj].viewers == 1) ? ' viewer.' : ' viewers.'));
  }
  bot.say(channel,"=======================================");
}

function getViolatorsList(channel){
  bot.say(channel,"=======================");
  if(violators != ""){
    var msg = "Top 5 Violators for all channels are: ";
    var limit = (violators.length > 5) ? 5 : violators.length;
    for(var i = 0; i < limit; i++){
      msg += violators[i].name + ": "+violators[i].violations;
      if(i != violators.length -1){
        msg += " | ";
      }
    }
    bot.say(channel,msg);
  }else{
    bot.say(channel, "We have no violators, yet! Kappa");
  }
  bot.say(channel,"=======================================");
}

function checkViolations(user){
  if(violators == ""){
      var violator = {
          name : user,
          violations : 1
        };
        violators.push(violator);
        jf.writeFileSync(file, violators);
        return;
    }
    for(var i = 0; i < violators.length; i++){
      if(violators[i].name == user){
        violators[i].violations++;
        violators.sort(function(a, b){
            //note the array comparison [...] < [...]
            // return [a.name, a.violations] < [b.name, b.violations] ? -1 : 1;
            return parseInt(a.violations) < parseInt(b.violations) ? 1 : -1;
        });
        jf.writeFileSync(file, violators);
        return;
      }
      if(i == violators.length -1){
        var violator = {
          name : user,
          violations : 1
        };
        violators.push(violator);
        violators.sort(function(a, b){
            //note the array comparison [...] < [...]
            // return [a.name, a.violations] < [b.name, b.violations] ? -1 : 1;
            return parseInt(a.violations) < parseInt(b.violations) ? 1 : -1;
        });
        jf.writeFileSync(file, violators);
      }
    }
}

// Create the freenodebot name /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var freenode = {
	channels: ["#steamdb-announce","#steamdb","#botttich"],
	server: "chat.freenode.net",
	password: " ",
	botName: "botttich",
}

var freenodebot = new irc.Client(freenode.server, freenode.botName, {
  channels: [freenode.channels + " " + freenode.password],
  debug: true,
  showErrors: true,
  realName: freenode.botName,
  password: freenode.password,
  username: freenode.botName
});

// Error handler
freenodebot.addListener('error', function(message) {
	console.log('ERROR')
	message = JSON.stringify(message)
	var message = 'DATE: '+new Date()+' ERROR: '+message
	commands.freenodebot.push(message);
	commands.lastupdated = new Date();
	jf.writeFileSync(commandsfile, commands)

  freenodebot.say("#botttich",message);
  console.log('message '+message)
});

//Handle on connect event
freenodebot.addListener("disconnect", function () {
		console.log("*** Freenode Bot disconnect ***");
		freenodebot.say("#botttich","*** Bot disconnect *** "+new Date(startTime.getTime() + startTime.getTimezoneOffset() * 70000));
});

//Handle on connect event
freenodebot.addListener("connect", function () {
	//freenodebot.say("nickserv","identify botttich *PASSWORD*");
	//console.log('setTimeout Connected.9500')
	setTimeout(function(){
	  console.log("*** Freenode Bot Connected ***");
	  freenodebot.say("#botttich","*** Freenode Bot Connected *** "+utc);
	  //freenodebot.say(config.channels[0], "I am Here Bitches!");
  }, 9500);
});

freenodebot.addListener('pm', function (from, message) {
    console.log(from + ' => ME: ' + message);
		if(message.indexOf('status') !== -1){
			 freenodebot.say(from,"I have been running since: "+utc);
		} // else {
			//freenodebot.say("nickserv",message);		
	}
});

freenodebot.addListener("message", function (from, to, text, message) {
	if(to == '#steamdb-announce'){
		if(text.indexOf(' 730 ') !== -1){
			bot.say("#botttich","CSGO UPDATE: " + text + " https://steamdb.info/app/730/history/");
			freenodebot.say("#botttich",text)
			return;
		}
		if(text.indexOf(' 570 ') !== -1){
			bot.say("#botttich","DOTA2 UPDATE:" + text + " https://steamdb.info/app/570/history/");
			freenodebot.say("#botttich",text)
			return;
		}
		if(text.indexOf(' 440 ') !== -1){
			bot.say("#botttich","TF2 UPDATE:" + text + " https://steamdb.info/app/440/history/");
			freenodebot.say("#botttich",text)
			return;
		}	
	}
	if(to == '#steamdb'){
		if(from == 'SteamDB'){
			if(text.indexOf('Counter-Strike: Global Offensive status: GCConnectionStatus_GC_GOING_DOWN') !== -1){
				bot.say("#botttich","Counter-Strike: Global Offensive status: GC ConnectionStatus_GC_GOING_DOWN http://steamstat.us/#csgo_stats");
				freenodebot.say("#botttich",text)
				return;
			}
			if(text.indexOf('Counter-Strike: Global Offensive News:') !== -1){ // Blog News
				bot.say("#botttich",text);
				freenodebot.say("#botttich",text)
				return;
			}
			if(text.indexOf('Steam Client Beta announcement:') !== -1){
				bot.say("#botttich",text);
				freenodebot.say("#botttich",text)
				return;
			}
		}
	}
});