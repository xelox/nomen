// To not be a super duper bad person, and to avoid being flagged as a bot
// I will try to cache requests made so that I won't spam the servers that I am scrapping :)

import axios from "axios";

export async function ask_kindly(url: string): Promise<string | null> {
	try {
		const path = `./cache/${btoa(url)}.html`;
		const file = Bun.file(path);
		if (await file.exists()) {
			console.log(url, 'was found in cache.')
			return await file.text();
		} else {
			const response = (await axios.get(url)).data;
			if (typeof response !== 'string') throw 'not a string'
			await Bun.write(file, response)
			return response
		}
	} catch (err) {
		console.error(`faild to request data at ${url}`, err)
		return null
	}
}
