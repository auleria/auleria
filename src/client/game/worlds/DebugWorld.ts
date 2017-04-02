
import { GameWorld } from "../GameWorld";
import { DebugObject } from "../objects/DebugObject";
import { Remote } from "../../Remote";
import { Classes } from "../../Classes";

@Classes.register
export class DebugWorld extends GameWorld
{
	public initialize()
	{
		if (this.isMaster)
		{
			for (let i = 0; i < 20; i++)
			{
				this.add(new DebugObject(i.toString()));
			}
		}
	}
}
