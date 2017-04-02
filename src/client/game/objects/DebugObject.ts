import { Remote } from "../../Remote";
import { GameObject } from "../../GameObject";
import { ByteBuffer } from "../../ByteBuffer";
import { Classes } from "../../Classes";

@Classes.register
export class DebugObject extends GameObject
{
	public name : string;

	constructor(name : string = "Hankerino")
	{
		super();
		this.name = name;
	}

	public initialize(): void {
		console.log("Debug object created! My name is", this.name, "and my id is", this.id);
	}

	public writeToBuffer(buffer : ByteBuffer)
	{
		buffer.writeString(this.name);
		return true;
	}

	public readFromBuffer(buffer : ByteBuffer)
	{
		this.name = buffer.readString();
	}

	public tick(): void {
	}

	public update(): void {
	}

	public destroy(): void {
		throw new Error('Method not implemented.');
	}
}
