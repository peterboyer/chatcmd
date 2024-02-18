# chatcmd

## Usage

```
yarn install        # install deps
yarn start          # run
yarn dev            # run, watching for code changes
```

## Config

```
TWITCH_USER="..."               # chat user's username
TWITCH_REFRESH_TOKEN="..."      # refresh token from twitch cli (for user)
TWITCH_CHANNEL="..."            # target chat channel to send messages to
TWITCH_APP_CLIENT_ID="..."      # your twitch developer app's client id
TWITCH_APP_CLIENT_SECRET="..."  # your twitch developer app's client secret
DAEMON_PORT="4111"              # local port to use for http api
DAEMON_HOST="0.0.0.0"           # local host to use for http api
```

### Refresh Token

Using the [Twitch CLI](https://dev.twitch.tv/docs/cli/).

```
twitch token -u -s 'chat:read chat:edit'
```

### App Client Id and Secret

Using the [Twitch Console > Apps](https://dev.twitch.tv/console/apps).

- See [Registering Your App](https://dev.twitch.tv/docs/authentication/register-app/).

## Send Messages

```
curl http://localhost:4111/chat --data "hello world"
```

## Send Messages from Vim

### Vim Usage

```
:Chat hello world
```

### Vim Config

```
vim.cmd([[
function! Chat(message)
	silent execute "!curl --silent http://localhost:4111/chat --data" "\"" a:message "\""
	echo ""
endfunction
command! -nargs=+ Chat call Chat(<q-args>)
]])
```
