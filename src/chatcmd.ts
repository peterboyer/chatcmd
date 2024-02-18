import dotenv from "dotenv";
import { Output, object, parse, string, transform } from "valibot";
import { createHttpApi } from "./chatcmd/HttpApi";
import { createTwitchClient } from "./chatcmd/TwitchClient";

export type Env = Output<typeof EnvSchema>;
const EnvSchema = object({
	TWITCH_USER: string(),
	TWITCH_REFRESH_TOKEN: string(),
	TWITCH_CHANNEL: string(),
	TWITCH_APP_CLIENT_ID: string(),
	TWITCH_APP_CLIENT_SECRET: string(),
	DAEMON_PORT: transform(string(), (input) => parseInt(input)),
	DAEMON_HOST: string(),
});

dotenv.config();
const env = parse(EnvSchema, process.env);

async function main(): Promise<void> {
	const client = await createTwitchClient({
		env,
	});
	createHttpApi({
		env,
		onChat: (message) => client.say(message),
	});
}

main();
