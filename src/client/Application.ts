import { Helper } from "./Helper";
import { GameManager } from "./GameManager";
import { GameWorker } from "./GameWorker";
import { Tween } from "./Tween";
import { Commands } from "./Commands";

declare let Peer : any;

main();
async function main()
{
	if (isWorker())
	{
		console.log("Importing three.js into the wroker...");
		importScripts("/three/three.min.js");
		console.log("Done!");

		let worker = new GameWorker();
	}
	else
	{

		let id = getHashParameter("id");
		let host = getHashParameter("host");

		let gameManager = new GameManager();
		await gameManager.prepareNetwork(id);

		if (host)
		{
			let remote = await gameManager.connectToRemote(host);
			let worlds = (await remote.request("worlds")).worlds;
			try
			{
				let world = await gameManager.openWorld(remote, worlds[0]);
				gameManager.setMainWorld(world);
				document.body.appendChild(gameManager.canvas);
			}
			catch(e)
			{
				alert("No no, this world is not for you");
			}
		}
		else
		{
			let world = await gameManager.createWorld();
			gameManager.setMainWorld(world);

			document.body.appendChild(gameManager.canvas);
		}
	}
}

function getHashParameter(name : string) : any
{
	let params = location.hash.substr(1).split("&");

	let value = false as any;

	params.find(str => {
		if (str.startsWith(name))
		{
			let split = str.split("=");
			value = split.length > 1 ? split[1] : false;
			return true;
		}
		return false;
	});

	return value;
}

function isWorker()
{
	return typeof importScripts === "function";
}
