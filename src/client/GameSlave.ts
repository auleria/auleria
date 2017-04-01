
import { GameMaster } from "./GameMaster";
import { ByteBuffer } from "./ByteBuffer";
import { NetworkCode } from "./NetworkCode";
import { GameWorld } from "./game/GameWorld";
import { Classes } from "./Classes";

export class GameSlave
{
	private master : GameMaster;
	private worlds = new Map<string, GameWorld>();

	public useMaster(master : GameMaster)
	{
		this.master = master;
		this.master.setListener(buffer => this.handleMessage(buffer));
	}

	public handleMessage(buffer: ByteBuffer)
	{
		let abort = false;
		while (buffer.gotData() && !abort)
		{
			try
			{
				let eventID = buffer.readByte();
				let type, id;
				switch (eventID)
				{
					case NetworkCode.CREATE_WORLD:
						type = buffer.readString();
						id = buffer.readId();
						console.log("World created! type:", type, "id:", id);
						let worldType = Classes.getClass(type).type;
						let world = new worldType();
						abort = true;
						break;
					case NetworkCode.WORLD_DATA:
						id = buffer.readId();
					default:
						abort = true;
				}
			}
			catch (e)
			{
				console.error("Frame broken, scrapping.");
			}
		}
	}
}