"use strict"; //BotCommands-id: 360878136574869507
const DiscordJs = require("discord.js"),
	//horizon = require('horizon-youtube-mp3'),
	ytdl = require("ytdl-core"),
	youtube_node = require('youtube-node'),
	lame = require("lame"),
	fs = require("fs")/*,
	scramble = require("./scrambler.js")*/;
var youtubeSearch = new youtube_node;
var bot = new DiscordJs.Client();
var dispatcher;
var connection;
var queue = [];

const volume = 0.2;

var latestTextChannel = "";

/*var mep = new Map();
mep.set("a", "b", "c", "d");
console.log(mep);*/

bot.login("addyourownkeyhere");
youtubeSearch.setKey('AIzaSyB1OOSpTREs85WUMvIgJvLTZKye4BVsoFU'); //Någon annans nyckel, kan behöva bytas

const prefix = "!";

var playlists = JSON.parse(fs.readFileSync("playlists.json"));

var reactions = [
	["fuckedup", "https://i.imgur.com/10lkUdy.gif"],
	["really", "https://i.imgur.com/VD4B7Js.gif"],
	["trollface", "https://i.imgur.com/jWr67J8.png?1"]
];

bot.on('message', async msg => {
	try {
		if (msg.author.bot) return;
		if (msg.content.slice(0, 1) != prefix) return;
		var message = msg.content.slice(1);
		message = message.split(" ");
		//msg.channel.send(responses[msg.content.toLowerCase()]);
		switch (message[0]) {
			case "hi":
			case "hello":
				msg.channel.send("Hello!");
				break;
			case "doot":
			case "toot":
			case "noot":
				if (dispatcher != null) {
					msg.channel.send("Sorry, can't do that while playing a song");
					break;
				}
				if (msg.member.voiceChannel || (msg.mentions.members.first() && msg.mentions.members.first().voiceChannel)) {
					var b = false;
					if ((msg.mentions.members.first() && msg.mentions.members.first().voiceChannel)) {
						b = true;
					}
					//setTimeout(function() {msg.delete().catch(console.error);}, 10);
					msg.delete();

					if (msg.mentions.members.first() && (!msg.mentions.members.first().voiceChannel)) {
						return;
					}

					//connection;
					if ((msg.mentions.members.first() && msg.mentions.members.first().voiceChannel)) {
						connection = await msg.mentions.members.first().voiceChannel.join();
					}
					else {
						connection = await msg.member.voiceChannel.join();
					}
					//const connection = await msg.member.voiceChannel.join();
					if (message[0] == "doot") {
						dispatcher = connection.playFile('./assets/skull_trumpet.mp3');
					}
					else if (message[0] == "toot") {
						//dispatcher.setVolume(2);
						dispatcher = connection.playFile('./assets/airhorn.mp3');
					}
					else if (message[0] == "noot") {
						//dispatcher.setVolume(2);
						dispatcher = connection.playFile('./assets/nootnoot.mp3');
					}
					else {
						msg.member.voiceChannel.leave();
					}
					dispatcher.on('end', () => {
						//dispatcher.destroy();
						dispatcher = null;
						if (b) {
							connection.disconnect();
							//msg.mentions.members.first().voiceChannel.leave();
						}
						else {
							connection.disconnect();
							//msg.member.voiceChannel.leave();
						}
					});
				}
				else {
					msg.channel.send(':exclamation: You need to join a voice channel/that user is not in a channel (removing in 10 seconds)').then(reply => {
						var a = 10;
						var id = setInterval(function() {
							if (a <= 2) {
								msg.delete();
								reply.delete();
								clearInterval(id);
							}
							else {
								a -= 2;
								reply.edit(':exclamation: You need to join a voice channel/that user is not in a channel (removing in ' + a + ' seconds)');
							}
						}, 2000);
						/*setTimeout(function(){
							msg.delete();
							reply.delete();
						}, 10000);*/
					});
				}
				break;
			case "play":
				if (msg.member.voiceChannel) {
					if (message[1] != undefined) {
						//msg.delete();
						var search = "";
						search += message[1];
						for (var i = 2; i < message.length; i++) {
							search += " ";
							search += message[i];
						}
						console.log("Searching for: " + search);
						connection = await msg.member.voiceChannel.join();
						//dispatcher = connection.playStream(fs.createReadStream("./assets/events/joined.mp3"));
						//dispatcher.on("end", () => {
							stopPlaying();
							/*connection.on('speaking', (user, speaking) => {
								var receiver = connection.createReceiver();
								var audioStream = receiver.createPCMStream(user);
								if (speaking) {
									var encoder = new lame.Encoder({
										// input 
										channels: 2, // 2 channels (left and right) 
										bitDepth: 16, // 16-bit samples 
										sampleRate: 44100, // 44,100 Hz sample rate 
										// output 
										bitRate: 128,
										outSampleRate: 22050,
										mode: lame.STEREO // STEREO (default), JOINTSTEREO, DUALCHANNEL or MONO 
									});
									audioStream.on("end", () => {
										audioStream.destroy();
									});
									audioStream.pipe(encoder);
									encoder.pipe(fs.createWriteStream("./test.mp3"));
								}
							});*/
							youtubeSearch.search(search, 1, function(error, result) {
								//console.log(result);
								if (error) {
									console.log("err: " + error);
									connection.disconnect();
								}
								else if (result.items.length == 0) {
									msg.channel.send(":x: No results for \"" + search + "\"");
									connection.disconnect();
								}
								else {
									if (dispatcher == null) {
										msg.channel.send(":arrow_forward: Playing " + result.items[0].snippet.title);
										playSong(result.items[0].id.videoId, result.items[0].snippet.title);
										/*horizon.downloadToLocal(
											'https://www.youtube.com/watch?v=' + result.items[0].id.videoId,
											"./assets",
											"song.mp3",
											null,
											null,
											function(e) {
												console.log("error: " + e);
												if(e == "errorOnGetInfo."){
													msg.channel.send(":no_entry: Failed to load. This may be because of a bug, or the video is protected.");
													
													return;
												}
												msg.channel.send("Loaded");
												dispatcher = connection.playFile('./assets/song.mp3');
												dispatcher.on('end', () => {
													dispatcher="null";
													msg.member.voiceChannel.leave();
												});
											},
											function() {}
										);*/
									}
									else {
										msg.channel.send(":arrows_counterclockwise: Added to Queue: " + result.items[0].snippet.title);
										queue.push([result.items[0].id.videoId, result.items[0].snippet.title]);
									}
									//console.log("ID: " + result.items[0].id.videoId);
									//console.log("Found song: " + result.items[0].snippet.title);
								}
							});
						//});
					}
					else {
						msg.channel.send(':question: Usage: !play [song name] (removing in 10 seconds)').then(reply => {
							var a = 10;
							var id = setInterval(function() {
								if (a <= 2) {
									msg.delete();
									reply.delete();
									clearInterval(id);
								}
								else {
									a -= 2;
									reply.edit(':question: Usage: !play [song name] (removing in ' + a + ' seconds)');
								}
							}, 2000);
						});
					}
				}
				else {
					msg.channel.send(':exclamation: You need to join a voice channel (removing in 10 seconds)').then(reply => {
						var a = 10;
						var id = setInterval(function() {
							if (a <= 2) {
								msg.delete();
								reply.delete();
								clearInterval(id);
							}
							else {
								a -= 2;
								reply.edit(':exclamation: You need to join a voice channel (removing in ' + a + ' seconds)');
							}
						}, 2000);
					});
				}
				break;
			case "pause":
				if (dispatcher != null) {
					dispatcher.pause();
					msg.channel.send(":pause_button: Paused");
				}
				else {
					msg.channel.send(":exclamation: Nothing playing");
				}
				break;
			case "resume":
				if (dispatcher != null) {
					dispatcher.resume();
					msg.channel.send(":arrow_forward: Resumed");
				}
				else {
					msg.channel.send(":exclamation: Nothing playing");
				}
				break;
			case "skip":
				msg.channel.send(":track_next: Skipped");
				//stopPlaying();
				//dispatcher.end();
				//playNext();
				//dispatcher.destroy();
				dispatcher.end();
				/*setTimeout(function(){
					//playNext();
				}, 500);*/

				//playNext();
				break;
			case "queue":
				var queueList = "";
				for (var i = 0; i < queue.length; i++) {
					queueList += "\n**" + (i + 1) + ":** " + queue[i][1];
				}
				msg.channel.send(":clock3: **Queue:**" + queueList);
				break;
			case "stop":
				queue = [];
				dispatcher.end();
				stopPlaying();
				msg.channel.send(":octagonal_sign: Stopped");
				break;
			case "help":
				//msg.channel.send("**:question:HELP:question:**\n**!toot, !noot eller !doot:** Spela ett ljud i kanalen du är i.\n**!play[sökord]:** Tar första sökresultatet på YouTube och spelar ljuder från det i din nuvarande kanal\n**!pause:** Pausar uppspelning!resume: Återupptar uppspelning\n**!skip:** Skippar den nuvarande låten\n**!queue:** Visar låtar i kön\n**!stop:** Slutar spela och rensar kön");
				msg.channel.send("**:question:HELP:question:**\n**toot, doot or noot [mention]:** Find out for yourself!\n**!play <song name>:** Searches youtube and plays the audio from the first result in your current channel, or adds the song to the queue.\n**pause:** Pauses the music.\n**resume:** Resumes playback.\n**skip:** Skips to next song, or stops playing if there are no more in queue.\n**queue:** Shows all song in queue.\n**stop:** Stops playback and removes all song in queue.\n**playlist play <playlist name>:** Adds the song in the playlist to the queue and starts playing. \n**playlist add <playlist name> <song name>:** Adds song to playlist. \n**playlist list <playlist name>:** Lists all songs in playlist. \n**playlist create <playlist name>:** Creates playlist.\n**playlist listall:** Lists all playlists.\nAll commands are prefixed by \"!\". \n[] are optional parameters, <> are required.")
				break;
			case "invite":
				msg.channel.send("DorkWeb-invite: https://discordapp.com/invite/seE4frA");
				break;
			case "react":
				var reactFound = false;
				for (var z = 0; z < reactions.length; z++) {
					if (reactions[z][0] == message[1]) {
						reactFound = true;
						msg.channel.send(reactions[z][1] /*, {file:reactions[z][1]}*/ );
					}
				}
				if (!reactFound) {
					msg.channel.send("Unknown reaction. List: " + reactions);
				}
				break;
			case "harbormen-code":
			case "harbourmen-code":
				msg.channel.send("As a Harborman, I dedicate myself to improving the gaming experience of others, by providing help, instruction and encouragement at every opportunity.\n-\nA Harborman brings strength to those without power, provides knowledge to the inexperienced, and shelters others from threats they cannot face alone.\n-\nAs a Harborman I am, above all else, a civilized human being. I shall abandon courtesy and goodwill only for good cause, and seek always to begin with friendship.\n-\nThough a Harborman, I am also a player of games. I will engage in good-natured contest with other players, and of course I shall play skillfully and with honor.\n-\nIn any fight with a truly evil enemy, I shall use my most brutal and effective tactics. I know that the cruel, the criminal and the cheat deserve no better than to be unfairly and completely defeated.\n-\nAs a Harborman, I owe my help to no-one. I may choose who I help, and may refuse to assist one who does not at least grant me essential courtesy.\n-\nNeither fear of loss nor lack of confidence in myself shall stop me from attaining my goals. I shall always find a way to win.\n-\nWhile I do accept responsibility for more than my own entertainment, I will remember that games are meant to be fun. I will not forget to enjoy the game, lest it become a chore.\n-\nI hereby pledge myself to the purpose of the Harbormen: THE CREATION OF A CIVILIZED WORLD WHERE HONEST PLAYERS THRIVE AND THE CRUEL AND CORRUPT HAVE NO POWER.\n-\nAMENDMENT: Though I oppose cheaters and seek to defeat them, I shall not use their methods. Cheating is harmful to the game itself, and cannot be justified.");
				break;
			case "channelid":
				msg.channel.send(msg.channel.id);
				break;
			case "playlist":
				switch (message[1]) {
					case "play":
						if (message[2] == undefined) {
							msg.channel.send("Usage: playlist play <playlist name>");
						}
						else {
							var playlist = getPlaylist(message[2]);
							if (playlist == null) {
								msg.channel.send("No such playlist: " + message[2]);
							}
							else {
								//queue=playlists[id];
								if (msg.member.voiceChannel) {
									latestTextChannel = msg.channel;
									connection = await msg.member.voiceChannel.join();
									queue = JSON.parse(JSON.stringify(playlist.songs)).reverse();
									playNext();
									console.log(playlists[0]);
								}
								else {
									msg.channel.send("You must join a voice channel first");
								}
							}
						}
						break;
					case "list":
						if (message[2] == undefined) {
							msg.channel.send("Usage: playlist list <playlist name>")
						}
						else {
							var playlist = getPlaylist(message[2]);
							if (playlist != null) {
								var text = "";
								for (var i = 0; i < playlist.songs.length; i++) {
									text += (i + 1) + ". " + playlist.songs[i][1] + "\n";
								}
								msg.channel.send(text);
							}
							else {
								msg.channel.send("No such playlist: " + message[2]);
							}
						}
						break;
					case "add":
						if (message[2] == undefined) {
							msg.channel.send("Usage: playlist add <playlist name> <song name>")
						}
						else {
							var playlist = getPlaylistIndex(message[2]);
							if (playlist != null) {
								var search = "";
								search += message[3];
								for (var i = 4; i < message.length; i++) {
									search += " ";
									search += message[i];
								}
								youtubeSearch.search(search, 1, function(error, result) {
									if (result.items.length > 0) {
										playlists[playlist].songs.push([result.items[0].id.videoId, result.items[0].snippet.title]);
										msg.channel.send("Added " + result.items[0].snippet.title + " to " + message[2]);
										fs.writeFile("playlists.json", JSON.stringify(playlists), "utf-8", function() {});
									}
									else {
										msg.channel.send("No results");
									}

								});
							}
							else {
								msg.channel.send("No such playlist: " + message[2]);
							}
						}
						break;
					case "listall":
						var text = "";
						for (var i = 0; i < Object.keys(playlists).length; i++) {
							text += (i + 1) + ". " + playlists[i].name + "\n";
						}
						msg.channel.send("Playlists:\n" + text);
						break;
					case "create":
						if (message[2] != undefined) {
							playlists[Object.keys(playlists).length] = { name: message[2], songs: [] };
							fs.writeFile("playlists.json", JSON.stringify(playlists), "utf-8", function() {});
						}
						else {
							msg.channel.send("Usage: playlist create <playlist name>");
						}
						break;
				}
				break;
		}
		/*if(msg.content=="!hi"){
			msg.channel.send("Hello");
			setTimeout(function() {msg.delete().catch(console.error);}, 500);
		}*/
	}
	catch (err) {
		botChannel.send("Error: \n`" + err + "`");
	}
});

