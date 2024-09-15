import { exit } from "process";

let wise_lama_is_live: boolean | undefined = undefined;
async function assert_wise_lama_is_running() {
	if (wise_lama_is_live !== undefined) {
		return
	}
	const options: RequestInit = {
		method: 'POST',
		headers: [["Content-Type", "application/json"]],
		body: JSON.stringify({
			model: 'llama3',
			messages: [
				{ role: 'user', content: 'say hi!' }
			],
			stream: false
		})
	}
	try {
		await fetch('http://localhost:11434/api/chat', options)
		wise_lama_is_live = true;
	} catch (err) {
		console.error(err)
		exit('the wise lama is not running!');
	}
}

export async function ask_the_wise_lama(questions: [string]): Promise<string> {
	await assert_wise_lama_is_running();
	const options: RequestInit = {
		method: 'POST',
		body: JSON.stringify({
			model: 'llama3',
			messages: questions.map(q => { return { role: 'user', content: q } }),
			stream: false
		})
	}
	const wise_response = await fetch('http://localhost:11434/api/chat', options);
	return await wise_response.json()
}
