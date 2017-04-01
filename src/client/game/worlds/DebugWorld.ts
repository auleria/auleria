
import { GameWorld } from "../GameWorld";
import { DebugObject } from "../objects/DebugObject";
import { Remote } from "../../Remote";
import { Classes } from "../../Classes";

@Classes.register
export class DebugWorld extends GameWorld
{
	constructor(isMaster : boolean)
	{
		super(isMaster);
		this.add(new DebugObject());
		this.add(new DebugObject("Toni"));
		this.add(new DebugObject("Rita"));
	}
}