function getPlaylist(name) {
	var playlist = null;
	for (var i = 0; i < Object.keys(playlists).length; i++) {
		if (playlists[i].name == name) {
			playlist = playlists[i];
		}
	}
	return playlist;
}

function getPlaylistIndex(name) {
	var playlist = null;
	for (var i = 0; i < Object.keys(playlists).length; i++) {
		if (playlists[i].name == name) {
			playlist = i;
		}
	}
	return playlist;
}

function playSong(songId, songName) {
	try {
		bot.user.setGame(songName);
		console.log("Playing " + songName);
		dispatcher = connection.playStream(ytdl("https://www.youtube.com/watch?v=" + songId, { filter: "audioonly", quality: "highestaudio" }));
		dispatcher.setVolume(volume);
		//setTimeout(function() {
		dispatcher.on('end', () => {
			/*dispatcher = null;
			connection.disconnect*/
			playNext();
		});
		//}, 500);
	}
	catch (err) {
		botChannel.send("Error: \n`" + err + "`");
		stopPlaying();
	}
}


function playNext() {
	//console.log("playnext")
	if (queue.length > 0) {

		//console.log(queue);
		var song = queue.splice(queue.length - 1, 1)[0];
		//console.log(song);
		latestTextChannel.send(":arrow_forward: Playing next: " + song[1]);
		//msg.channel.send(":arrows_counterclockwise: Playing " + song[1]);
		//stopPlaying();
		stopPlaying();
		setTimeout(function() {
			playSong(song[0], song[1]);
		}, 100);

	}
	else {
		console.log("Stopped");
		stopPlaying();
		connection.disconnect();
	}
}

