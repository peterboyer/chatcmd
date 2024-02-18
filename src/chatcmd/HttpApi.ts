import http from "node:http";
import type { Env } from "../chatcmd";

type Options = {
	env: Env;
	onChat?: (message: string) => void;
};

export async function createHttpApi({ env, onChat }: Options): Promise<void> {
	http
		.createServer((request, response) => {
			const pathname = request.url;
			if (!pathname) {
				response.statusCode = 500;
				response.end();
				return;
			}

			if (pathname === "/chat") {
				let message = "";
				request.on("data", (chunk) => {
					message += chunk;
				});
				request.on("end", () => {
					if (!message) {
						response.statusCode = 400;
						response.end();
						return;
					}

					onChat?.(message);
					response.statusCode = 204;
					response.end();
				});
			}
		})
		.listen(env.HTTP_PORT, env.HTTP_HOST, () => {
			console.log("HttpApi: started");
		});
}
