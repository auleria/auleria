import { Remote } from "../../Remote";
import { GameObject } from "../../GameObject";
import { ByteBuffer } from "../../ByteBuffer";
import { Classes } from "../../Classes";

@Classes.register
export class DebugObject extends GameObject
{
	@Remote.monitor(Remote.DIRECTION.BI)
	public name : string;

	constructor(name : string = "Hank")
	{
		super();
		this.name = name;
	}

	public initialize(): void {
		console.log("Debug object created! :D");
	}

	public writeToBuffer(bb : ByteBuffer)
	{
		this.transform.writeToBuffer(bb);
		return true;
	}

	public tick(): void {
		
	}

	public update(): void {

	}

	public destroy(): void {
		throw new Error('Method not implemented.');
	}
}
