
import { GameMaster } from "./GameMaster";

export class GameSlave
{
	private master : GameMaster;

	public useMaster(master : GameMaster)
	{
		this.master = master;
	}
}