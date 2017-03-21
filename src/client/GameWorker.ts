import { GameWorld } from "./game/GameWorld";
import { DebugWorld } from "./game/worlds/DebugWorld";
import { Remote } from "./Remote";

export class GameWorker
{
	private world : GameWorld;

	constructor()
	{
		this.createWorld();
	}

	private sendMessage()
	{

	}

	private createWorld()
	{
		this.world = new DebugWorld();
		this.world.initialize();

		let creationData = this.world.getCreationData();
		console.log("World data:", creationData);
		this.sendMessage();
	}
}
