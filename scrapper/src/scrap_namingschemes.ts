import * as cheerio from "cheerio";
import { ask_kindly } from "./req_cache";
import { ask_the_wise_lama } from "./wise_lama_explain_to_me";
import { rejects } from "assert";

export async function scrap_namingschemes() {
	const namingschemes = await ask_kindly('https://namingschemes.com/Main_Page')
	if (namingschemes === null) {
		return null;
	}

	const visited = new Set<string>()
	visited.add('/Main_Page');

	const namingschemes_words: { [word: string]: string } = {};

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
			const clean_source = source.replace('/', '');
			namingschemes_words[word.replace(/[^\w-]/, '')] = clean_source;
		}
	}

	await Promise.all(sub_docs_promises);
	const bad: { word: string, error: Error }[] = [];
	const ok: { [word: string]: string[] } = {};

	console.time('namingschemes-wise-lama');
	let i = 0;
	let j = 0;
	const max = Object.keys(namingschemes_words).length
	const BATCH_SIZE = 20
	const batches_count = Math.floor(max / 20);
	for (let batch = 0; batch < batches_count; batch++) {
		const lama_promises: Array<Promise<void>> = [];
		for (const [word, set] of Object.entries(namingschemes_words).slice(batch * BATCH_SIZE, (batch + 1) * BATCH_SIZE)) {
			lama_promises.push(ask_adjectives(word, set, batch))
		}
		await Promise.all(lama_promises);
	}
	async function ask_adjectives(word: string, set: string, batch: number): Promise<void> {
		const question = `Compile a list of adjectives that describe the word "${word}", This word was taken from a group of words called "${set}". Answer only with a valid JSON array of strings. Don't provide any other explanation. Don't add Code Block.`;
		const wise_response = await ask_the_wise_lama(question)
		try {
			const adjectives = JSON.parse(wise_response);
			if (!(Array.isArray(adjectives) && adjectives.every(item => typeof item === 'string'))) throw "Bad Lama BAD!"
			ok[word] = adjectives;
			console.clear()
			console.log('batch:', batch);
			console.log(word.padEnd(25, '.'), `${(i / max * 100).toFixed(2)}%`, i, '/', max)
			i++;
		} catch (error) {
			bad.push({ word, error });
		}
	}

	console.timeEnd('namingschemes-wise-lama');
	return { bad, ok };
}
