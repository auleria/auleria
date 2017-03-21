
import { GameWorld } from "../GameWorld";
import { DebugObject } from "../objects/DebugObject";
import { Remote } from "../../Remote";

export class DebugWorld extends GameWorld
{
	constructor()
	{
		super();
		this.add(new DebugObject());
		this.add(new DebugObject("Toni"));
		this.add(new DebugObject("Rita"));
	}
}
