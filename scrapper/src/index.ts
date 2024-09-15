import { scrap_namingschemes } from "./scrap_namingschemes";
import { ask_the_wise_lama } from "./wise_lama_explain_to_me";

const from_namingschemes = await scrap_namingschemes()
console.log(from_namingschemes);

