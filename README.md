# NEON POINTS TRANSFER


## SETUP

Simple open source bot for the Neon evm point program.

- Open Terminal 

- Type `mkdir ~/Desktop/Neon-bot`

- Type `cd ~/Desktop/Neon-bot`

- Type `git clone https://github.com/RoyAyo/neon-transfer.git .`

- Type `npm install`


## HOW TO USE

-  Open the folder you just created on your Desktop and Create a file called private_keys.json, you can also use `touch private_keys.json` in your terminal.

- Copy the content of example.private_keys.json and paste it in your private_keys.json file. Change the public key and private key to your actual details, you can name each wallet what you want.

- NB: Keep this keys confidential and do not share, the keys are only required to your sign your transactions and will not leave your device.

- Create an environmental file called .env or use `touch .env` in your terminal. (If you can't find it, Show hidden files in the folder).

- open the .env file, For Devnet, paste `env=dev`; For Mainnet, paste `env=prod`.

## WRAPPING AND UNWRAPPING

- If you want to convert your public keys to WNeon, run `npm run start wrap`. This will convert every public key in your private_keys.json file. It defaults to 10 Neon

- If you want to include the amount of Neon to wrap `npm run start wrap 15`, this will wrap 15 Neon to WNeon in each public key in your private_keys.json file.

- To specify the Addresses you want to wrap, use `npm run start wrap 15 PUB_KEY1 PUB_KEY2`. The specified pub key must be in your private_keys.json file. It will wrap 15 Neon to WNeon for both address.

The same instructions apply for Unwrapping, just use `npm run start unwrap` instead of wrap.

## APPROVING TOKEN

- For the very first time, you need to approve all your tokens. run `npm run start allowance`. It will approve the tokens. You don't need to run again unless some of them fail.

## RUNNING TRANSACTIONS

- You should ensure to have enough WNeon before starting this.

- You should simply run `npm run start`, this will start trading between WNeon and Usdt.

- If you only want to run for a few addresses do `npm run start main PUB_KEY1 PUB_KEY2 PUB_KEY3`.

# CONSTANTS

The default no of transactions can be found in `src/utils/constants.ts`.

- NEON_AMOUNT= The amount of wrapped neon to convert to usdt.
- NEON_MOVED_PER_SET = How many times Neon should transact to usdt before moving usdt back (Keep it moderate, recommend: 3-5)
- NO_OF_SETS = How many times the above process should run.

- Change the above as needed, save and re-run.

i.e Move Neon_amount for neon_moved_per_set times to usdt, move usdt back, then repeat the process no of set times.

- There are other constants like slippage and all.

# NOTE

- Network can be slow and transactions may fail for differents reasons. These transactions will attempt to restart a couple of times and stop.

- You can always re-run, cancel instruction with `ctrl + c` and rerun.