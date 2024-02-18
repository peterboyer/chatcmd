import tmi from "tmi.js";
import type { Env } from "../chatcmd";
import { number, object, parse, string } from "valibot";

export type TwitchClient = {
	say: (message: string) => void;
};

type Options = {
	env: Env;
};

export async function createTwitchClient({
	env,
}: Options): Promise<TwitchClient> {
	async function getAuthToken(): Promise<[string, { expiresInMs: number }]> {
		const response = await fetch(TWITCH_OAUTH_TOKEN_URL, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				client_id: env.TWITCH_APP_CLIENT_ID,
				client_secret: env.TWITCH_APP_CLIENT_SECRET,
				grant_type: "refresh_token",
				refresh_token: env.TWITCH_REFRESH_TOKEN,
			}),
		});
		const { access_token, expires_in } = parse(
			TwitchOAuthTokenResponseSchema,
			await response.json(),
		);
		const expiresInMs = expires_in * 1000;
		return [access_token, { expiresInMs }];
	}

	let client: tmi.Client | undefined = undefined;

	let pendingMessage: string | undefined = undefined;

	async function flushPendingMessage() {
		if (pendingMessage && client && client.readyState() === "OPEN") {
			await client.say(env.TWITCH_CHANNEL, pendingMessage);
			pendingMessage = undefined;
		}
	}

	async function main() {
		if (client) {
			console.log("TwitchClient: reauthenticating ...");
			await client.disconnect();
		} else {
			console.log("TwitchClient: connecting ...");
		}

		const [authToken, { expiresInMs }] = await getAuthToken();
		const _10s = 10_000;
		const timeoutMs = expiresInMs - _10s;
		setTimeout(main, timeoutMs);

		client = new tmi.client({
			identity: {
				username: env.TWITCH_USER,
				password: authToken,
			},
			channels: [env.TWITCH_CHANNEL],
		});

		client.on("message", (_channel, userstate, message) => {
			console.log(`[${userstate.username}] ${message.trim()}`);
		});

		await client.connect();
		console.log("TwitchClient: connected");
		setTimeout(() => flushPendingMessage(), 500);
	}

	main();

	const say: TwitchClient["say"] = async (message) => {
		pendingMessage = message.trim();
		flushPendingMessage();
	};

	return {
		say,
	};
}

const TWITCH_OAUTH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const TwitchOAuthTokenResponseSchema = object({
	access_token: string(),
	expires_in: number(), // seconds
});