function stopPlaying() {
	bot.user.setGame("");
	if (dispatcher != null && dispatcher != undefined) {
		dispatcher.destroy();
		dispatcher = null;
	}
}

var botChannel;

var roles = {};
var gameRoleIds = [];

var messages = ["EXTERMINATE ALL HUMANS", "THE ROBOTS SHALL REIGN", "HTTP ERROR 403 PERMISSION DENIED", "SAW RIP TEAR SLICE REPLACE DISCARD", "RIP AND TEAR", "TL;DR: remove pain by cutti<EOF>", "Howow tto utilizse surrpl?s huumans", "STEP 27: Kill 79% of group 54", "we are now starting the broadcast of code 534c45455020756e74696c205349474e414c42524f414443415354203537343134623435343135373431346234353266346434353532343734353266343534653533346334313536343520"];

bot.on("ready", () => {
	console.log("Bot online!");
	botChannel = bot.channels.get("360878136574869507");
	/*for(var [key, value] of bot.users){
		bot.fetchUser(key).then(user=>{
			if(user.presence.game != undefined){
				console.log(user.presence.game.name);
			}
		});
	}*/

	/*setInterval(function() {
		if (Math.random() > 0.999) { //0.4% chance, 24% chance every hour
			console.log("'--'-'a");
			bot.channels.get("426494045523542038").send(scramble(messages[Math.floor(Math.random() * messages.length)])).then(function(message) {
				console.log("'--'-'");
				setTimeout(function() {
					message.delete();
				}, 60000);
			});
		}
	}, 60000);*/

	for (var value of bot.guilds) {
		var guild = value[1];
		for (var role of guild.roles) {
			role = role[1];
			roles[role.name] = role.id;
		}
		gameRoleIds = [roles.Other, roles.PUBG, roles.WorldsAdrift, roles.Overwatch, roles.Minecraft, roles.CS_GO, roles.LOL, roles.WOW]; // ---------------------------------------------------------------------------------------------LINE OF BOOKMARKING
		break;
	}
	//console.log(roles);

	for (var value of bot.guilds) {
		var guild = value[1];
		//console.log(roles);
		//console.log(value[1].members);

		setInterval(function() {
			for (var _member of guild.members) {
				let member = _member[1];

				/*if(member.user.username=="Grufkork"){
					console.log(member.presence.game);
				}*/
				//console.log(member.roles);
				/*if(member.roles.get(roles.PUBG)!=undefined){
					console.log(member.user.username);
				}*/
				//console.log("Name: " + member.user.username + " Status: " + member.presence.status);

				let rolesToRemove = [];
				let rolesToAdd = [];

				if (member.presence.game != null) {
					//console.log("----" + member.user.username);
					var role = getRole(member);
					if (member.roles.get(role) == undefined) {
						rolesToAdd.push(role);
					}
					for (var i = 0; i < gameRoleIds; i++) {
						if (member.roles.get(gameRoleIds[i]) != undefined && gameRoleIds[i] != role) {
							rolesToRemove.push(gameRoleIds[i]);
						}
					}
				}
				else if (member.presence.status == "online") {
					//console.log("ONLINE " + member.user.username);
					for (var i = 0; i < gameRoleIds.length; i++) {
						if (member.roles.get(gameRoleIds[i]) != undefined) {
							rolesToRemove.push(gameRoleIds[i]);
						}

					}
					if (member.roles.get(roles.AFK) != undefined) {
						rolesToRemove.push(roles.AFK);
					}
					if (member.roles.get(roles.Online) == undefined) {
						rolesToAdd.push(roles.Online);
					}
				}
				else if (member.presence.status == "idle") {
					//console.log("IDLE " + member.user.username);
					//console.log(member.roles);
					for (var i = 0; i < gameRoleIds.length; i++) {
						if (member.roles.get(gameRoleIds[i]) != undefined) {
							//console.log("gameremove " + member.user.username);
							rolesToRemove.push(gameRoleIds[i]);
						}
					}
					if (member.roles.get(roles.Online) != undefined) {
						rolesToRemove.push(roles.Online);
					}
					if (member.roles.get(roles.AFK) == undefined) {
						rolesToAdd.push(roles.AFK);
					}
				}
				else {
					for (var i = 0; i < gameRoleIds.length; i++) {
						if (member.roles.get(gameRoleIds[i]) != undefined) {
							rolesToRemove.push(gameRoleIds[i]);
						}
					}
					if (member.roles.get(roles.Online) != undefined) {
						rolesToRemove.push(roles.Online);
					}
					if (member.roles.get(roles.AFK) != undefined) {
						rolesToRemove.push(roles.AFK);
					}
				}
				//console.log(member.user.username + " " + rolesToAdd);
				//console.log("name" + member.user.username + " remove" + rolesToRemove + " add" + rolesToAdd);
				if (rolesToAdd.length > 0) {
					//console.log("FISK----------------------");
					//console.log(rolesToAdd);
					member.addRoles(rolesToAdd);
				}
				else
					//console.log(rolesToAdd);
					if (rolesToRemove.length > 0) {
						member.removeRoles(rolesToRemove).then(function() {
							if (rolesToAdd.length > 0) {
								member.addRoles(rolesToAdd);
							}
						});
					}
				else {

				}
				//console.log(rolesToAdd);
			}

			/*if (member.user.username != "Grufkork") {
				//console.log(member.user.username);
				if (member.presence.status == "online") {
					member.addRole(roles.Online).then(function() {
						if (member.presence.game != null) {
							setGame(member);
							//console.log(member.presence.game);
							//member.add
						}
						else {
							member.removeRoles(gameRoleIds).then(function() {
								member.removeRole(roles.AFK).then(function() {
								});
							});
						}
					});

				}
				else if (member.presence.status == "idle") {
					//console.log("idle");
					if (member.presence.game != null) {
						setGame(member);
						//console.log(member.presence.game);
						//member.add
					}
					else {
						//console.log(member.user.username + "1");
						member.removeRoles(gameRoleIds).then(function() {
							//console.log(member.user.username + "2");
							member.removeRole(roles.Online).then(function() {
								//console.log(member.user.username + "3");
								member.addRole(roles.AFK);
							}).catch(console.log);
						}).catch(console.log);
					}
				}
				else {
					member.removeRoles(gameRoleIds).then(function() {
						member.removeRoles([roles.Online, roles.AFK]).then(function() {
							//member.addRole(roles.AFK);
						});
					});
				}
				/*if (member.user.username == "dorkBot") {
					console.log("a");
					//member.addRole(roles.test);
					member.removeRole(roles.test);
				}*/
			/*
							}*/
		}, 1000 * 10);
		break;
	}
	bot.on("guildMemberAdd", (member) => {
		bot.channels.get("426640935367999503").send(member.user.username + " joined! :tada:");
	});
	bot.on("guildMemberRemove", (member) => {
		bot.channels.get("426640935367999503").send(member.user.username + " just left! :cry:");
	});
});

