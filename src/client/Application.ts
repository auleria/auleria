import {GameWorker} from "./GameWorker";
import {GameSlave} from "./GameSlave";
import {GameMaster} from "./GameMaster";

let isWorker = () =>
{
	return typeof importScripts === "function";
}

if (isWorker())
{
	console.log("I'm a worker!");
	let worker = new GameWorker();
}
else
{
	console.log("I'm not a worker!");
	let slave = new GameSlave();
	let master = GameMaster.CreateFromWorker();

	slave.useMaster(master);
}
