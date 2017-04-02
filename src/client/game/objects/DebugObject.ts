import { Remote } from "../../Remote";
import { GameObject } from "../../GameObject";
import { ByteBuffer } from "../../ByteBuffer";
import { Classes } from "../../Classes";

@Classes.register
export class DebugObject extends GameObject
{
	public name : string;
	private text : HTMLDivElement;
	private x : number;

	constructor(name : string = "Hankerino")
	{
		super();
		this.name = name;
	}

	public initialize(): void {
		if (this.isMaster)
		{
			this.x = Math.random();
		}
		else
		{
			this.text = document.createElement("div");
			this.text.innerHTML = this.name;
			this.text.style.width = "200px";
			document.body.appendChild(this.text);
		}
	}

	public writeToBuffer(buffer : ByteBuffer)
	{
		buffer.writeString(this.name);
		buffer.writeFloat(this.x);
		return true;
	}

	public readFromBuffer(buffer : ByteBuffer)
	{
		this.name = buffer.readString();
		this.x = buffer.readFloat();
	}

	public tick(): void {
		this.x += 0.1;
	}

	public update(): void {
		this.text.style.transform = "translateX(" + (Math.sin(this.x) * 10) + "px)";
	}

	public destroy(): void {
		throw new Error('Method not implemented.');
	}
}
