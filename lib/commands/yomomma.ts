"use strict";

import Classes from "../Classes";
import { Message, RichEmbed } from "discord.js";

export const command = new Classes.Command({
	name: "yomomma",
	desc: "Fetch a joke (external api)",
	usage: "yomomma",
	exp: /^!yo(mm?(o|a)mm?a)?$/i,
	category: "Utility",
	data: {
		cache: new Classes.CacheBank("yomomma", null, true, false)
	},
	body: async function body(message: Message, vale: Classes.Vale) {
		let repl = Classes.failsafe.bind(message);

		try {
			let reply: string = this.data.cache.get() || await Classes.fetch("https://api.yomomma.info/"),
				embed: RichEmbed = new RichEmbed();
			
			Classes.fetch("https://api.yomomma.info/").then((reply: string) => this.data.cache.push(reply));
		
			embed.setColor("RANDOM")
				.setTitle("Yomomma!")
				.setAuthor("Vale3", vale.client.user.displayAvatarURL, "https://github.com/Valen-H/Vale-3")
				.setThumbnail(vale.client.user.avatarURL)
				.setURL("https://yomomma.info/")
				.setTimestamp()
				.setDescription(JSON.parse(reply).joke);
			
			repl({ embed });
		} catch (err) {
			repl("External API error, please try again later... https://yomomma.info/");
			console.error(err);
		}
	}, //body
});

export async function init(vale: Classes.Vale) {
	command.usage = vale.opts.config.prefix + command.usage;
	command.exp = new RegExp('^' + vale.opts.config.prefix + "yo(mm?(o|a)mm?a)?$", "i");
	Classes.fetch("https://api.yomomma.info/").then((reply: string) => command.data.cache.push(reply));

	return command;
} //init

export default init;