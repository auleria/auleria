
import { GameMaster } from "./GameMaster";
import { ByteBuffer } from "./ByteBuffer";
import { NetworkCode } from "./NetworkCode";
import { GameWorld } from "./game/GameWorld";
import { Classes } from "./Classes";

export class GameSlave
{
	private master : GameMaster;
	private worlds = new Map<string, GameWorld>();
	private _requestFullSync = false;
	private responseBuffer : ByteBuffer;

	public useMaster(master : GameMaster)
	{
		this.master = master;
		this.master.setListener(buffer => this.handleMessage(buffer));
		this.responseBuffer = new ByteBuffer();
		this.render();
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

	private requestFullSync()
	{
		this._requestFullSync = true;
	}

	public createWorld(type : string, id : string, buffer : ByteBuffer)
	{
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
		if (!world)
		{
			console.log("Uknown world,", id, ",skipping update. Requesting new full sync");
			return buffer.moveForward(bytecount);
		}
		buffer.limit(buffer.position + bytecount);
		world.readFromBuffer(buffer);
		buffer.removeLimit();
	}

	public render()
	{
		requestAnimationFrame(() => this.render());
		this.update();
	}

	public update()
	{
		this.responseBuffer.writeByte(NetworkCode.PING);

		for (let kvp of this.worlds)
		{
			let world = kvp[1];
			world.update();
		}

		if (this._requestFullSync)
		{
			this._requestFullSync = false;
			this.responseBuffer.writeByte(NetworkCode.FULL_SYNC);
		}

		if (this.responseBuffer.position !== 0)
		{
			this.master.sendMessage(this.responseBuffer);
			this.responseBuffer = new ByteBuffer();
		}
	}
}
