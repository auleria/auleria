
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
			let eventID = buffer.readByte();

			switch (eventID)
			{
				case NetworkCode.CREATE_WORLD:
					this.createWorld(buffer.readString(), buffer.readId(), buffer);
					break;
				case NetworkCode.WORLD_DATA:
					this.updateWorld(buffer.readId(), buffer);
					break;
				default:
					abort = true;
					console.warn("Got unknown event id:", eventID);
			}
		}
	}

	public createWorld(type : string, id : string, buffer : ByteBuffer)
	{
		console.log("World created! type:", type, "id:", id);
		let worldType = Classes.getClass(type);
		let world = new worldType(id, false) as GameWorld;
		let bytecount = buffer.readInt32();
		buffer.limit(buffer.position + bytecount);
		world.initialize();
		world.readFromBuffer(buffer);
		buffer.removeLimit();
		this.worlds.set(id, world);
	}

	public updateWorld(id : string, buffer : ByteBuffer)
	{
		let world = this.worlds.get(id);
		let bytecount = buffer.readInt32();
		buffer.limit(buffer.position + bytecount);
		world.readFromBuffer(buffer);
		buffer.removeLimit();
	}
}
