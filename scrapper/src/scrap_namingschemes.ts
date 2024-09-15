import * as cheerio from "cheerio";
import { ask_kindly } from "./req_cache";

export async function scrap_namingschemes() {
	const namingschemes = await ask_kindly('https://namingschemes.com/Main_Page')
	if (namingschemes === null) {
		return null;
	}

	const visited = new Set<string>()
	visited.add('/Main_Page');

	const namingschemes_words = new Set<string>();

	const doc = cheerio.load(namingschemes);
	const sub_docs_promises: Promise<void>[] = [];
	for (const item of doc('li > a')) {
		const href = doc(item).prop('href');
		if (href === undefined) continue;
		const link = decodeURIComponent(href);
		if (!link.startsWith('/') || link.includes(':') || link.includes('.')) continue;
		if (visited.has(link)) continue;
		visited.add(link);

		sub_docs_promises.push(scrap_naming_scheme(link));
	}

	async function scrap_naming_scheme(source: string) {
		const page = await ask_kindly(`https://namingschemes.com${source}`);
		if (page === null) {
			console.error('faild to visit', source);
			return
		}
		const doc = cheerio.load(page);
		for (const ele of doc('#content ul > li')) {
			const word = doc(ele).text().split(' ')[0];
			if (word.startsWith('http')) continue;
			namingschemes_words.add(`${source} ${word}`.replace(/[^\w-]/, ''))
		}
	}

	await Promise.all(sub_docs_promises);
	return namingschemes_words;
}