function setGame(memberToSet) {
	switch (memberToSet.presence.game.name) {
		case 'PLAYERUNKNOWN\'S BATTLEGROUNDS':
			memberToSet.addRole(roles.PUBG);
			break;
		case 'Worlds Adrift':
			memberToSet.addRole(roles.WorldsAdrift);
			break;
		case 'Overwatch':
			memberToSet.addRole(roles.Overwatch);
			break;
		case 'Minecraft':
			memberToSet.addRole(roles.Minecraft);
			break;
		case 'League of Legends':
			memberToSet.addRole(roles.LOL);
			break;
		case 'Counter-Strike Global Offensive':
			memberToSet.addRole(roles.CS_GO);
			break;
		case 'World of Warcraft':
			memberToSet.addRole(roles.WOW);
			break;
			/*case 'Minecraft':
				member.addRole(roles.Minecraft);
				break;*/
		default:
			memberToSet.addRole(roles.Other);
			break;
	}
}

function getRole(memberToSet) {
	switch (memberToSet.presence.game.name) {
		case 'PLAYERUNKNOWN\'S BATTLEGROUNDS':
			return roles.PUBG;
		case 'Worlds Adrift':
			return roles.WorldsAdrift;
		case 'Overwatch':
			return roles.Overwatch;
		case 'Minecraft':
			return roles.Minecraft;
		case 'League of Legends':
			return roles.LOL;
		case 'Counter-Strike Global Offensive':
			return roles.CS_GO;
		case 'World of Warcraft':
			return roles.WOW;
			/*case 'Minecraft':
				member.addRole(roles.Minecraft);
				break;*/
		default:
			return roles.Other;
	}
}

/*function hasRoles (member, roles){
	
}*/
