import * as cheerio from "cheerio";
import { ask_kindly } from "./req_cache";
import { exit } from "process";
const namingschemes = await ask_kindly('https://namingschemes.com/Main_Page')
if (!namingschemes === null) {
	exit("can't procede, no naming scheme.")
}
console.log(namingschemes)
